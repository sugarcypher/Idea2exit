"""
Backend API Tests for IdeaForge Funding & Branding Kit Feature
Tests: Funding Kit generation, Logo generation, Video generation endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment variable
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestFundingKitEndpoints:
    """Tests for Funding Kit generation and retrieval"""
    
    @pytest.fixture(scope="class")
    def auth_session_with_project(self):
        """Create authenticated session with a project for funding kit tests"""
        unique_email = f"fundingkittest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Funding Kit Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Registration failed: {response.text}"
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        # Create a test project
        project_data = {
            "name": f"TEST_FundingKit_{uuid.uuid4().hex[:8]}",
            "description": "An AI-powered tool for helping startups get funded",
            "vision": "To democratize startup funding",
            "target_market": "Early-stage startups seeking Series A funding",
            "problem_statement": "Startups struggle to find the right investors",
            "solution": "AI-matched investor profiles and outreach templates",
            "industry": "FinTech"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200, f"Project creation failed: {proj_response.text}"
        project = proj_response.json()
        
        return {"session": session, "project": project, "email": unique_email}
    
    def test_generate_funding_kit_complete(self, auth_session_with_project):
        """Test generating a complete funding kit with all options enabled"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        request_data = {
            "project_id": project_id,
            "include_investors": True,
            "include_crowdfunding": True,
            "include_outreach": True,
            "include_video": True,
            "include_branding": True,
            "video_duration": 4,
            "logo_styles": ["modern", "minimal", "bold"]
        }
        
        # Funding kit generation can take 30-60 seconds due to LLM calls
        response = session.post(f"{BASE_URL}/api/funding-kit/generate", json=request_data, timeout=120)
        assert response.status_code == 200, f"Funding kit generation failed: {response.text}"
        
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Missing id in response"
        assert "project_id" in data, "Missing project_id in response"
        assert data["project_id"] == project_id
        assert data["status"] == "completed", f"Kit status is {data.get('status')}"
        
        # Verify investors list
        assert "investors" in data, "Missing investors in response"
        assert isinstance(data["investors"], list), "Investors should be a list"
        print(f"✓ Generated {len(data['investors'])} investors")
        
        # Verify crowdfunding strategies
        assert "crowdfunding_strategies" in data, "Missing crowdfunding_strategies"
        assert isinstance(data["crowdfunding_strategies"], list)
        print(f"✓ Generated {len(data['crowdfunding_strategies'])} crowdfunding strategies")
        
        # Verify outreach templates
        assert "outreach_templates" in data, "Missing outreach_templates"
        assert isinstance(data["outreach_templates"], list)
        print(f"✓ Generated {len(data['outreach_templates'])} outreach templates")
        
        # Verify video script
        assert "pitch_video_script" in data, "Missing pitch_video_script"
        print(f"✓ Generated video script ({len(data.get('pitch_video_script', ''))} chars)")
        
        # Verify brand assets
        assert "brand_assets" in data, "Missing brand_assets"
        assert isinstance(data["brand_assets"], list)
        print(f"✓ Generated {len(data['brand_assets'])} brand assets")
        
        return data
    
    def test_get_funding_kit(self, auth_session_with_project):
        """Test retrieving an existing funding kit"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        # First generate a kit if not already done
        gen_response = session.post(f"{BASE_URL}/api/funding-kit/generate", json={
            "project_id": project_id,
            "include_investors": True,
            "include_crowdfunding": False,
            "include_outreach": False,
            "include_video": False,
            "include_branding": False
        }, timeout=60)
        
        # Now retrieve it
        response = session.get(f"{BASE_URL}/api/funding-kit/{project_id}")
        assert response.status_code == 200, f"Get funding kit failed: {response.text}"
        
        data = response.json()
        assert data["project_id"] == project_id
        print(f"✓ Retrieved funding kit for project {project_id}")
    
    def test_funding_kit_not_found(self, auth_session_with_project):
        """Test retrieving non-existent funding kit returns 404"""
        session = auth_session_with_project["session"]
        fake_project_id = str(uuid.uuid4())
        
        response = session.get(f"{BASE_URL}/api/funding-kit/{fake_project_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent funding kit correctly returns 404")
    
    def test_funding_kit_unauthenticated(self, auth_session_with_project):
        """Test that unauthenticated requests are rejected"""
        project_id = auth_session_with_project["project"]["id"]
        
        response = requests.get(f"{BASE_URL}/api/funding-kit/{project_id}")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Unauthenticated request correctly rejected")


class TestLogoGeneration:
    """Tests for AI logo generation endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session_with_project(self):
        """Create authenticated session with a project"""
        unique_email = f"logotest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Logo Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        project_data = {
            "name": f"TEST_LogoGen_{uuid.uuid4().hex[:8]}",
            "description": "A sustainable fashion marketplace",
            "vision": "Make sustainable fashion accessible",
            "target_market": "Eco-conscious consumers",
            "problem_statement": "Fashion industry pollution",
            "solution": "Curated sustainable fashion platform",
            "industry": "Fashion"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        return {"session": session, "project": project}
    
    def test_generate_logo_modern_style(self, auth_session_with_project):
        """Test logo generation with modern style"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        request_data = {
            "project_id": project_id,
            "style": "modern"
        }
        
        # Logo generation can take up to 2 minutes
        response = session.post(f"{BASE_URL}/api/funding-kit/generate-logo", json=request_data, timeout=180)
        assert response.status_code == 200, f"Logo generation failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "project_id" in data
        assert data["project_id"] == project_id
        assert data["style"] == "modern"
        assert "image_base64" in data, "Logo should contain image_base64"
        assert len(data["image_base64"]) > 100, "Base64 image data seems too short"
        assert "created_at" in data
        
        print(f"✓ Generated modern logo ({len(data['image_base64'])} chars base64)")
        return data
    
    def test_get_project_logos(self, auth_session_with_project):
        """Test retrieving all logos for a project"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        response = session.get(f"{BASE_URL}/api/funding-kit/{project_id}/logos")
        assert response.status_code == 200, f"Get logos failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} logos for project")
    
    def test_generate_logo_invalid_project(self, auth_session_with_project):
        """Test logo generation with invalid project ID"""
        session = auth_session_with_project["session"]
        fake_project_id = str(uuid.uuid4())
        
        request_data = {
            "project_id": fake_project_id,
            "style": "modern"
        }
        
        response = session.post(f"{BASE_URL}/api/funding-kit/generate-logo", json=request_data, timeout=60)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid project ID correctly returns 404")


