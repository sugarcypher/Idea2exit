from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'default-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="IdeaForge - Innovation Launch Platform")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProjectCreate(BaseModel):
    name: str
    description: str
    vision: str
    target_market: str
    problem_statement: str
    solution: str
    industry: Optional[str] = "General"

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    description: str
    vision: str
    target_market: str
    problem_statement: str
    solution: str
    industry: str
    status: str
    created_at: str
    updated_at: str
    agents: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []

class AgentStatus(BaseModel):
    id: str
    name: str
    role: str  # manager, worker, specialist
    status: str  # idle, working, completed, error
    task: Optional[str] = None
    progress: int = 0
    last_updated: str

class DocumentRequest(BaseModel):
    project_id: str
    document_type: str  # white_paper, business_plan, pitch_deck, market_research, marketing_strategy, ip_protection

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    document_type: str
    title: str
    content: str
    status: str
    created_at: str

class LandingPageRequest(BaseModel):
    project_id: str
    style: Optional[str] = "modern"
    sections: Optional[List[str]] = None

class LandingPageResponse(BaseModel):
    id: str
    project_id: str
    html_content: str
    css_content: str
    preview_html: str
    created_at: str

class AnalysisRequest(BaseModel):
    project_id: str

class AnalysisResponse(BaseModel):
    id: str
    project_id: str
    comparative_analysis: Dict[str, Any]
    timeline_estimate: Dict[str, Any]
    financial_projection: Dict[str, Any]
    business_prognosis: Dict[str, Any]
    created_at: str

# ==================== AUTH UTILITIES ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"user_id": user_id, "exp": expiration}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== LLM UTILITIES ====================

