"""
Test Suite for Registry CRUD, Admin Chat, and FloatingChat features
Tests for KAIF OZERO Consumer Cooperative
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "admin1234"
SELLER_EMAIL = "seller@test.com"
SELLER_PASSWORD = "test1234"
BUYER_EMAIL = "buyer@test.com"
BUYER_PASSWORD = "test1234"


class TestAuthEndpoints:
    """Test authentication for admin and shareholder users"""
    
    def test_admin_login(self):
        """Login as admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_seller_login(self):
        """Login as seller/shareholder user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SELLER_EMAIL,
            "password": SELLER_PASSWORD
        })
        assert response.status_code == 200, f"Seller login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"✓ Seller login successful: {data['user']['email']}, role: {data['user']['role']}")
    
    def test_buyer_login(self):
        """Login as buyer/client user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": BUYER_EMAIL,
            "password": BUYER_PASSWORD
        })
        assert response.status_code == 200, f"Buyer login failed: {response.text}"
        data = response.json()
        assert "token" in data
        print(f"✓ Buyer login successful: {data['user']['email']}, role: {data['user']['role']}")


@pytest.fixture(scope="module")
def admin_token():
    """Get admin token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin login failed")


@pytest.fixture(scope="module")
def seller_token():
    """Get seller token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": SELLER_EMAIL,
        "password": SELLER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Seller login failed")


