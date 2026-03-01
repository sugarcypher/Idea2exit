import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, landingPageAPI } from '../lib/api';
import { downloadFile } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft, Loader2, Globe, Download, Monitor,
  Tablet, Smartphone, Code, Eye, RefreshCw, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const STYLES = [
  { id: 'modern', label: 'Modern & Clean' },
  { id: 'bold', label: 'Bold & Dynamic' },
  { id: 'minimal', label: 'Minimal & Elegant' },
  { id: 'corporate', label: 'Corporate & Professional' },
];

// Fallback template generator
const generateFallbackTemplate = (project, style) => {
  const colors = {
    modern: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
    bold: { primary: '#DC2626', secondary: '#991B1B', accent: '#F87171' },
    minimal: { primary: '#18181B', secondary: '#27272A', accent: '#71717A' },
    corporate: { primary: '#0F766E', secondary: '#134E4A', accent: '#14B8A6' },
  };
  
  const c = colors[style] || colors.modern;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">${project.name}</div>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <a href="#contact" class="cta-btn">Get Started</a>
            </div>
        </div>
    </nav>
    
    <header class="hero">
        <div class="hero-content">
            <h1>${project.name}</h1>
            <p class="tagline">${project.description}</p>
            <div class="hero-buttons">
                <a href="#contact" class="btn-primary">Get Started</a>
                <a href="#features" class="btn-secondary">Learn More</a>
            </div>
        </div>
    </header>
    
    <section id="features" class="features">
        <div class="container">
            <h2>Why Choose Us</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">✨</div>
                    <h3>Innovative Solution</h3>
                    <p>${project.solution}</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎯</div>
                    <h3>Our Vision</h3>
                    <p>${project.vision}</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <h3>Target Market</h3>
                    <p>${project.target_market}</p>
                </div>
            </div>
        </div>
    </section>
    
    <section id="about" class="about">
        <div class="container">
            <h2>The Problem We Solve</h2>
            <p>${project.problem_statement}</p>
        </div>
    </section>
    
    <section id="contact" class="contact">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join us in revolutionizing the ${project.industry || 'industry'}</p>
            <a href="mailto:contact@${project.name.toLowerCase().replace(/\s+/g, '')}.com" class="btn-primary">Contact Us</a>
        </div>
    </section>
    
    <footer>
        <div class="container">
            <p>&copy; 2026 ${project.name}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

  const css = `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a1a; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.navbar { position: fixed; top: 0; left: 0; right: 0; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; }
.nav-container { max-width: 1200px; margin: 0 auto; padding: 1rem 20px; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.5rem; font-weight: 700; color: ${c.primary}; }
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { text-decoration: none; color: #4a4a4a; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover { color: ${c.primary}; }
.cta-btn { background: ${c.primary}; color: white !important; padding: 0.5rem 1.5rem; border-radius: 8px; }
.cta-btn:hover { background: ${c.secondary}; }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%); color: white; text-align: center; padding: 6rem 2rem 4rem; }
.hero-content { max-width: 800px; }
.hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1.5rem; }
.tagline { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
.hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { background: white; color: ${c.primary}; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s, box-shadow 0.3s; display: inline-block; }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.btn-secondary { background: transparent; color: white; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; border: 2px solid white; display: inline-block; transition: background 0.3s; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.features { padding: 6rem 0; background: #f8f9fa; }
.features h2, .about h2, .contact h2 { font-size: 2.5rem; text-align: center; margin-bottom: 3rem; color: #1a1a1a; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.feature-card { background: white; padding: 2rem; border-radius: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s, box-shadow 0.3s; }
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 40px rgba(0,0,0,0.12); }
.feature-icon { font-size: 3rem; margin-bottom: 1rem; }
.feature-card h3 { color: ${c.primary}; margin-bottom: 1rem; font-size: 1.25rem; }
.feature-card p { color: #666; }
.about { padding: 6rem 0; text-align: center; }
.about p { max-width: 800px; margin: 0 auto; font-size: 1.1rem; color: #4a4a4a; }
.contact { padding: 6rem 0; background: linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%); color: white; text-align: center; }
.contact h2 { color: white; }
.contact p { margin-bottom: 2rem; opacity: 0.9; }
.contact .btn-primary { background: white; color: ${c.primary}; }
footer { background: #1a1a1a; color: white; text-align: center; padding: 2rem; }
@media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } .nav-links { display: none; } }`;

  return { html, css };
};

