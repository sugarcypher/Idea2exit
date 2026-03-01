"""
Backend tests for auth and security features:
- Registration with password validation
- Registration with terms/privacy checkbox requirements
- Login flow
- Cookie consent APIs
- Legal pages (Terms, Privacy)
- User settings/preferences
- Account Settings API
"""

import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"SUCCESS: Health check passed - {data}")


class TestPasswordValidation:
    """Test password strength validation"""
    
    def test_register_weak_password_no_uppercase(self):
        """Password without uppercase should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_nouppercse_{uuid.uuid4().hex[:8]}@example.com",
            "password": "testpass123!",  # No uppercase
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"SUCCESS: Password without uppercase rejected - {data}")
    
    def test_register_weak_password_no_lowercase(self):
        """Password without lowercase should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_nolower_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TESTPASS123!",  # No lowercase
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Password without lowercase rejected")
    
    def test_register_weak_password_no_number(self):
        """Password without number should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_nonumber_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPass!!!",  # No number
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Password without number rejected")
    
    def test_register_weak_password_no_special(self):
        """Password without special char should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_nospecial_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPass123",  # No special char
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Password without special char rejected")
    
    def test_register_weak_password_too_short(self):
        """Password less than 8 chars should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_short_{uuid.uuid4().hex[:8]}@example.com",
            "password": "Te1!aB",  # Too short
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Short password rejected")


class TestTermsPrivacyRequirement:
    """Test Terms and Privacy checkbox requirements"""
    
    def test_register_without_terms(self):
        """Registration without accepting terms should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_noterms_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User",
            "accepted_terms": False,  # Not accepted
            "accepted_privacy": True
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Terms" in data.get("detail", "")
        print(f"SUCCESS: Registration without terms rejected - {data}")
    
    def test_register_without_privacy(self):
        """Registration without accepting privacy should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_noprivacy_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": False  # Not accepted
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Privacy" in data.get("detail", "")
        print(f"SUCCESS: Registration without privacy rejected - {data}")


class TestRegistrationAndLogin:
    """Test registration and login flows"""
    
    @pytest.fixture
    def test_user_email(self):
        return f"TEST_auth_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_register_with_strong_password(self, test_user_email):
        """Registration with strong password and accepted terms should succeed"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_user_email,
            "password": "TestPass123!",
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_user_email
        print(f"SUCCESS: Registration successful for {test_user_email}")
        return data
    
    def test_login_with_registered_user(self):
        """Test login flow with a newly registered user"""
        # First register
        email = f"TEST_login_{uuid.uuid4().hex[:8]}@example.com"
        password = "TestPass123!"
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert reg_response.status_code == 200
        
        # Then login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_response.status_code == 200
        data = login_response.json()
        assert "access_token" in data
        assert data["user"]["email"] == email
        print(f"SUCCESS: Login successful for {email}")
    
    def test_login_invalid_credentials(self):
        """Login with invalid credentials should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPass123!"
        })
        assert response.status_code == 401
        print("SUCCESS: Invalid login rejected")
    
    def test_duplicate_registration(self):
        """Duplicate registration should fail"""
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "full_name": "Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response1.status_code == 200
        
        # Duplicate registration
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass456!",
            "full_name": "Test User 2",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response2.status_code == 400
        assert "already registered" in response2.json().get("detail", "").lower()
        print(f"SUCCESS: Duplicate registration rejected for {email}")


class TestLegalPages:
    """Test legal page endpoints (Terms, Privacy)"""
    
    def test_get_terms_of_service(self):
        """Test Terms of Service endpoint"""
        response = requests.get(f"{BASE_URL}/api/legal/terms")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        assert "last_updated" in data
        assert "Terms" in data["title"]
        print(f"SUCCESS: Terms of Service loaded - Title: {data['title']}")
    
    def test_get_privacy_policy(self):
        """Test Privacy Policy endpoint"""
        response = requests.get(f"{BASE_URL}/api/legal/privacy")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        assert "last_updated" in data
        assert "Privacy" in data["title"]
        print(f"SUCCESS: Privacy Policy loaded - Title: {data['title']}")


class TestUserSettings:
    """Test user settings and preferences endpoints"""
    
    @pytest.fixture
    def auth_header(self):
        """Create a test user and return auth header"""
        email = f"TEST_settings_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "full_name": "Test Settings User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert response.status_code == 200
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_user_preferences(self, auth_header):
        """Test getting user preferences"""
        response = requests.get(f"{BASE_URL}/api/user/preferences", headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert "preferences" in data
        assert "consents" in data
        print(f"SUCCESS: User preferences fetched - {data}")
    
    def test_update_user_preferences(self, auth_header):
        """Test updating user preferences"""
        response = requests.put(
            f"{BASE_URL}/api/user/preferences",
            headers=auth_header,
            json={
                "email_notifications": True,
                "marketing_emails": True,
                "product_updates": False,
                "security_alerts": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: User preferences updated - {data}")
    
    def test_update_consent(self, auth_header):
        """Test updating consent settings"""
        response = requests.put(
            f"{BASE_URL}/api/user/consent",
            headers=auth_header,
            json={
                "consent_type": "marketing",
                "granted": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Consent updated - {data}")
    
    def test_export_user_data(self, auth_header):
        """Test GDPR data export"""
        response = requests.get(f"{BASE_URL}/api/user/export-data", headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert "export_date" in data
        assert "user_profile" in data
        print(f"SUCCESS: Data export successful - keys: {list(data.keys())}")
    
    def test_change_password(self, auth_header):
        """Test password change"""
        # First need to get new auth after password change
        email = f"TEST_pwdchange_{uuid.uuid4().hex[:8]}@example.com"
        old_password = "OldPass123!"
        new_password = "NewPass456!"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": old_password,
            "full_name": "Password Change Test",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert reg_response.status_code == 200
        token = reg_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Change password
        response = requests.put(
            f"{BASE_URL}/api/user/change-password",
            headers=headers,
            params={
                "old_password": old_password,
                "new_password": new_password
            }
        )
        assert response.status_code == 200
        print("SUCCESS: Password changed successfully")
        
        # Verify login with new password
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": new_password
        })
        assert login_response.status_code == 200
        print("SUCCESS: Login with new password successful")
    
    def test_change_password_wrong_old(self, auth_header):
        """Test password change with wrong old password"""
        response = requests.put(
            f"{BASE_URL}/api/user/change-password",
            headers=auth_header,
            params={
                "old_password": "WrongOldPass123!",
                "new_password": "NewPass456!"
            }
        )
        assert response.status_code == 400
        print("SUCCESS: Wrong old password rejected")


class TestAccountDeletion:
    """Test account deletion request/cancel"""
    
    def test_request_and_cancel_deletion(self):
        """Test requesting and canceling account deletion"""
        email = f"TEST_delete_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "full_name": "Deletion Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert reg_response.status_code == 200
        token = reg_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Request deletion
        del_response = requests.post(f"{BASE_URL}/api/user/request-deletion", headers=headers)
        assert del_response.status_code == 200
        data = del_response.json()
        assert "scheduled_deletion" in data
        print(f"SUCCESS: Deletion requested - {data}")
        
        # Cancel deletion
        cancel_response = requests.post(f"{BASE_URL}/api/user/cancel-deletion", headers=headers)
        assert cancel_response.status_code == 200
        print("SUCCESS: Deletion cancelled")


class TestAuthMe:
    """Test /auth/me endpoint"""
    
    def test_get_current_user(self):
        """Test getting current user info"""
        email = f"TEST_me_{uuid.uuid4().hex[:8]}@example.com"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email,
            "password": "TestPass123!",
            "full_name": "Me Test User",
            "accepted_terms": True,
            "accepted_privacy": True
        })
        assert reg_response.status_code == 200
        token = reg_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email
        assert data["full_name"] == "Me Test User"
        print(f"SUCCESS: /auth/me returned user info - {data}")
    
    def test_get_current_user_unauthorized(self):
        """Test /auth/me without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403  # FastAPI returns 403 for missing auth
        print("SUCCESS: Unauthorized /auth/me request rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
