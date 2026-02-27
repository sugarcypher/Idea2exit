import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, landingPageAPI } from '../lib/api';
import { downloadFile } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Zap, ArrowLeft, Loader2, Globe, Download, Monitor,
  Tablet, Smartphone, Code, Eye, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const STYLES = [
  { id: 'modern', label: 'Modern & Clean' },
  { id: 'bold', label: 'Bold & Dynamic' },
  { id: 'minimal', label: 'Minimal & Elegant' },
  { id: 'corporate', label: 'Corporate & Professional' },
];

export default function LandingPageBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [style, setStyle] = useState('modern');
  const [viewMode, setViewMode] = useState('desktop');

  useEffect(() => {
    loadData();
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
      const response = await landingPageAPI.generate({
        project_id: id,
        style: style
      });
      setLandingPage(response.data);
      toast.success('Landing page generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate landing page');
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

  const handleDownloadAll = () => {
    if (!landingPage) return;
    // Download combined HTML with embedded CSS
    downloadFile(landingPage.preview_html, `${project.name.replace(/\s+/g, '_')}_landing_complete.html`, 'text/html');
    toast.success('Complete landing page downloaded');
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
              <Button variant="outline" size="sm" onClick={handleDownloadAll} className="border-primary/30" data-testid="download-all-btn">
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
                <SelectTrigger className="custom-input" data-testid="style-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateLandingPage}
              disabled={generating}
              className="w-full btn-glow"
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
                  <div className="preview-frame rounded-lg overflow-hidden shadow-2xl">
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
                  className="btn-glow"
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
