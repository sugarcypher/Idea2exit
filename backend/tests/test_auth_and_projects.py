"""
Backend API Tests for IdeaForge Innovation Platform
Tests: Authentication (register/login), Project CRUD, Agent Swarm
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment variable
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests - run first"""
    
    def test_health_check(self):
        """Test that the API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check passed: {data}")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "IdeaForge" in data.get("message", "")
        print(f"✓ Root endpoint: {data}")


class TestUserRegistration:
    """User registration endpoint tests"""
    
    def test_register_new_user(self):
        """Test registering a new user"""
        unique_email = f"test{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        assert data["user"]["email"] == unique_email
        assert data["user"]["full_name"] == "Test User"
        print(f"✓ Registration successful for {unique_email}")
        return data
    
    def test_register_duplicate_email(self):
        """Test that duplicate email returns error"""
        unique_email = f"testdup{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Test User"
        }
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response1.status_code == 200
        
        # Second registration with same email
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response2.status_code == 400
        data = response2.json()
        assert "already registered" in data.get("detail", "").lower()
        print(f"✓ Duplicate email correctly rejected")
    
    def test_register_invalid_email(self):
        """Test registration with invalid email format"""
        payload = {
            "email": "invalid-email",
            "password": "Password123!",
            "full_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 422  # Validation error
        print("✓ Invalid email correctly rejected")


class TestUserLogin:
    """User login endpoint tests"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create a test user for login tests"""
        unique_email = f"logintest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Login Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        return {"email": unique_email, "password": "Password123!"}
    
    def test_login_success(self, test_user):
        """Test successful login"""
        payload = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_user["email"]
        assert len(data["access_token"]) > 20  # JWT should be long
        print(f"✓ Login successful for {test_user['email']}")
    
    def test_login_invalid_password(self, test_user):
        """Test login with wrong password"""
        payload = {
            "email": test_user["email"],
            "password": "WrongPassword123!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print("✓ Invalid password correctly rejected")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        payload = {
            "email": "nonexistent@example.com",
            "password": "Password123!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401
        print("✓ Non-existent user login correctly rejected")


class TestAuthenticatedEndpoints:
    """Tests for endpoints requiring authentication"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        unique_email = f"authtest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Auth Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_get_me_authenticated(self, auth_token):
        """Test getting current user with valid token"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "email" in data
        assert "full_name" in data
        assert "id" in data
        print(f"✓ Get current user successful: {data['email']}")
    
    def test_get_me_no_token(self):
        """Test getting current user without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated request correctly rejected")
    
    def test_get_me_invalid_token(self):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 401
        print("✓ Invalid token correctly rejected")


class TestProjectCRUD:
    """Project CRUD operation tests"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Create authenticated session with test user"""
        unique_email = f"projecttest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Project Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        return session
    
    def test_create_project(self, auth_session):
        """Test creating a new project"""
        project_data = {
            "name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
            "description": "A test project for automated testing",
            "vision": "To validate the project creation functionality",
            "target_market": "Developers and QA testers",
            "problem_statement": "Need to verify the API works correctly",
            "solution": "Comprehensive automated testing",
            "industry": "Technology"
        }
        
        response = auth_session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert response.status_code == 200, f"Create project failed: {response.text}"
        
        data = response.json()
        assert data["name"] == project_data["name"]
        assert data["description"] == project_data["description"]
        assert data["status"] == "active"
        assert "id" in data
        assert "agents" in data
        assert len(data["agents"]) == 9  # Should have 9 AI agents
        
        print(f"✓ Project created: {data['name']} with {len(data['agents'])} agents")
        return data
    
    def test_create_and_get_project(self, auth_session):
        """Test creating a project and then retrieving it"""
        # Create project
        project_data = {
            "name": f"TEST_Retrieve_{uuid.uuid4().hex[:8]}",
            "description": "Test project for retrieval",
            "vision": "Test vision",
            "target_market": "Test market",
            "problem_statement": "Test problem",
            "solution": "Test solution",
            "industry": "Testing"
        }
        
        create_response = auth_session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert create_response.status_code == 200
        created = create_response.json()
        project_id = created["id"]
        
        # Get project
        get_response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 200
        
        retrieved = get_response.json()
        assert retrieved["id"] == project_id
        assert retrieved["name"] == project_data["name"]
        assert retrieved["description"] == project_data["description"]
        print(f"✓ Project retrieved: {retrieved['name']}")
    
    def test_list_projects(self, auth_session):
        """Test listing all projects"""
        response = auth_session.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} projects")
    
    def test_delete_project(self, auth_session):
        """Test deleting a project"""
        # First create a project
        project_data = {
            "name": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "description": "Test project to be deleted",
            "vision": "Test vision",
            "target_market": "Test market",
            "problem_statement": "Test problem",
            "solution": "Test solution",
            "industry": "Testing"
        }
        
        create_response = auth_session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert create_response.status_code == 200
        project_id = create_response.json()["id"]
        
        # Delete project
        delete_response = auth_session.delete(f"{BASE_URL}/api/projects/{project_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert get_response.status_code == 404
        print(f"✓ Project deleted and verified")


class TestProjectAgents:
    """Test AI agent swarm endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_session_with_project(self):
        """Create authenticated session with a project"""
        unique_email = f"agenttest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Agent Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        # Create a project
        project_data = {
            "name": f"TEST_Agent_{uuid.uuid4().hex[:8]}",
            "description": "Test project for agent tests",
            "vision": "Test vision",
            "target_market": "Test market",
            "problem_statement": "Test problem",
            "solution": "Test solution",
            "industry": "Technology"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        return {"session": session, "project": project}
    
    def test_get_project_agents(self, auth_session_with_project):
        """Test getting AI agents for a project"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        response = session.get(f"{BASE_URL}/api/projects/{project_id}/agents")
        assert response.status_code == 200
        
        agents = response.json()
        assert isinstance(agents, list)
        assert len(agents) == 9
        
        # Verify agent roles
        roles = [a["role"] for a in agents]
        assert "manager" in roles
        assert "specialist" in roles
        assert "worker" in roles
        
        # Verify agent structure
        for agent in agents:
            assert "id" in agent
            assert "name" in agent
            assert "role" in agent
            assert "status" in agent
        
        print(f"✓ Retrieved {len(agents)} agents: {set(roles)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
