#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class CoopCatalogTester:
    def __init__(self, base_url="https://coop-catalog.preview.emergentagent.com"):
        self.base_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    result = response.json() if response.content else {}
                    return success, result
                except:
                    return success, {"message": "No JSON response"}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return success, {}

        except Exception as e:
            print(f"❌ FAILED - Network Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def authenticate_admin(self):
        """Login as admin and get token"""
        print("\n🔐 Admin Authentication")
        success, response = self.run_test(
            "Admin Login",
            "POST", 
            "auth/login",
            200,
            {"email": "admin@test.com", "password": "admin1234"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"✅ Admin token obtained: {self.admin_token[:20]}...")
            return True
        print("❌ Admin login failed")
        return False

    def test_knowledge_base_apis(self):
        """Test Knowledge Base CRUD APIs"""
        print("\n📚 TESTING KNOWLEDGE BASE APIs")
        
        auth_headers = {"Authorization": f"Bearer {self.admin_token}"}
        kb_doc_id = None
        
        # Test GET knowledge base (public)
        success, docs = self.run_test(
            "List KB Documents (Public)",
            "GET",
            "knowledge-base",
            200
        )
        
        # Test GET by category 
        for category in ["catalogs", "documents", "council_decisions", "meetings", "contracts"]:
            self.run_test(
                f"List KB Documents - {category}",
                "GET",
                f"knowledge-base?category={category}",
                200
            )

        # Test POST knowledge base (admin only)
        success, result = self.run_test(
            "Create KB Document (Admin)",
            "POST",
            "knowledge-base",
            200,
            {
                "title": "Test Knowledge Base Document",
                "category": "documents", 
                "description": "Test description for KB doc",
                "file_url": "https://example.com/test.pdf",
                "content": "Test content for knowledge base"
            },
            auth_headers
        )
        
        if success and 'doc_id' in result:
            kb_doc_id = result['doc_id']
            
            # Test GET specific document
            self.run_test(
                "Get KB Document by ID",
                "GET",
                f"knowledge-base/{kb_doc_id}",
                200
            )
            
            # Test PUT knowledge base (admin only)
            self.run_test(
                "Update KB Document (Admin)",
                "PUT",
                f"knowledge-base/{kb_doc_id}",
                200,
                {
                    "title": "Updated KB Document",
                    "description": "Updated description"
                },
                auth_headers
            )
            
            # Test DELETE knowledge base (admin only)
            self.run_test(
                "Delete KB Document (Admin)",
                "DELETE",
                f"knowledge-base/{kb_doc_id}",
                200,
                headers=auth_headers
            )

        # Test unauthorized access
        self.run_test(
            "Create KB Document (Unauthorized)",
            "POST",
            "knowledge-base", 
            403,
            {"title": "Test", "category": "documents"}
        )

    def test_news_apis(self):
        """Test News CRUD APIs"""
        print("\n📰 TESTING NEWS APIs")
        
        auth_headers = {"Authorization": f"Bearer {self.admin_token}"}
        news_id = None
        
        # Test GET news (public)
        self.run_test(
            "List News Items (Public)",
            "GET",
            "news",
            200
        )
        
        # Test GET with limit
        self.run_test(
            "List News Items with Limit",
            "GET", 
            "news?limit=3",
            200
        )

        # Test POST news (admin only)
        success, result = self.run_test(
            "Create News Item (Admin)",
            "POST",
            "news",
            200,
            {
                "title": "Test News Item",
                "description": "Test news description",
                "image_url": "https://example.com/news.jpg",
                "audio_url": "https://example.com/news.mp3",
                "content": "Full news article content"
            },
            auth_headers
        )
        
        if success and 'news_id' in result:
            news_id = result['news_id']
            
            # Test GET specific news item
            self.run_test(
                "Get News Item by ID",
                "GET",
                f"news/{news_id}",
                200
            )
            
            # Test PUT news (admin only)
            self.run_test(
                "Update News Item (Admin)",
                "PUT",
                f"news/{news_id}",
                200,
                {
                    "title": "Updated News Title",
                    "description": "Updated description"
                },
                auth_headers
            )
            
            # Test DELETE news (admin only)
            self.run_test(
                "Delete News Item (Admin)",
                "DELETE",
                f"news/{news_id}",
                200,
                headers=auth_headers
            )

        # Test unauthorized access
        self.run_test(
            "Create News Item (Unauthorized)",
            "POST",
            "news",
            403,
            {"title": "Test", "description": "Test"}
        )

    def test_ticker_apis(self):
        """Test Ticker CRUD APIs"""
        print("\n📜 TESTING TICKER APIs")
        
        auth_headers = {"Authorization": f"Bearer {self.admin_token}"}
        ticker_id = None
        
        # Test GET ticker (public)
        self.run_test(
            "List Ticker Items (Public)",
            "GET",
            "ticker",
            200
        )

        # Test POST ticker (admin only)
        success, result = self.run_test(
            "Create Ticker Item (Admin)",
            "POST",
            "ticker",
            200,
            {"text": "Breaking news: Test ticker message for automated testing"},
            auth_headers
        )
        
        if success and 'ticker_id' in result:
            ticker_id = result['ticker_id']
            
            # Test DELETE ticker (admin only)
            self.run_test(
                "Delete Ticker Item (Admin)",
                "DELETE",
                f"ticker/{ticker_id}",
                200,
                headers=auth_headers
            )

        # Test unauthorized access
        self.run_test(
            "Create Ticker Item (Unauthorized)",
            "POST",
            "ticker",
            403,
            {"text": "Unauthorized ticker"}
        )

    def test_existing_features(self):
        """Quick test of existing core APIs to ensure no regression"""
        print("\n🔍 TESTING EXISTING FEATURES (Regression)")
        
        # Test products categories
        self.run_test(
            "Get Product Categories",
            "GET",
            "products/categories", 
            200
        )
        
        # Test products list
        self.run_test(
            "List Products",
            "GET",
            "products",
            200
        )
        
        # Test auth endpoints
        self.run_test(
            "Get Current User Info",
            "GET",
            "auth/me",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )

def main():
    print("🚀 COOPERATIVE CATALOG - NEW FEATURES TESTING")
    print("=" * 60)
    
    tester = CoopCatalogTester()
    
    # Step 1: Authenticate as admin
    if not tester.authenticate_admin():
        print("\n❌ CRITICAL: Admin authentication failed. Cannot proceed with admin-only tests.")
        return 1
    
    # Step 2: Test new Knowledge Base APIs
    tester.test_knowledge_base_apis()
    
    # Step 3: Test new News APIs  
    tester.test_news_apis()
    
    # Step 4: Test new Ticker APIs
    tester.test_ticker_apis()
    
    # Step 5: Regression test existing features
    tester.test_existing_features()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for i, fail in enumerate(tester.failed_tests, 1):
            print(f"{i}. {fail.get('test', 'Unknown')}")
            if 'expected' in fail:
                print(f"   Expected: {fail['expected']}, Got: {fail['actual']}")
            if 'error' in fail:
                print(f"   Error: {fail['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())