async def generate_with_llm(system_prompt: str, user_prompt: str, session_id: str = None) -> str:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id or str(uuid.uuid4()),
            system_message=system_prompt
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text=user_prompt))
        return response
    except Exception as e:
        logger.error(f"LLM generation error: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "created_at": now
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, full_name=user_data.full_name, created_at=now)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], full_name=user["full_name"], created_at=user["created_at"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ==================== PROJECT ENDPOINTS ====================

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    project_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Initialize agent swarm for the project
    agents = [
        {"id": str(uuid.uuid4()), "name": "Project Manager", "role": "manager", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Research Analyst", "role": "specialist", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Business Strategist", "role": "specialist", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "IP Specialist", "role": "specialist", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Marketing Expert", "role": "specialist", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Financial Analyst", "role": "specialist", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Content Writer A", "role": "worker", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Content Writer B", "role": "worker", "status": "idle", "task": None, "progress": 0},
        {"id": str(uuid.uuid4()), "name": "Web Developer", "role": "worker", "status": "idle", "task": None, "progress": 0},
    ]
    
    project_doc = {
        "id": project_id,
        "user_id": current_user["id"],
        "name": project.name,
        "description": project.description,
        "vision": project.vision,
        "target_market": project.target_market,
        "problem_statement": project.problem_statement,
        "solution": project.solution,
        "industry": project.industry,
        "status": "active",
        "created_at": now,
        "updated_at": now,
        "agents": agents,
        "documents": []
    }
    await db.projects.insert_one(project_doc)
    
    return ProjectResponse(**project_doc)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(current_user: dict = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    # Also delete related documents
    await db.documents.delete_many({"project_id": project_id})
    await db.landing_pages.delete_many({"project_id": project_id})
    await db.analyses.delete_many({"project_id": project_id})
    return {"message": "Project deleted successfully"}

# ==================== AGENT SWARM ENDPOINTS ====================

@api_router.get("/projects/{project_id}/agents", response_model=List[AgentStatus])
async def get_project_agents(project_id: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    now = datetime.now(timezone.utc).isoformat()
    return [AgentStatus(**{**agent, "last_updated": now}) for agent in project.get("agents", [])]

@api_router.post("/projects/{project_id}/agents/{agent_id}/assign")
async def assign_task_to_agent(project_id: str, agent_id: str, task: str, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    agents = project.get("agents", [])
    updated = False
    for agent in agents:
        if agent["id"] == agent_id:
            agent["status"] = "working"
            agent["task"] = task
            agent["progress"] = 0
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"agents": agents, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Task assigned successfully"}

# ==================== DOCUMENT GENERATION ENDPOINTS ====================

DOCUMENT_PROMPTS = {
    "white_paper": """You are an expert technical writer. Create a comprehensive white paper for the following project.
Include these sections:
1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. Technical Architecture
5. Implementation Strategy
6. Market Analysis
7. Competitive Advantages
8. Conclusion and Call to Action

Format the output in clean markdown with proper headings.""",

    "business_plan": """You are a seasoned business consultant. Create a detailed business plan for this venture.
Include:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Product/Service Line
6. Marketing & Sales Strategy
7. Funding Requirements
8. Financial Projections
9. Appendix

Format in markdown with professional structure.""",

    "pitch_deck": """You are a startup pitch expert. Create content for a compelling pitch deck.
Structure the content as slides:
1. Title Slide (Company name, tagline)
2. Problem
3. Solution
4. Market Opportunity
5. Product/Demo
6. Business Model
7. Traction
8. Competition
9. Team
10. Financials
11. The Ask
12. Contact

Format each slide with a clear header and bullet points in markdown.""",

    "market_research": """You are a market research analyst. Create a comprehensive market research report.
Include:
1. Executive Summary
2. Industry Overview
3. Target Market Analysis
4. Market Size and Growth
5. Customer Segments
6. Competitive Landscape
7. Market Trends
8. SWOT Analysis
9. Entry Barriers
10. Recommendations

Format in markdown with data-driven insights.""",

    "marketing_strategy": """You are a marketing strategist. Create a detailed marketing strategy.
Include:
1. Executive Summary
2. Situation Analysis
3. Target Audience
4. Marketing Objectives
5. Brand Positioning
6. Marketing Channels
7. Content Strategy
8. Budget Allocation
9. KPIs and Metrics
10. Implementation Timeline

Format in markdown with actionable strategies.""",

    "ip_protection": """You are an intellectual property specialist. Create an IP protection guide.
Include:
1. Executive Summary
2. Types of IP Applicable
3. Patent Strategy
4. Trademark Strategy
5. Copyright Considerations
6. Trade Secret Protection
7. IP Registration Timeline
8. Budget Estimates
9. Risk Assessment
10. Recommendations

Format in markdown with practical guidance."""
}

@api_router.post("/documents/generate", response_model=DocumentResponse)
async def generate_document(request: DocumentRequest, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = await db.projects.find_one({"id": request.project_id, "user_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if request.document_type not in DOCUMENT_PROMPTS:
        raise HTTPException(status_code=400, detail=f"Invalid document type. Choose from: {list(DOCUMENT_PROMPTS.keys())}")
    
    # Update agent status
    agents = project.get("agents", [])
    for agent in agents:
        if agent["role"] == "worker":
            agent["status"] = "working"
            agent["task"] = f"Generating {request.document_type.replace('_', ' ')}"
            break
    await db.projects.update_one({"id": request.project_id}, {"$set": {"agents": agents}})
    
    # Generate document
    system_prompt = DOCUMENT_PROMPTS[request.document_type]
    user_prompt = f"""Project: {project['name']}
Description: {project['description']}
Vision: {project['vision']}
Target Market: {project['target_market']}
Problem Statement: {project['problem_statement']}
Solution: {project['solution']}
Industry: {project['industry']}

Please create the document based on these project details."""
    
    content = await generate_with_llm(system_prompt, user_prompt, f"doc-{request.project_id}-{request.document_type}")
    
    # Save document
    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    doc_record = {
        "id": doc_id,
        "project_id": request.project_id,
        "user_id": current_user["id"],
        "document_type": request.document_type,
        "title": f"{request.document_type.replace('_', ' ').title()} - {project['name']}",
        "content": content,
        "status": "completed",
        "created_at": now
    }
    await db.documents.insert_one(doc_record)
    
    # Update project documents list
    project_docs = project.get("documents", [])
    project_docs.append({"id": doc_id, "type": request.document_type, "title": doc_record["title"], "created_at": now})
    
    # Reset agent status
    for agent in agents:
        if agent["status"] == "working":
            agent["status"] = "completed"
            agent["progress"] = 100
    await db.projects.update_one({"id": request.project_id}, {"$set": {"documents": project_docs, "agents": agents}})
    
    return DocumentResponse(**{k: v for k, v in doc_record.items() if k != "user_id"})

@api_router.get("/documents/{project_id}", response_model=List[DocumentResponse])
async def get_project_documents(project_id: str, current_user: dict = Depends(get_current_user)):
    # Verify project ownership
    project = await db.projects.find_one({"id": project_id, "user_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    documents = await db.documents.find({"project_id": project_id, "user_id": current_user["id"]}, {"_id": 0, "user_id": 0}).to_list(100)
    return documents

@api_router.get("/documents/detail/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    document = await db.documents.find_one({"id": document_id, "user_id": current_user["id"]}, {"_id": 0, "user_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(**document)

# ==================== LANDING PAGE BUILDER ====================

@api_router.post("/landing-page/generate", response_model=LandingPageResponse)
async def generate_landing_page(request: LandingPageRequest, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": request.project_id, "user_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    system_prompt = """You are a professional web designer. Create a modern, responsive landing page.
Return ONLY valid HTML and CSS. Do not include any explanation.
The response must be in this exact JSON format:
{"html": "<full html content>", "css": "<full css content>"}

Design guidelines:
- Modern, clean aesthetic with professional feel
- Responsive design that works on all devices
- Use CSS variables for theming
- Include hero section, features, testimonials placeholder, and CTA
- Use semantic HTML5 elements
- Include smooth scroll behavior
- Add hover effects and transitions"""

    user_prompt = f"""Create a landing page for:
Company: {project['name']}
Description: {project['description']}
Vision: {project['vision']}
Problem: {project['problem_statement']}
Solution: {project['solution']}
Target Market: {project['target_market']}
Industry: {project['industry']}

Style preference: {request.style}
Sections to include: {', '.join(request.sections) if request.sections else 'Hero, Features, How it Works, Testimonials, CTA'}

Return the complete HTML and CSS in JSON format."""

    response = await generate_with_llm(system_prompt, user_prompt, f"landing-{request.project_id}")
    
    # Parse response - handle potential JSON in markdown code blocks
    import json
    import re
    
    try:
        # Try direct JSON parse first
        parsed = json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(1))
        else:
            # Fallback - create basic template
            parsed = {
                "html": f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{project['name']}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="hero">
        <nav class="nav-container">
            <div class="logo">{project['name']}</div>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </div>
        </nav>
        <div class="hero-content">
            <h1>{project['name']}</h1>
            <p class="tagline">{project['description']}</p>
            <a href="#contact" class="cta-button">Get Started</a>
        </div>
    </header>
    <section id="features" class="features">
        <h2>Why Choose Us</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <h3>Innovation</h3>
                <p>{project['solution']}</p>
            </div>
            <div class="feature-card">
                <h3>Vision</h3>
                <p>{project['vision']}</p>
            </div>
            <div class="feature-card">
                <h3>Market Focus</h3>
                <p>Targeting {project['target_market']}</p>
            </div>
        </div>
    </section>
    <section id="about" class="about">
        <h2>The Problem We Solve</h2>
        <p>{project['problem_statement']}</p>
    </section>
    <section id="contact" class="contact">
        <h2>Ready to Transform Your Business?</h2>
        <a href="mailto:contact@example.com" class="cta-button">Contact Us</a>
    </section>
    <footer>
        <p>&copy; 2024 {project['name']}. All rights reserved.</p>
    </footer>
</body>
</html>""",
                "css": """* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; flex-direction: column; }
.nav-container { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; }
.logo { font-size: 1.5rem; font-weight: bold; }
.nav-links a { color: white; text-decoration: none; margin-left: 2rem; transition: opacity 0.3s; }
.nav-links a:hover { opacity: 0.8; }
.hero-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; }
.hero-content h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.tagline { font-size: 1.25rem; max-width: 600px; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { background: white; color: #667eea; padding: 1rem 2.5rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s, box-shadow 0.3s; }
.cta-button:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.features, .about, .contact { padding: 5rem 10%; text-align: center; }
.features h2, .about h2, .contact h2 { font-size: 2.5rem; margin-bottom: 3rem; color: #333; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.feature-card { background: #f8f9fa; padding: 2rem; border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s; }
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }
.feature-card h3 { color: #667eea; margin-bottom: 1rem; }
.about { background: #f8f9fa; }
.about p { max-width: 800px; margin: 0 auto; font-size: 1.1rem; }
.contact { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.contact h2 { color: white; }
.contact .cta-button { background: white; color: #667eea; }
footer { background: #1a1a2e; color: white; text-align: center; padding: 2rem; }
@media (max-width: 768px) { .hero-content h1 { font-size: 2.5rem; } .nav-links { display: none; } }"""
            }
    
    html_content = parsed.get("html", "")
    css_content = parsed.get("css", "")
    
    # Create preview HTML with embedded CSS
    preview_html = html_content.replace('</head>', f'<style>{css_content}</style></head>')
    preview_html = preview_html.replace('<link rel="stylesheet" href="styles.css">', '')
    
    page_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    page_record = {
        "id": page_id,
        "project_id": request.project_id,
        "user_id": current_user["id"],
        "html_content": html_content,
        "css_content": css_content,
        "preview_html": preview_html,
        "created_at": now
    }
    await db.landing_pages.insert_one(page_record)
    
    return LandingPageResponse(**{k: v for k, v in page_record.items() if k != "user_id"})

@api_router.get("/landing-page/{project_id}", response_model=LandingPageResponse)
async def get_landing_page(project_id: str, current_user: dict = Depends(get_current_user)):
    page = await db.landing_pages.find_one(
        {"project_id": project_id, "user_id": current_user["id"]}, 
        {"_id": 0, "user_id": 0},
        sort=[("created_at", -1)]
    )
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return LandingPageResponse(**page)

# ==================== ANALYSIS & PROJECTIONS ====================

@api_router.post("/analysis/generate", response_model=AnalysisResponse)
async def generate_analysis(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": request.project_id, "user_id": current_user["id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    system_prompt = """You are a business analyst expert. Provide comprehensive analysis in JSON format only.
Return ONLY valid JSON without any explanation or markdown."""

    user_prompt = f"""Analyze this project and return JSON with these exact keys:
{{
    "comparative_analysis": {{
        "world_without_solution": {{
            "current_state": "description",
            "pain_points": ["point1", "point2", "point3"],
            "market_gap": "description",
            "missed_opportunities": ["opp1", "opp2"]
        }},
        "world_with_solution": {{
            "improved_state": "description",
            "benefits": ["benefit1", "benefit2", "benefit3"],
            "competitive_advantage": "description",
            "market_position": "description"
        }}
    }},
    "timeline_estimate": {{
        "mvp_development": {{"duration": "X months", "milestones": ["m1", "m2"]}},
        "market_launch": {{"duration": "X months", "milestones": ["m1", "m2"]}},
        "scale_up": {{"duration": "X months", "milestones": ["m1", "m2"]}},
        "total_to_profitability": "X months"
    }},
    "financial_projection": {{
        "startup_costs": {{"development": "$X", "marketing": "$X", "operations": "$X", "total": "$X"}},
        "monthly_burn_rate": "$X",
        "revenue_projections": {{"year1": "$X", "year2": "$X", "year3": "$X"}},
        "break_even_point": "X months",
        "funding_needed": "$X"
    }},
    "business_prognosis": {{
        "success_probability": "X%",
        "key_success_factors": ["factor1", "factor2", "factor3"],
        "major_risks": ["risk1", "risk2", "risk3"],
        "recommended_strategy": "description",
        "overall_assessment": "description"
    }}
}}

Project Details:
Name: {project['name']}
Description: {project['description']}
Vision: {project['vision']}
Target Market: {project['target_market']}
Problem: {project['problem_statement']}
Solution: {project['solution']}
Industry: {project['industry']}"""

    response = await generate_with_llm(system_prompt, user_prompt, f"analysis-{request.project_id}")
    
    import json
    import re
    
    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(1))
        else:
            # Fallback structure
            parsed = {
                "comparative_analysis": {"world_without_solution": {"current_state": "Analysis pending"}, "world_with_solution": {"improved_state": "Analysis pending"}},
                "timeline_estimate": {"mvp_development": {"duration": "3-6 months"}, "total_to_profitability": "18-24 months"},
                "financial_projection": {"startup_costs": {"total": "$50,000-150,000"}, "funding_needed": "$100,000-500,000"},
                "business_prognosis": {"success_probability": "Depends on execution", "overall_assessment": "Full analysis requires more data"}
            }
    
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    analysis_record = {
        "id": analysis_id,
        "project_id": request.project_id,
        "user_id": current_user["id"],
        "comparative_analysis": parsed.get("comparative_analysis", {}),
        "timeline_estimate": parsed.get("timeline_estimate", {}),
        "financial_projection": parsed.get("financial_projection", {}),
        "business_prognosis": parsed.get("business_prognosis", {}),
        "created_at": now
    }
    await db.analyses.insert_one(analysis_record)
    
    return AnalysisResponse(**{k: v for k, v in analysis_record.items() if k != "user_id"})

@api_router.get("/analysis/{project_id}", response_model=AnalysisResponse)
async def get_analysis(project_id: str, current_user: dict = Depends(get_current_user)):
    analysis = await db.analyses.find_one(
        {"project_id": project_id, "user_id": current_user["id"]},
        {"_id": 0, "user_id": 0},
        sort=[("created_at", -1)]
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResponse(**analysis)

# ==================== HEALTH & STATUS ====================

@api_router.get("/")
async def root():
    return {"message": "IdeaForge API - Innovation Launch Platform", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
