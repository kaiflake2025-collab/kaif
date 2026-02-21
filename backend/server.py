from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'kaif-ozero-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 168  # 7 days

app = FastAPI()
api_router = APIRouter(prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.get("/health")
async def api_health_check():
    return {"status": "healthy"}

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str = "client"  # client, shareholder
    phone: Optional[str] = None
    shareholder_number: Optional[str] = None
    inn: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    shareholder_number: Optional[str] = None
    inn: Optional[str] = None

class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    price: Optional[float] = None
    currency: str = "RUB"
    region: Optional[str] = None
    contacts: Optional[str] = None
    images: List[str] = []
    tags: List[str] = []
    exchange_available: bool = False

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    region: Optional[str] = None
    contacts: Optional[str] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    exchange_available: Optional[bool] = None

class DealCreate(BaseModel):
    product_id: str
    deal_type: str = "buy"  # buy, exchange
    message: Optional[str] = None
    offered_product_id: Optional[str] = None

class MeetingRequest(BaseModel):
    product_id: str
    preferred_date: Optional[str] = None
    message: Optional[str] = None

class MessageCreate(BaseModel):
    receiver_id: str
    content: str
    deal_id: Optional[str] = None

# ============ AUTH HELPERS ============

def create_jwt(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user

    # Check Authorization header (JWT)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # First check if it's a session token
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
        # Then try JWT
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
            if user:
                return user
        except jwt.ExpiredSignatureError:
            pass
        except jwt.InvalidTokenError:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")

async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "phone": data.phone,
        "shareholder_number": data.shareholder_number,
        "inn": data.inn,
        "avatar": None,
        "is_blocked": False,
        "is_verified": data.role == "client",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)

    token = create_jwt(user_id, data.role)
    user_response = {k: v for k, v in user_doc.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": user_response}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Account blocked")

    token = create_jwt(user["user_id"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": user_response}

@api_router.post("/auth/session")
async def exchange_session(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = resp.json()

    email = data["email"]
    name = data.get("name", "")
    picture = data.get("picture", "")
    session_token = data["session_token"]

    # Find or create user
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "avatar": picture,
            "role": "client",
            "phone": None,
            "shareholder_number": None,
            "inn": None,
            "is_blocked": False,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
        user = await db.users.find_one({"email": email}, {"_id": 0})
    else:
        await db.users.update_one({"email": email}, {"$set": {"name": name, "avatar": picture}})
        user = await db.users.find_one({"email": email}, {"_id": 0})

    # Store session
    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user["user_id"],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    user_response = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    response = JSONResponse(content={"user": user_response, "token": session_token})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )
    return response

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    user_response = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return user_response

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    resp = JSONResponse(content={"message": "Logged out"})
    resp.delete_cookie("session_token", path="/")
    return resp

# ============ PRODUCTS ENDPOINTS ============

@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    region: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {"status": "active"}
    if category:
        query["category"] = category
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price

    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    # Attach seller info
    for p in products:
        seller = await db.users.find_one({"user_id": p.get("seller_id")}, {"_id": 0, "password_hash": 0})
        p["seller"] = seller

    return {"products": products, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/products/categories")
async def get_categories():
    categories = [
        {"id": "food", "name_ru": "Продукты питания", "name_en": "Food & Agriculture", "name_zh": "食品与农业", "icon": "apple"},
        {"id": "services", "name_ru": "Услуги", "name_en": "Services", "name_zh": "服务", "icon": "wrench"},
        {"id": "construction", "name_ru": "Строительство", "name_en": "Construction", "name_zh": "建筑", "icon": "building"},
        {"id": "transport", "name_ru": "Транспорт", "name_en": "Transport", "name_zh": "交通运输", "icon": "truck"},
        {"id": "electronics", "name_ru": "Электроника", "name_en": "Electronics", "name_zh": "电子产品", "icon": "cpu"},
        {"id": "clothing", "name_ru": "Одежда", "name_en": "Clothing", "name_zh": "服装", "icon": "shirt"},
        {"id": "health", "name_ru": "Здоровье", "name_en": "Health & Wellness", "name_zh": "健康与保健", "icon": "heart-pulse"},
        {"id": "education", "name_ru": "Образование", "name_en": "Education", "name_zh": "教育", "icon": "graduation-cap"},
        {"id": "realestate", "name_ru": "Недвижимость", "name_en": "Real Estate", "name_zh": "房地产", "icon": "home"},
        {"id": "other", "name_ru": "Другое", "name_en": "Other", "name_zh": "其他", "icon": "package"}
    ]
    return categories

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    seller = await db.users.find_one({"user_id": product.get("seller_id")}, {"_id": 0, "password_hash": 0})
    product["seller"] = seller
    return product

@api_router.post("/products")
async def create_product(data: ProductCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in ("shareholder", "admin"):
        raise HTTPException(status_code=403, detail="Only shareholders can create products")

    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = {
        "product_id": product_id,
        "seller_id": user["user_id"],
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "price": data.price,
        "currency": data.currency,
        "region": data.region,
        "contacts": data.contacts,
        "images": data.images,
        "tags": data.tags,
        "exchange_available": data.exchange_available,
        "status": "active",
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    product_doc.pop("_id", None)
    return product_doc

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["seller_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["seller_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.products.delete_one({"product_id": product_id})
    return {"message": "Product deleted"}

@api_router.get("/my-products")
async def get_my_products(user: dict = Depends(get_current_user)):
    products = await db.products.find({"seller_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return products

# ============ DEALS ENDPOINTS ============

@api_router.post("/deals")
async def create_deal(data: DealCreate, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"product_id": data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    deal_id = f"deal_{uuid.uuid4().hex[:12]}"
    amount = product.get("price", 0) or 0
    commission_total = round(amount * 0.015, 2)
    commission_coop = round(amount * 0.009, 2)
    commission_manager = round(amount * 0.006, 2)

    deal_doc = {
        "deal_id": deal_id,
        "product_id": data.product_id,
        "product_title": product.get("title", ""),
        "buyer_id": user["user_id"],
        "buyer_name": user.get("name", ""),
        "seller_id": product["seller_id"],
        "deal_type": data.deal_type,
        "status": "pending",
        "amount": amount,
        "currency": product.get("currency", "RUB"),
        "commission_total": commission_total,
        "commission_coop": commission_coop,
        "commission_manager": commission_manager,
        "message": data.message,
        "offered_product_id": data.offered_product_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.deals.insert_one(deal_doc)
    deal_doc.pop("_id", None)
    return deal_doc

@api_router.get("/deals")
async def list_deals(user: dict = Depends(get_current_user)):
    query = {"$or": [{"buyer_id": user["user_id"]}, {"seller_id": user["user_id"]}]}
    deals = await db.deals.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return deals

@api_router.put("/deals/{deal_id}/confirm")
async def confirm_deal(deal_id: str, user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"deal_id": deal_id}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal["seller_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.deals.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Deal confirmed"}

@api_router.put("/deals/{deal_id}/complete")
async def complete_deal(deal_id: str, user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"deal_id": deal_id}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal["seller_id"] != user["user_id"] and deal["buyer_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.deals.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "completed", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Deal completed"}

@api_router.put("/deals/{deal_id}/cancel")
async def cancel_deal(deal_id: str, user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"deal_id": deal_id}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal["seller_id"] != user["user_id"] and deal["buyer_id"] != user["user_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.deals.update_one(
        {"deal_id": deal_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Deal cancelled"}

# ============ MEETINGS ENDPOINTS ============

@api_router.post("/meetings")
async def request_meeting(data: MeetingRequest, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"product_id": data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    meeting_id = f"meet_{uuid.uuid4().hex[:12]}"
    meeting_doc = {
        "meeting_id": meeting_id,
        "product_id": data.product_id,
        "product_title": product.get("title", ""),
        "client_id": user["user_id"],
        "client_name": user.get("name", ""),
        "seller_id": product["seller_id"],
        "representative_id": None,
        "status": "pending",
        "preferred_date": data.preferred_date,
        "message": data.message,
        "result": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.meetings.insert_one(meeting_doc)
    meeting_doc.pop("_id", None)
    return meeting_doc

@api_router.get("/meetings")
async def list_meetings(user: dict = Depends(get_current_user)):
    if user["role"] in ("admin", "representative"):
        meetings = await db.meetings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    else:
        query = {"$or": [{"client_id": user["user_id"]}, {"seller_id": user["user_id"]}]}
        meetings = await db.meetings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return meetings

@api_router.put("/meetings/{meeting_id}/assign")
async def assign_representative(meeting_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] not in ("admin", "representative"):
        raise HTTPException(status_code=403, detail="Not authorized")
    body = await request.json()
    rep_id = body.get("representative_id", user["user_id"])
    await db.meetings.update_one(
        {"meeting_id": meeting_id},
        {"$set": {"representative_id": rep_id, "status": "assigned"}}
    )
    return {"message": "Representative assigned"}

@api_router.put("/meetings/{meeting_id}/complete")
async def complete_meeting(meeting_id: str, request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    await db.meetings.update_one(
        {"meeting_id": meeting_id},
        {"$set": {"status": "completed", "result": body.get("result", "")}}
    )
    return {"message": "Meeting completed"}

# ============ FAVORITES ENDPOINTS ============

@api_router.post("/favorites/{product_id}")
async def add_favorite(product_id: str, user: dict = Depends(get_current_user)):
    existing = await db.favorites.find_one(
        {"user_id": user["user_id"], "product_id": product_id}, {"_id": 0}
    )
    if existing:
        return {"message": "Already in favorites"}
    await db.favorites.insert_one({
        "user_id": user["user_id"],
        "product_id": product_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{product_id}")
async def remove_favorite(product_id: str, user: dict = Depends(get_current_user)):
    await db.favorites.delete_one({"user_id": user["user_id"], "product_id": product_id})
    return {"message": "Removed from favorites"}

@api_router.get("/favorites")
async def get_favorites(user: dict = Depends(get_current_user)):
    favs = await db.favorites.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    product_ids = [f["product_id"] for f in favs]
    products = await db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0}).to_list(1000)
    for p in products:
        seller = await db.users.find_one({"user_id": p.get("seller_id")}, {"_id": 0, "password_hash": 0})
        p["seller"] = seller
    return products

# ============ MESSAGES ENDPOINTS ============

@api_router.post("/messages")
async def send_message(data: MessageCreate, user: dict = Depends(get_current_user)):
    msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    msg_doc = {
        "message_id": msg_id,
        "sender_id": user["user_id"],
        "sender_name": user.get("name", ""),
        "receiver_id": data.receiver_id,
        "content": data.content,
        "deal_id": data.deal_id,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg_doc)
    msg_doc.pop("_id", None)
    return msg_doc

@api_router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user), other_user_id: Optional[str] = None):
    if other_user_id:
        query = {"$or": [
            {"sender_id": user["user_id"], "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user["user_id"]}
        ]}
    else:
        query = {"$or": [{"sender_id": user["user_id"]}, {"receiver_id": user["user_id"]}]}
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return messages

@api_router.get("/messages/conversations")
async def get_conversations(user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"$or": [{"sender_id": user["user_id"]}, {"receiver_id": user["user_id"]}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {"$cond": [{"$eq": ["$sender_id", user["user_id"]]}, "$receiver_id", "$sender_id"]},
            "last_message": {"$first": "$content"},
            "last_date": {"$first": "$created_at"},
            "unread": {"$sum": {"$cond": [{"$and": [{"$eq": ["$receiver_id", user["user_id"]]}, {"$eq": ["$read", False]}]}, 1, 0]}}
        }}
    ]
    convos = await db.messages.aggregate(pipeline).to_list(100)
    result = []
    for c in convos:
        other = await db.users.find_one({"user_id": c["_id"]}, {"_id": 0, "password_hash": 0})
        result.append({
            "user": other,
            "last_message": c["last_message"],
            "last_date": c["last_date"],
            "unread": c["unread"]
        })
    return result

# ============ ADMIN ENDPOINTS ============

@api_router.get("/admin/users")
async def admin_list_users(user: dict = Depends(get_current_user), role: Optional[str] = None):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/block")
async def admin_block_user(user_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    target = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    new_blocked = not target.get("is_blocked", False)
    await db.users.update_one({"user_id": user_id}, {"$set": {"is_blocked": new_blocked}})
    return {"message": f"User {'blocked' if new_blocked else 'unblocked'}"}

@api_router.put("/admin/users/{user_id}/verify")
async def admin_verify_user(user_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.users.update_one({"user_id": user_id}, {"$set": {"is_verified": True}})
    return {"message": "User verified"}

@api_router.put("/admin/users/{user_id}/role")
async def admin_change_role(user_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    new_role = body.get("role")
    if new_role not in ("client", "shareholder", "representative", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": new_role}})
    return {"message": f"Role changed to {new_role}"}

@api_router.get("/admin/products")
async def admin_list_products(user: dict = Depends(get_current_user), status: Optional[str] = None):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    query = {}
    if status:
        query["status"] = status
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return products

@api_router.put("/admin/products/{product_id}/status")
async def admin_product_status(product_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    new_status = body.get("status")
    if new_status not in ("active", "pending", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.products.update_one({"product_id": product_id}, {"$set": {"status": new_status}})
    return {"message": f"Product status changed to {new_status}"}

@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    total_users = await db.users.count_documents({})
    total_shareholders = await db.users.count_documents({"role": "shareholder"})
    total_clients = await db.users.count_documents({"role": "client"})
    total_products = await db.products.count_documents({})
    active_products = await db.products.count_documents({"status": "active"})
    total_deals = await db.deals.count_documents({})
    completed_deals = await db.deals.count_documents({"status": "completed"})
    pending_deals = await db.deals.count_documents({"status": "pending"})

    # Calculate total revenue and commission
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": None,
            "total_amount": {"$sum": "$amount"},
            "total_commission": {"$sum": "$commission_total"}
        }}
    ]
    agg = await db.deals.aggregate(pipeline).to_list(1)
    revenue_data = agg[0] if agg else {"total_amount": 0, "total_commission": 0}

    total_meetings = await db.meetings.count_documents({})
    pending_meetings = await db.meetings.count_documents({"status": "pending"})

    return {
        "users": {"total": total_users, "shareholders": total_shareholders, "clients": total_clients},
        "products": {"total": total_products, "active": active_products},
        "deals": {"total": total_deals, "completed": completed_deals, "pending": pending_deals},
        "revenue": {"total_amount": revenue_data.get("total_amount", 0), "total_commission": revenue_data.get("total_commission", 0)},
        "meetings": {"total": total_meetings, "pending": pending_meetings}
    }

@api_router.get("/admin/deals")
async def admin_list_deals(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    deals = await db.deals.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return deals

# ============ USER PROFILE ============

@api_router.put("/users/profile")
async def update_profile(data: UserUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.get("/users/{user_id}/public")
async def get_public_profile(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0, "email": 0, "phone": 0, "inn": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    products_count = await db.products.count_documents({"seller_id": user_id, "status": "active"})
    completed_deals = await db.deals.count_documents({"seller_id": user_id, "status": "completed"})
    user["products_count"] = products_count
    user["completed_deals"] = completed_deals
    return user

# ============ STATS FOR SHAREHOLDER ============

@api_router.get("/shareholder/stats")
async def shareholder_stats(user: dict = Depends(get_current_user)):
    if user["role"] not in ("shareholder", "admin"):
        raise HTTPException(status_code=403, detail="Shareholder only")

    products_count = await db.products.count_documents({"seller_id": user["user_id"]})
    active_products = await db.products.count_documents({"seller_id": user["user_id"], "status": "active"})

    pipeline = [
        {"$match": {"seller_id": user["user_id"]}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"}
        }}
    ]
    deal_stats = await db.deals.aggregate(pipeline).to_list(10)

    total_views = 0
    products = await db.products.find({"seller_id": user["user_id"]}, {"_id": 0, "views": 1}).to_list(1000)
    for p in products:
        total_views += p.get("views", 0)

    meetings_count = await db.meetings.count_documents({"seller_id": user["user_id"]})

    return {
        "products": {"total": products_count, "active": active_products},
        "deals": deal_stats,
        "total_views": total_views,
        "meetings": meetings_count
    }

# ============ KNOWLEDGE BASE ENDPOINTS ============

KB_CATEGORIES = ["catalogs", "documents", "council_decisions", "meetings", "contracts"]

class KBDocCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    content: Optional[str] = None

@api_router.get("/knowledge-base")
async def list_kb_docs(category: Optional[str] = None):
    query = {}
    if category and category in KB_CATEGORIES:
        query["category"] = category
    docs = await db.knowledge_base.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api_router.get("/knowledge-base/{doc_id}")
async def get_kb_doc(doc_id: str):
    doc = await db.knowledge_base.find_one({"doc_id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@api_router.post("/knowledge-base")
async def create_kb_doc(data: KBDocCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if data.category not in KB_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    doc_id = f"kb_{uuid.uuid4().hex[:12]}"
    doc = {
        "doc_id": doc_id,
        "title": data.title,
        "category": data.category,
        "description": data.description,
        "file_url": data.file_url,
        "content": data.content,
        "created_by": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.knowledge_base.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/knowledge-base/{doc_id}")
async def update_kb_doc(doc_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    update_data = {k: v for k, v in body.items() if k in ("title", "description", "file_url", "content", "category")}
    if update_data:
        await db.knowledge_base.update_one({"doc_id": doc_id}, {"$set": update_data})
    updated = await db.knowledge_base.find_one({"doc_id": doc_id}, {"_id": 0})
    return updated

@api_router.delete("/knowledge-base/{doc_id}")
async def delete_kb_doc(doc_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.knowledge_base.delete_one({"doc_id": doc_id})
    return {"message": "Document deleted"}

# ============ NEWS ENDPOINTS ============

class NewsCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    content: Optional[str] = None

@api_router.get("/news")
async def list_news(limit: int = 20):
    news = await db.news.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return news

@api_router.get("/news/{news_id}")
async def get_news_item(news_id: str):
    item = await db.news.find_one({"news_id": news_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    return item

@api_router.post("/news")
async def create_news(data: NewsCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    news_id = f"news_{uuid.uuid4().hex[:12]}"
    item = {
        "news_id": news_id,
        "title": data.title,
        "description": data.description,
        "image_url": data.image_url,
        "audio_url": data.audio_url,
        "content": data.content,
        "created_by": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.news.insert_one(item)
    item.pop("_id", None)
    return item

@api_router.put("/news/{news_id}")
async def update_news(news_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    update_data = {k: v for k, v in body.items() if k in ("title", "description", "image_url", "audio_url", "content")}
    if update_data:
        await db.news.update_one({"news_id": news_id}, {"$set": update_data})
    updated = await db.news.find_one({"news_id": news_id}, {"_id": 0})
    return updated

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.news.delete_one({"news_id": news_id})
    return {"message": "News deleted"}

# ============ TICKER ENDPOINTS ============

class TickerCreate(BaseModel):
    text: str

@api_router.get("/ticker")
async def get_ticker():
    items = await db.ticker.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api_router.post("/ticker")
async def create_ticker(data: TickerCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    ticker_id = f"tick_{uuid.uuid4().hex[:12]}"
    item = {
        "ticker_id": ticker_id,
        "text": data.text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ticker.insert_one(item)
    item.pop("_id", None)
    return item

@api_router.delete("/ticker/{ticker_id}")
async def delete_ticker(ticker_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.ticker.delete_one({"ticker_id": ticker_id})
    return {"message": "Ticker deleted"}

# ============ SHAREHOLDER REGISTRY ENDPOINTS ============

class RegistryEntryCreate(BaseModel):
    user_id: Optional[str] = None
    name: str
    shareholder_number: str
    inn: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    pai_amount: Optional[float] = 0
    status: str = "active"
    join_date: Optional[str] = None
    notes: Optional[str] = None

@api_router.get("/registry")
async def list_registry(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        entries = await db.registry.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    elif user["role"] == "shareholder":
        # Shareholder sees only their own entry
        entries = await db.registry.find(
            {"$or": [{"user_id": user["user_id"]}, {"email": user.get("email")}, {"shareholder_number": user.get("shareholder_number", "")}]},
            {"_id": 0}
        ).to_list(100)
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    return entries

@api_router.get("/registry/{entry_id}")
async def get_registry_entry(entry_id: str, user: dict = Depends(get_current_user)):
    entry = await db.registry.find_one({"entry_id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if user["role"] != "admin" and entry.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return entry

@api_router.post("/registry")
async def create_registry_entry(data: RegistryEntryCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    entry_id = f"reg_{uuid.uuid4().hex[:12]}"
    entry = {
        "entry_id": entry_id,
        "user_id": data.user_id,
        "name": data.name,
        "shareholder_number": data.shareholder_number,
        "inn": data.inn,
        "phone": data.phone,
        "email": data.email,
        "pai_amount": data.pai_amount,
        "status": data.status,
        "join_date": data.join_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.registry.insert_one(entry)
    entry.pop("_id", None)
    return entry

@api_router.put("/registry/{entry_id}")
async def update_registry_entry(entry_id: str, request: Request, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    allowed = ("name", "shareholder_number", "inn", "phone", "email", "pai_amount", "status", "join_date", "notes", "user_id")
    update_data = {k: v for k, v in body.items() if k in allowed}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.registry.update_one({"entry_id": entry_id}, {"$set": update_data})
    updated = await db.registry.find_one({"entry_id": entry_id}, {"_id": 0})
    return updated

@api_router.delete("/registry/{entry_id}")
async def delete_registry_entry(entry_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    await db.registry.delete_one({"entry_id": entry_id})
    return {"message": "Entry deleted"}

# ============ ADMIN CHAT ENDPOINTS ============

@api_router.post("/admin-chat")
async def send_admin_chat(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    msg_id = f"achat_{uuid.uuid4().hex[:12]}"
    msg = {
        "message_id": msg_id,
        "sender_id": user["user_id"],
        "sender_name": user.get("name", ""),
        "sender_role": user["role"],
        "content": body.get("content", ""),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admin_chat.insert_one(msg)
    msg.pop("_id", None)
    return msg

@api_router.get("/admin-chat")
async def get_admin_chat(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        messages = await db.admin_chat.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    else:
        messages = await db.admin_chat.find(
            {"$or": [{"sender_id": user["user_id"]}, {"sender_role": "admin"}]},
            {"_id": 0}
        ).sort("created_at", -1).limit(50).to_list(50)
    messages.reverse()
    return messages

# Include router
app.include_router(api_router)

# CORS must be after router inclusion
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command("ping")
        logger.info("MongoDB connection established successfully")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
