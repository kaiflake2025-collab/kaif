#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import time

class CoopCatalogTester:
    def __init__(self, base_url="https://coop-catalog.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.test_data = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
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
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                self.log(f"❌ FAILED - {error_msg}", "ERROR")
                self.failures.append(f"{name}: {error_msg}")
                return False, {}

        except requests.exceptions.RequestException as e:
            error_msg = f"Request failed: {str(e)}"
            self.log(f"❌ FAILED - {error_msg}", "ERROR") 
            self.failures.append(f"{name}: {error_msg}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("\n=== TESTING AUTHENTICATION ENDPOINTS ===", "INFO")
        
        # Test user registration
        test_users = [
            {"email": "test.seller@test.com", "password": "test1234", "name": "Test Seller", "role": "shareholder"},
            {"email": "test.buyer@test.com", "password": "test1234", "name": "Test Buyer", "role": "client"},
            {"email": "test.admin@test.com", "password": "admin1234", "name": "Test Admin", "role": "admin"}
        ]
        
        for user_data in test_users:
            success, response = self.run_test(
                f"Register {user_data['role']} user",
                "POST", "auth/register", 200, user_data
            )
            if success and 'token' in response:
                self.tokens[user_data['role']] = response['token']
                self.user_ids[user_data['role']] = response['user']['user_id']
                self.log(f"✅ {user_data['role']} token saved")
        
        # Test with existing test users if registration failed
        existing_users = [
            {"email": "seller@test.com", "password": "test1234", "role": "shareholder"},
            {"email": "buyer@test.com", "password": "test1234", "role": "client"}, 
            {"email": "admin@test.com", "password": "admin1234", "role": "admin"}
        ]
        
        for user_data in existing_users:
            success, response = self.run_test(
                f"Login {user_data['role']} user",
                "POST", "auth/login", 200, 
                {"email": user_data["email"], "password": user_data["password"]}
            )
            if success and 'token' in response:
                self.tokens[user_data['role']] = response['token'] 
                self.user_ids[user_data['role']] = response['user']['user_id']
                self.log(f"✅ {user_data['role']} token saved")

        # Test /auth/me for each user
        for role in self.tokens:
            self.run_test(f"Get {role} profile", "GET", "auth/me", 200, user_role=role)
        
        return len(self.tokens) > 0

    def test_products_endpoints(self):
        """Test products endpoints"""
        self.log("\n=== TESTING PRODUCTS ENDPOINTS ===", "INFO")
        
        # Test get categories
        self.run_test("Get product categories", "GET", "products/categories", 200)
        
        # Test get all products
        success, response = self.run_test("Get all products", "GET", "products", 200)
        if success:
            self.test_data['existing_products'] = response.get('products', [])
            self.log(f"✅ Found {len(self.test_data['existing_products'])} existing products")
        
        # Test create product (shareholder only)
        if 'shareholder' in self.tokens:
            product_data = {
                "title": f"Test Product {datetime.now().strftime('%H%M%S')}",
                "description": "A test product for API testing",
                "category": "food",
                "price": 100.0,
                "currency": "RUB", 
                "region": "Moscow",
                "contacts": "test@example.com",
                "images": ["https://via.placeholder.com/400"],
                "tags": ["test", "food"],
                "exchange_available": True
            }
            
            success, response = self.run_test(
                "Create product (shareholder)",
                "POST", "products", 200, product_data, user_role='shareholder'
            )
            if success and 'product_id' in response:
                self.test_data['test_product_id'] = response['product_id']
                self.log(f"✅ Test product created: {self.test_data['test_product_id']}")
                
                # Test get specific product
                self.run_test(
                    "Get product by ID",
                    "GET", f"products/{self.test_data['test_product_id']}", 200
                )
                
                # Test update product
                update_data = {"title": "Updated Test Product", "price": 150.0}
                self.run_test(
                    "Update product",
                    "PUT", f"products/{self.test_data['test_product_id']}", 200,
                    update_data, user_role='shareholder'
                )
        
        # Test create product as client (should fail)
        if 'client' in self.tokens:
            self.run_test(
                "Create product as client (should fail)",
                "POST", "products", 403,
                {"title": "Should fail", "description": "test", "category": "other"},
                user_role='client'
            )

    def test_deals_endpoints(self):
        """Test deals endpoints"""
        self.log("\n=== TESTING DEALS ENDPOINTS ===", "INFO")
        
        if not self.test_data.get('test_product_id') or 'client' not in self.tokens:
            self.log("⚠️ Skipping deals tests - need product and client token", "WARN")
            return
        
        # Test create deal
        deal_data = {
            "product_id": self.test_data['test_product_id'],
            "deal_type": "buy",
            "message": "I want to buy this test product"
        }
        
        success, response = self.run_test(
            "Create deal",
            "POST", "deals", 200, deal_data, user_role='client'
        )
        if success and 'deal_id' in response:
            self.test_data['test_deal_id'] = response['deal_id']
            self.log(f"✅ Deal created: {self.test_data['test_deal_id']}")
        
        # Test get deals
        self.run_test("Get client deals", "GET", "deals", 200, user_role='client')
        self.run_test("Get seller deals", "GET", "deals", 200, user_role='shareholder')
        
        # Test deal actions
        if self.test_data.get('test_deal_id'):
            # Confirm deal (as seller)
            self.run_test(
                "Confirm deal",
                "PUT", f"deals/{self.test_data['test_deal_id']}/confirm", 200,
                user_role='shareholder'
            )
            
            # Complete deal (as seller)  
            self.run_test(
                "Complete deal",
                "PUT", f"deals/{self.test_data['test_deal_id']}/complete", 200,
                user_role='shareholder'
            )

    def test_favorites_endpoints(self):
        """Test favorites endpoints"""
        self.log("\n=== TESTING FAVORITES ENDPOINTS ===", "INFO")
        
        if not self.test_data.get('test_product_id') or 'client' not in self.tokens:
            self.log("⚠️ Skipping favorites tests - need product and client token", "WARN")
            return
        
        # Test add to favorites
        self.run_test(
            "Add to favorites",
            "POST", f"favorites/{self.test_data['test_product_id']}", 200,
            user_role='client'
        )
        
        # Test get favorites
        self.run_test("Get favorites", "GET", "favorites", 200, user_role='client')
        
        # Test remove from favorites
        self.run_test(
            "Remove from favorites", 
            "DELETE", f"favorites/{self.test_data['test_product_id']}", 200,
            user_role='client'
        )

    def test_meetings_endpoints(self):
        """Test meetings endpoints"""
        self.log("\n=== TESTING MEETINGS ENDPOINTS ===", "INFO")
        
        if not self.test_data.get('test_product_id') or 'client' not in self.tokens:
            self.log("⚠️ Skipping meetings tests - need product and client token", "WARN")
            return
        
        # Test create meeting request
        meeting_data = {
            "product_id": self.test_data['test_product_id'],
            "preferred_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
            "message": "I would like to schedule a meeting about this product"
        }
        
        success, response = self.run_test(
            "Create meeting request",
            "POST", "meetings", 200, meeting_data, user_role='client'
        )
        if success and 'meeting_id' in response:
            self.test_data['test_meeting_id'] = response['meeting_id']
        
        # Test get meetings
        self.run_test("Get client meetings", "GET", "meetings", 200, user_role='client')
        self.run_test("Get seller meetings", "GET", "meetings", 200, user_role='shareholder')

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        self.log("\n=== TESTING ADMIN ENDPOINTS ===", "INFO")
        
        if 'admin' not in self.tokens:
            self.log("⚠️ Skipping admin tests - need admin token", "WARN")
            return
        
        # Test admin stats
        self.run_test("Get admin stats", "GET", "admin/stats", 200, user_role='admin')
        
        # Test get all users
        self.run_test("Get all users", "GET", "admin/users", 200, user_role='admin')
        
        # Test get all products
        self.run_test("Get all admin products", "GET", "admin/products", 200, user_role='admin')
        
        # Test get all deals
        self.run_test("Get all admin deals", "GET", "admin/deals", 200, user_role='admin')

    def cleanup_test_data(self):
        """Clean up test data"""
        self.log("\n=== CLEANING UP TEST DATA ===", "INFO")
        
        # Delete test product if created
        if self.test_data.get('test_product_id') and 'shareholder' in self.tokens:
            self.run_test(
                "Delete test product",
                "DELETE", f"products/{self.test_data['test_product_id']}", 200,
                user_role='shareholder'
            )

    def run_all_tests(self):
        """Run all API tests"""
        self.log(f"🚀 Starting KAIF Marketplace API Tests at {datetime.now()}")
        self.log(f"🌐 Backend URL: {self.base_url}")
        
        start_time = time.time()
        
        try:
            # Run test suites in sequence
            if not self.test_auth_endpoints():
                self.log("❌ Authentication failed - stopping tests", "ERROR")
                return self.get_results()
            
            self.test_products_endpoints()
            self.test_deals_endpoints()
            self.test_favorites_endpoints() 
            self.test_meetings_endpoints()
            self.test_admin_endpoints()
            
            # Cleanup
            self.cleanup_test_data()
            
        except Exception as e:
            self.log(f"❌ Unexpected error: {str(e)}", "ERROR")
            self.failures.append(f"Unexpected error: {str(e)}")
        
        end_time = time.time()
        
        # Print results
        self.log(f"\n🏁 Tests completed in {end_time - start_time:.1f}s")
        self.log(f"📊 Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failures:
            self.log("\n❌ FAILURES:", "ERROR")
            for failure in self.failures:
                self.log(f"  • {failure}", "ERROR")
        
        return self.get_results()

    def get_results(self):
        """Get test results summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": f"{success_rate:.1f}%",
            "failures": self.failures,
            "tokens_obtained": list(self.tokens.keys()),
            "test_data_created": list(self.test_data.keys())
        }

def main():
    """Main function"""
    tester = KAIFMarketplaceAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results["tests_passed"] == results["tests_run"] and results["tests_run"] > 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️ Some tests failed. Success rate: {results['success_rate']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())