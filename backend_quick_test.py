#!/usr/bin/env python3

import requests
import json
import sys
import time
from datetime import datetime

def test_essential_apis():
    """Test core API functionality without AI generation"""
    base_url = "https://idea-to-exit.preview.emergentagent.com"
    results = {"passed": 0, "total": 0, "details": []}
    
    def test_api(name, method, endpoint, data=None, token=None):
        results["total"] += 1
        url = f"{base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                print(f"✅ {name} - Status: {response.status_code}")
                results["passed"] += 1
                results["details"].append({"test": name, "success": True, "status": response.status_code})
                return response.json()
            else:
                print(f"❌ {name} - Status: {response.status_code}")
                results["details"].append({"test": name, "success": False, "status": response.status_code})
                return None
        except Exception as e:
            print(f"❌ {name} - Error: {str(e)}")
            results["details"].append({"test": name, "success": False, "error": str(e)})
            return None
    
    print("🧪 Testing IdeaForge Core APIs")
    print("=" * 50)
    
    # Test health
    test_api("Health Check", "GET", "/health")
    
    # Test registration
    timestamp = int(time.time())
    reg_data = {
        "email": f"testuser_{timestamp}@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    }
    reg_response = test_api("User Registration", "POST", "/auth/register", reg_data)
    
    if not reg_response or 'access_token' not in reg_response:
        print("❌ Registration failed, cannot continue with authenticated tests")
        return results
        
    token = reg_response['access_token']
    user_id = reg_response['user']['id']
    print(f"🔑 Got auth token for user: {reg_response['user']['email']}")
    
    # Test user profile
    test_api("Get User Profile", "GET", "/auth/me", token=token)
    
    # Test project creation
    project_data = {
        "name": "Test Innovation Project",
        "description": "A test project for API validation",
        "vision": "To validate the IdeaForge platform APIs",
        "target_market": "Software developers and entrepreneurs",
        "problem_statement": "Need to ensure APIs work correctly",
        "solution": "Comprehensive API testing approach",
        "industry": "Technology"
    }
    project_response = test_api("Create Project", "POST", "/projects", project_data, token)
    
    if project_response and 'id' in project_response:
        project_id = project_response['id']
        print(f"📁 Created project: {project_id}")
        
        # Test project retrieval
        test_api("Get Projects", "GET", "/projects", token=token)
        test_api("Get Project Detail", "GET", f"/projects/{project_id}", token=token)
        test_api("Get Project Agents", "GET", f"/projects/{project_id}/agents", token=token)
        test_api("Get Project Documents", "GET", f"/documents/{project_id}", token=token)
    
    print("=" * 50)
    print(f"📊 Results: {results['passed']}/{results['total']} tests passed")
    
    return results

if __name__ == "__main__":
    results = test_essential_apis()
    
    # Save results
    with open('/app/backend_core_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    sys.exit(0 if results['passed'] == results['total'] else 1)