class TestVideoGeneration:
    """Tests for AI video generation endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_session_with_project(self):
        """Create authenticated session with a project"""
        unique_email = f"videotest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Video Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        project_data = {
            "name": f"TEST_VideoGen_{uuid.uuid4().hex[:8]}",
            "description": "A fitness tracking app",
            "vision": "Make fitness fun and engaging",
            "target_market": "Health-conscious millennials",
            "problem_statement": "Lack of motivation in fitness",
            "solution": "Gamified fitness tracking",
            "industry": "Health & Fitness"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        return {"session": session, "project": project}
    
    def test_get_project_videos(self, auth_session_with_project):
        """Test retrieving all videos for a project"""
        session = auth_session_with_project["session"]
        project_id = auth_session_with_project["project"]["id"]
        
        response = session.get(f"{BASE_URL}/api/funding-kit/{project_id}/videos")
        assert response.status_code == 200, f"Get videos failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} videos for project")
    
    def test_generate_video_invalid_project(self, auth_session_with_project):
        """Test video generation with invalid project ID"""
        session = auth_session_with_project["session"]
        fake_project_id = str(uuid.uuid4())
        
        request_data = {
            "project_id": fake_project_id,
            "duration": 4,
            "style": "professional"
        }
        
        response = session.post(f"{BASE_URL}/api/funding-kit/generate-video", json=request_data, timeout=60)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Invalid project ID correctly returns 404")


class TestFundingKitInvestorData:
    """Tests for investor profile data quality"""
    
    @pytest.fixture(scope="class")
    def generated_kit(self):
        """Generate a funding kit and return it"""
        unique_email = f"investortest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Investor Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        project_data = {
            "name": f"TEST_InvestorData_{uuid.uuid4().hex[:8]}",
            "description": "B2B SaaS for supply chain optimization",
            "vision": "Streamline global supply chains",
            "target_market": "Enterprise logistics companies",
            "problem_statement": "Supply chain inefficiencies",
            "solution": "AI-powered supply chain optimization",
            "industry": "Enterprise Software"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        # Generate funding kit with investors only for faster test
        kit_response = session.post(f"{BASE_URL}/api/funding-kit/generate", json={
            "project_id": project["id"],
            "include_investors": True,
            "include_crowdfunding": False,
            "include_outreach": False,
            "include_video": False,
            "include_branding": False
        }, timeout=60)
        
        assert kit_response.status_code == 200
        return kit_response.json()
    
    def test_investor_profiles_structure(self, generated_kit):
        """Test that investor profiles have proper structure"""
        investors = generated_kit.get("investors", [])
        
        if len(investors) == 0:
            pytest.skip("No investors generated - LLM may have had issues")
        
        for investor in investors:
            assert "name" in investor, "Investor missing name"
            assert "type" in investor, "Investor missing type"
            assert "focus_areas" in investor, "Investor missing focus_areas"
            assert "typical_check_size" in investor, "Investor missing typical_check_size"
            assert "stage_preference" in investor, "Investor missing stage_preference"
            assert "contact_method" in investor, "Investor missing contact_method"
        
        print(f"✓ All {len(investors)} investor profiles have correct structure")
    
    def test_investor_types_variety(self, generated_kit):
        """Test that we get a variety of investor types"""
        investors = generated_kit.get("investors", [])
        
        if len(investors) < 3:
            pytest.skip("Not enough investors to test variety")
        
        types = [i.get("type", "") for i in investors]
        unique_types = set(types)
        
        # We should have at least 2 different types
        assert len(unique_types) >= 2, f"Expected variety in investor types, got only: {unique_types}"
        print(f"✓ Investor types: {unique_types}")


class TestFundingKitCrowdfunding:
    """Tests for crowdfunding strategy data"""
    
    @pytest.fixture(scope="class")
    def generated_kit(self):
        """Generate a funding kit with crowdfunding strategies"""
        unique_email = f"crowdtest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Crowdfunding Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        project_data = {
            "name": f"TEST_Crowdfund_{uuid.uuid4().hex[:8]}",
            "description": "A portable solar charger for hikers",
            "vision": "Power adventures sustainably",
            "target_market": "Outdoor enthusiasts",
            "problem_statement": "No power while hiking",
            "solution": "Lightweight solar charging device",
            "industry": "Consumer Electronics"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        kit_response = session.post(f"{BASE_URL}/api/funding-kit/generate", json={
            "project_id": project["id"],
            "include_investors": False,
            "include_crowdfunding": True,
            "include_outreach": False,
            "include_video": False,
            "include_branding": False
        }, timeout=60)
        
        assert kit_response.status_code == 200
        return kit_response.json()
    
    def test_crowdfunding_strategies_structure(self, generated_kit):
        """Test crowdfunding strategies have proper structure"""
        strategies = generated_kit.get("crowdfunding_strategies", [])
        
        if len(strategies) == 0:
            pytest.skip("No crowdfunding strategies generated")
        
        for strategy in strategies:
            assert "platform" in strategy, "Strategy missing platform"
            assert "recommended_goal" in strategy, "Strategy missing recommended_goal"
            assert "campaign_duration" in strategy, "Strategy missing campaign_duration"
            # Optional fields
            if "reward_tiers" in strategy:
                assert isinstance(strategy["reward_tiers"], list)
            if "tips" in strategy:
                assert isinstance(strategy["tips"], list)
        
        platforms = [s.get("platform", "") for s in strategies]
        print(f"✓ Crowdfunding platforms: {platforms}")


class TestFundingKitOutreach:
    """Tests for outreach template data"""
    
    @pytest.fixture(scope="class")
    def generated_kit(self):
        """Generate a funding kit with outreach templates"""
        unique_email = f"outreachtest{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "password": "Password123!",
            "full_name": "Outreach Test User"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        session = requests.Session()
        session.headers.update({
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        })
        
        project_data = {
            "name": f"TEST_Outreach_{uuid.uuid4().hex[:8]}",
            "description": "AI-powered legal document review",
            "vision": "Democratize legal services",
            "target_market": "Small businesses and startups",
            "problem_statement": "Legal review is expensive",
            "solution": "AI contract analysis tool",
            "industry": "LegalTech"
        }
        
        proj_response = session.post(f"{BASE_URL}/api/projects", json=project_data)
        assert proj_response.status_code == 200
        project = proj_response.json()
        
        kit_response = session.post(f"{BASE_URL}/api/funding-kit/generate", json={
            "project_id": project["id"],
            "include_investors": False,
            "include_crowdfunding": False,
            "include_outreach": True,
            "include_video": False,
            "include_branding": False
        }, timeout=60)
        
        assert kit_response.status_code == 200
        return kit_response.json()
    
    def test_outreach_templates_structure(self, generated_kit):
        """Test outreach templates have proper structure"""
        templates = generated_kit.get("outreach_templates", [])
        
        if len(templates) == 0:
            pytest.skip("No outreach templates generated")
        
        for template in templates:
            assert "type" in template, "Template missing type"
            assert "content" in template, "Template missing content"
            assert len(template["content"]) > 50, "Template content seems too short"
        
        types = [t.get("type", "") for t in templates]
        print(f"✓ Outreach template types: {types}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