@pytest.fixture(scope="module")
def buyer_token():
    """Get buyer token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": BUYER_EMAIL,
        "password": BUYER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Buyer login failed")


class TestRegistryCRUD:
    """Test Registry CRUD endpoints - Admin operations"""
    
    def test_get_registry_as_admin(self, admin_token):
        """Admin should see all registry entries"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/registry", headers=headers)
        assert response.status_code == 200, f"Failed to get registry: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view registry: {len(data)} entries found")
    
    def test_create_registry_entry_as_admin(self, admin_token):
        """Admin should be able to create registry entries"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        test_entry = {
            "name": "TEST_Тестовый Пайщик",
            "shareholder_number": "TEST-001",
            "inn": "1234567890",
            "phone": "+7 999 123 4567",
            "email": "test_shareholder@example.com",
            "pai_amount": 50000,
            "status": "active",
            "join_date": "2024-01-15",
            "notes": "Тестовая запись"
        }
        response = requests.post(f"{BASE_URL}/api/registry", headers=headers, json=test_entry)
        assert response.status_code == 200, f"Failed to create registry entry: {response.text}"
        data = response.json()
        assert "entry_id" in data
        assert data["name"] == test_entry["name"]
        assert data["shareholder_number"] == test_entry["shareholder_number"]
        assert data["pai_amount"] == test_entry["pai_amount"]
        print(f"✓ Created registry entry: {data['entry_id']}")
        return data["entry_id"]
    
    def test_update_registry_entry_as_admin(self, admin_token):
        """Admin should be able to update registry entries"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # First create an entry
        test_entry = {
            "name": "TEST_Обновляемый Пайщик",
            "shareholder_number": "TEST-UPD-001",
            "pai_amount": 25000,
            "status": "active"
        }
        create_response = requests.post(f"{BASE_URL}/api/registry", headers=headers, json=test_entry)
        assert create_response.status_code == 200
        entry_id = create_response.json()["entry_id"]
        
        # Update the entry
        update_data = {
            "name": "TEST_Обновленный Пайщик",
            "pai_amount": 75000,
            "status": "suspended"
        }
        update_response = requests.put(f"{BASE_URL}/api/registry/{entry_id}", headers=headers, json=update_data)
        assert update_response.status_code == 200, f"Failed to update registry entry: {update_response.text}"
        updated = update_response.json()
        assert updated["name"] == update_data["name"]
        assert updated["pai_amount"] == update_data["pai_amount"]
        assert updated["status"] == update_data["status"]
        print(f"✓ Updated registry entry: {entry_id}")
    
    def test_delete_registry_entry_as_admin(self, admin_token):
        """Admin should be able to delete registry entries"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # First create an entry to delete
        test_entry = {
            "name": "TEST_Удаляемый Пайщик",
            "shareholder_number": "TEST-DEL-001",
            "pai_amount": 10000
        }
        create_response = requests.post(f"{BASE_URL}/api/registry", headers=headers, json=test_entry)
        assert create_response.status_code == 200
        entry_id = create_response.json()["entry_id"]
        
        # Delete the entry
        delete_response = requests.delete(f"{BASE_URL}/api/registry/{entry_id}", headers=headers)
        assert delete_response.status_code == 200, f"Failed to delete registry entry: {delete_response.text}"
        
        # Verify deletion - should not find entry
        get_response = requests.get(f"{BASE_URL}/api/registry/{entry_id}", headers=headers)
        assert get_response.status_code == 404
        print(f"✓ Deleted and verified removal of entry: {entry_id}")
    
    def test_seller_cannot_create_registry(self, seller_token):
        """Non-admin should NOT be able to create registry entries"""
        headers = {"Authorization": f"Bearer {seller_token}", "Content-Type": "application/json"}
        test_entry = {
            "name": "TEST_Unauthorized Entry",
            "shareholder_number": "UNAUTH-001"
        }
        response = requests.post(f"{BASE_URL}/api/registry", headers=headers, json=test_entry)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin correctly blocked from creating registry entries")


class TestRegistryShareholderView:
    """Test Registry view for shareholders (read-only)"""
    
    def test_shareholder_can_view_registry(self, seller_token):
        """Shareholder should be able to view registry (their entries)"""
        headers = {"Authorization": f"Bearer {seller_token}"}
        response = requests.get(f"{BASE_URL}/api/registry", headers=headers)
        # Should return 200 for shareholder or 403 for client
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Shareholder can view registry: {len(data)} entries visible")
        else:
            print("✓ Registry access restricted for this user role")


class TestAdminChat:
    """Test Admin Chat functionality"""
    
    def test_send_message_to_admin(self, seller_token):
        """User should be able to send message to admin"""
        headers = {"Authorization": f"Bearer {seller_token}", "Content-Type": "application/json"}
        message = {"content": "TEST_Тестовое сообщение администратору"}
        response = requests.post(f"{BASE_URL}/api/admin-chat", headers=headers, json=message)
        assert response.status_code == 200, f"Failed to send message: {response.text}"
        data = response.json()
        assert "message_id" in data
        assert data["content"] == message["content"]
        print(f"✓ Message sent to admin: {data['message_id']}")
    
    def test_user_can_get_admin_chat(self, seller_token):
        """User should be able to get their chat messages"""
        headers = {"Authorization": f"Bearer {seller_token}"}
        response = requests.get(f"{BASE_URL}/api/admin-chat", headers=headers)
        assert response.status_code == 200, f"Failed to get chat: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ User can view their admin chat: {len(data)} messages")
    
    def test_admin_can_view_all_chat_messages(self, admin_token):
        """Admin should see all chat messages"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin-chat", headers=headers)
        assert response.status_code == 200, f"Failed to get admin chat: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin can view all chat messages: {len(data)} messages")
    
    def test_admin_can_send_reply(self, admin_token):
        """Admin should be able to send messages"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        message = {"content": "TEST_Ответ администратора"}
        response = requests.post(f"{BASE_URL}/api/admin-chat", headers=headers, json=message)
        assert response.status_code == 200, f"Failed to send admin reply: {response.text}"
        data = response.json()
        assert data["sender_role"] == "admin"
        print(f"✓ Admin sent reply: {data['message_id']}")


class TestCleanup:
    """Cleanup test data after tests"""
    
    def test_cleanup_test_registry_entries(self, admin_token):
        """Remove TEST_ prefixed registry entries"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/registry", headers=headers)
        if response.status_code == 200:
            entries = response.json()
            deleted_count = 0
            for entry in entries:
                if entry.get("name", "").startswith("TEST_") or entry.get("shareholder_number", "").startswith("TEST"):
                    del_response = requests.delete(f"{BASE_URL}/api/registry/{entry['entry_id']}", headers=headers)
                    if del_response.status_code == 200:
                        deleted_count += 1
            print(f"✓ Cleanup: Deleted {deleted_count} test registry entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