export default function LandingPageBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [style, setStyle] = useState('modern');
  const [viewMode, setViewMode] = useState('desktop');
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      const projectRes = await projectAPI.getOne(id);
      setProject(projectRes.data);
      
      try {
        const pageRes = await landingPageAPI.get(id);
        setLandingPage(pageRes.data);
      } catch (e) {
        // No landing page yet
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateLandingPage = async () => {
    setGenerating(true);
    
    try {
      if (useAI) {
        // Try AI generation first
        const response = await landingPageAPI.generate({
          project_id: id,
          style: style
        });
        setLandingPage(response.data);
        toast.success('AI-powered landing page generated!');
      } else {
        throw new Error('Use template');
      }
    } catch (error) {
      // Fallback to template
      console.log('Using fallback template');
      const { html, css } = generateFallbackTemplate(project, style);
      const previewHtml = html.replace('</head>', `<style>${css}</style></head>`);
      
      setLandingPage({
        id: 'local-' + Date.now(),
        project_id: id,
        html_content: html,
        css_content: css,
        preview_html: previewHtml,
        created_at: new Date().toISOString()
      });
      toast.success('Landing page generated from template!');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!landingPage) return;
    downloadFile(landingPage.preview_html, `${project.name.replace(/\s+/g, '_')}_landing.html`, 'text/html');
    toast.success('HTML file downloaded');
  };

  const handleDownloadCSS = () => {
    if (!landingPage) return;
    downloadFile(landingPage.css_content, 'styles.css', 'text/css');
    toast.success('CSS file downloaded');
  };

  const getPreviewWidth = () => {
    switch (viewMode) {
      case 'tablet': return 'max-w-[768px]';
      case 'mobile': return 'max-w-[375px]';
      default: return 'max-w-full';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page-builder">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Landing Page Builder</h1>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
          </div>
          
          {landingPage && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="border-primary/30" data-testid="download-all-btn">
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Controls */}
        <aside className="w-80 border-r border-border/40 bg-card/20 p-6 overflow-auto">
          <h2 className="text-sm font-medium mb-4">Generator Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-secondary/50 border-border/50" data-testid="style-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
              <input 
                type="checkbox" 
                id="useAI" 
                checked={useAI} 
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="useAI" className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Use AI Generation
              </label>
            </div>

            <Button 
              onClick={generateLandingPage}
              disabled={generating}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="generate-landing-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : landingPage ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Generate Landing Page
                </>
              )}
            </Button>
          </div>

          {landingPage && (
            <>
              <h2 className="text-sm font-medium mt-8 mb-4">Preview Controls</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="flex-1"
                  data-testid="view-desktop"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="flex-1"
                  data-testid="view-tablet"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="flex-1"
                  data-testid="view-mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <h2 className="text-sm font-medium mt-8 mb-4">Export Options</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadHTML}
                  className="w-full justify-start"
                  data-testid="download-html-btn"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCSS}
                  className="w-full justify-start"
                  data-testid="download-css-btn"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Download CSS
                </Button>
              </div>
            </>
          )}
        </aside>

        {/* Main Content - Preview */}
        <main className="flex-1 overflow-auto bg-secondary/20">
          {landingPage ? (
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <div className="border-b border-border/40 bg-card/30 px-6 py-3">
                <TabsList className="bg-card/50 border border-border/40">
                  <TabsTrigger value="preview" data-testid="tab-preview">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" data-testid="tab-code">
                    <Code className="w-4 h-4 mr-2" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="preview" className="flex-1 p-6 overflow-auto">
                <div className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}>
                  <div className="rounded-lg overflow-hidden shadow-2xl border border-border/40">
                    <iframe
                      srcDoc={landingPage.preview_html}
                      title="Landing Page Preview"
                      className="w-full h-[800px] bg-white"
                      data-testid="preview-iframe"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="code" className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  <div className="border-r border-border/40 overflow-auto">
                    <div className="p-4 border-b border-border/40 bg-card/50">
                      <h3 className="font-medium text-sm">HTML</h3>
                    </div>
                    <pre className="p-4 text-xs text-muted-foreground font-mono whitespace-pre-wrap overflow-auto">
                      {landingPage.html_content}
                    </pre>
                  </div>
                  <div className="overflow-auto">
                    <div className="p-4 border-b border-border/40 bg-card/50">
                      <h3 className="font-medium text-sm">CSS</h3>
                    </div>
                    <pre className="p-4 text-xs text-muted-foreground font-mono whitespace-pre-wrap overflow-auto">
                      {landingPage.css_content}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Your Landing Page</h3>
                <p className="text-muted-foreground mb-6">
                  Generate a professional, responsive landing page for your venture with just one click.
                </p>
                <Button 
                  onClick={generateLandingPage}
                  disabled={generating}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                  data-testid="empty-generate-btn"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Generate Landing Page
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
