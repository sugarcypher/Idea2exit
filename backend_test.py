#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime

class IdeaForgeAPITester:
    def __init__(self, base_url="https://idea-to-exit.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.project_id = None
        self.document_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request"""
        url = f"{self.base_url}/api{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)
            
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None

    def test_health_check(self):
        """Test health endpoints"""
        response = self.make_request('GET', '/health')
        if response and response.status_code == 200:
            self.log_result("Health Check", True)
            return True
        else:
            self.log_result("Health Check", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_data = {
            "email": f"testuser_{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        
        response = self.make_request('POST', '/auth/register', test_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'user' in data:
                self.token = data['access_token']
                self.user_id = data['user']['id']
                self.log_result("User Registration", True)
                return True
                
        self.log_result("User Registration", False, 
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user, then try to login
        timestamp = int(time.time())
        email = f"loginuser_{timestamp}@example.com"
        password = "TestPass123!"
        
        # Register first
        reg_data = {
            "email": email,
            "password": password,
            "full_name": "Login Test User"
        }
        reg_response = self.make_request('POST', '/auth/register', reg_data)
        
        if not reg_response or reg_response.status_code != 200:
            self.log_result("User Login Setup", False, "Failed to create test user")
            return False
            
        # Now test login
        login_data = {
            "email": email,
            "password": password
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'user' in data:
                self.log_result("User Login", True)
                return True
                
        self.log_result("User Login", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_user_profile(self):
        """Test getting current user profile"""
        if not self.token:
            self.log_result("Get User Profile", False, "No auth token available")
            return False
            
        response = self.make_request('GET', '/auth/me')
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'email' in data:
                self.log_result("Get User Profile", True)
                return True
                
        self.log_result("Get User Profile", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_create_project(self):
        """Test creating a new project"""
        if not self.token:
            self.log_result("Create Project", False, "No auth token available")
            return False
            
        project_data = {
            "name": "Test AI Innovation Project",
            "description": "A revolutionary AI-powered solution for modern businesses",
            "vision": "To transform how businesses operate using cutting-edge AI technology",
            "target_market": "Enterprise businesses looking to automate their operations",
            "problem_statement": "Current business processes are inefficient and time-consuming",
            "solution": "Our AI-powered platform automates key business processes",
            "industry": "Technology"
        }
        
        response = self.make_request('POST', '/projects', project_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'agents' in data:
                self.project_id = data['id']
                # Check if agents are properly initialized
                if len(data['agents']) >= 9:  # Should have 9 agents as per backend
                    self.log_result("Create Project", True)
                    return True
                    
        self.log_result("Create Project", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_projects(self):
        """Test getting user projects"""
        if not self.token:
            self.log_result("Get Projects", False, "No auth token available")
            return False
            
        response = self.make_request('GET', '/projects')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get Projects", True)
                return True
                
        self.log_result("Get Projects", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_project_detail(self):
        """Test getting project details"""
        if not self.token or not self.project_id:
            self.log_result("Get Project Detail", False, "No auth token or project ID")
            return False
            
        response = self.make_request('GET', f'/projects/{self.project_id}')
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['id'] == self.project_id:
                self.log_result("Get Project Detail", True)
                return True
                
        self.log_result("Get Project Detail", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_project_agents(self):
        """Test getting project agents"""
        if not self.token or not self.project_id:
            self.log_result("Get Project Agents", False, "No auth token or project ID")
            return False
            
        response = self.make_request('GET', f'/projects/{self.project_id}/agents')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                self.log_result("Get Project Agents", True)
                return True
                
        self.log_result("Get Project Agents", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_generate_document(self):
        """Test document generation"""
        if not self.token or not self.project_id:
            self.log_result("Generate Document", False, "No auth token or project ID")
            return False
            
        doc_data = {
            "project_id": self.project_id,
            "document_type": "white_paper"
        }
        
        print("  📝 Generating white paper (this may take 10-30 seconds)...")
        response = self.make_request('POST', '/documents/generate', doc_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'content' in data and len(data['content']) > 100:
                self.document_id = data['id']
                self.log_result("Generate Document", True)
                return True
                
        self.log_result("Generate Document", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_documents(self):
        """Test getting project documents"""
        if not self.token or not self.project_id:
            self.log_result("Get Documents", False, "No auth token or project ID")
            return False
            
        response = self.make_request('GET', f'/documents/{self.project_id}')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get Documents", True)
                return True
                
        self.log_result("Get Documents", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_generate_landing_page(self):
        """Test landing page generation"""
        if not self.token or not self.project_id:
            self.log_result("Generate Landing Page", False, "No auth token or project ID")
            return False
            
        page_data = {
            "project_id": self.project_id,
            "style": "modern"
        }
        
        print("  🌐 Generating landing page (this may take 10-30 seconds)...")
        response = self.make_request('POST', '/landing-page/generate', page_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'html_content' in data and 'css_content' in data:
                self.log_result("Generate Landing Page", True)
                return True
                
        self.log_result("Generate Landing Page", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_generate_analysis(self):
        """Test business analysis generation"""
        if not self.token or not self.project_id:
            self.log_result("Generate Analysis", False, "No auth token or project ID")
            return False
            
        analysis_data = {
            "project_id": self.project_id
        }
        
        print("  📊 Generating business analysis (this may take 10-30 seconds)...")
        response = self.make_request('POST', '/analysis/generate', analysis_data)
        if response and response.status_code == 200:
            data = response.json()
            if ('comparative_analysis' in data and 'timeline_estimate' in data and 
                'financial_projection' in data and 'business_prognosis' in data):
                self.log_result("Generate Analysis", True)
                return True
                
        self.log_result("Generate Analysis", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_delete_project(self):
        """Test deleting a project"""
        if not self.token or not self.project_id:
            self.log_result("Delete Project", False, "No auth token or project ID")
            return False
            
        response = self.make_request('DELETE', f'/projects/{self.project_id}')
        if response and response.status_code == 200:
            self.log_result("Delete Project", True)
            return True
            
        self.log_result("Delete Project", False,
                       f"Status: {response.status_code if response else 'No response'}")
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting IdeaForge API Tests...")
        print(f"🌐 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Basic tests
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_get_user_profile()
        
        # Project management tests
        self.test_create_project()
        self.test_get_projects()
        self.test_get_project_detail()
        self.test_get_project_agents()
        
        # AI generation tests (these may take longer)
        self.test_generate_document()
        self.test_get_documents()
        self.test_generate_landing_page()
        self.test_generate_analysis()
        
        # Cleanup tests
        self.test_delete_project()
        
        # Print results
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            failed_tests = [r for r in self.test_results if not r['success']]
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
            return False

def main():
    """Main test execution"""
    tester = IdeaForgeAPITester()
    success = tester.run_all_tests()
    
    # Save results to JSON for analysis
    results = {
        "summary": {
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            "timestamp": datetime.now().isoformat()
        },
        "test_results": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())