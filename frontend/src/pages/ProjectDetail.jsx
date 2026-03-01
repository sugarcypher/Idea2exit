import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, documentAPI } from '../lib/api';
import { formatDate } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import WorkflowProgress from '../components/WorkflowProgress';
import {
  Zap, ArrowLeft, Loader2, Users, FileText, Globe, TrendingUp,
  Briefcase, Target, Puzzle, Clock, Trash2, Activity, 
  CheckCircle2, AlertCircle, Circle, ExternalLink, 
  Building2, Shield, CreditCard, Calculator, Rocket
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      const [projectRes, docsRes] = await Promise.all([
        projectAPI.getOne(id),
        documentAPI.getAll(id)
      ]);
      setProject(projectRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'working': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Determine completed workflow steps
  const getCompletedSteps = () => {
    const completed = ['project'];
    if (documents.length > 0) completed.push('documents');
    // Add more logic based on landing page and analysis
    return completed;
  };

  const getCurrentStep = () => {
    const completed = getCompletedSteps();
    if (completed.includes('analysis')) return 'launch';
    if (completed.includes('landing')) return 'analysis';
    if (completed.includes('documents')) return 'landing';
    return 'documents';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  const managers = project.agents?.filter(a => a.role === 'manager') || [];
  const specialists = project.agents?.filter(a => a.role === 'specialist') || [];
  const workers = project.agents?.filter(a => a.role === 'worker') || [];

  // Business services (future integrations)
  const businessServices = [
    { 
      id: 'domain', 
      name: 'Domain & Hosting', 
      description: 'Register domain and set up hosting',
      icon: Globe, 
      status: 'available',
      action: 'Purchase Domain'
    },
    { 
      id: 'formation', 
      name: 'Business Formation', 
      description: 'LLC, Corp, or other entity setup',
      icon: Building2, 
      status: 'available',
      action: 'Start Formation'
    },
    { 
      id: 'trademark', 
      name: 'Trademark Filing', 
      description: 'Protect your brand name and logo',
      icon: Shield, 
      status: 'available',
      action: 'File Trademark'
    },
    { 
      id: 'banking', 
      name: 'Business Banking', 
      description: 'Open a business bank account',
      icon: CreditCard, 
      status: 'coming_soon',
      action: 'Coming Soon'
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="project-detail-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>{project.name}</h1>
                <p className="text-xs text-muted-foreground">{project.industry}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={deleting}
              data-testid="delete-project-btn"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Workflow Progress */}
        <Card className="glass-card border-border/40 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowProgress 
              projectId={id}
              currentStep={getCurrentStep()}
              completedSteps={getCompletedSteps()}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/40 p-1">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">AI Agents</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">Tools</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Business Services</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <Card className="lg:col-span-2 glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Description</span>
                    <p className="mt-2 text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Vision
                      </span>
                      <p className="mt-2 text-muted-foreground text-sm">{project.vision}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Target Market
                      </span>
                      <p className="mt-2 text-muted-foreground text-sm">{project.target_market}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Puzzle className="w-3 h-3" />
                      Problem Statement
                    </span>
                    <p className="mt-2 text-muted-foreground text-sm">{project.problem_statement}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Solution
                    </span>
                    <p className="mt-2 text-muted-foreground text-sm">{project.solution}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Created</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-medium">{formatDate(project.created_at)}</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Documents</span>
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-purple-400 font-mono">{documents.length}</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">AI Agents</span>
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary font-mono">{project.agents?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Managers */}
              <div>
                <h3 className="text-sm font-medium text-purple-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  Managers ({managers.length})
                </h3>
                <div className="space-y-3">
                  {managers.map((agent) => (
                    <Card key={agent.id} className="glass-card border-purple-500/20 bg-purple-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          {getStatusIcon(agent.status)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                        {agent.task && (
                          <p className="text-xs text-purple-400 mt-2 truncate">{agent.task}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Specialists */}
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  Specialists ({specialists.length})
                </h3>
                <div className="space-y-3">
                  {specialists.map((agent) => (
                    <Card key={agent.id} className="glass-card border-blue-500/20 bg-blue-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          {getStatusIcon(agent.status)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                        {agent.task && (
                          <p className="text-xs text-blue-400 mt-2 truncate">{agent.task}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Workers */}
              <div>
                <h3 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Workers ({workers.length})
                </h3>
                <div className="space-y-3">
                  {workers.map((agent) => (
                    <Card key={agent.id} className="glass-card border-emerald-500/20 bg-emerald-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          {getStatusIcon(agent.status)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
                        {agent.task && (
                          <p className="text-xs text-emerald-400 mt-2 truncate">{agent.task}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Generated Documents</h3>
              <Button 
                onClick={() => navigate(`/projects/${id}/documents`)}
                className="bg-primary hover:bg-primary/90"
                data-testid="generate-docs-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate New Document
              </Button>
            </div>
            
            {documents.length === 0 ? (
              <Card className="glass-card border-border/40">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No documents generated yet</p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/projects/${id}/documents`)}
                    className="border-primary/30"
                    data-testid="empty-generate-docs-btn"
                  >
                    Generate Your First Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/projects/${id}/documents/${doc.id}`}
                    className="block"
                    data-testid={`document-card-${doc.id}`}
                  >
                    <Card className="glass-card border-border/40 hover:border-primary/30 transition-all duration-200 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {doc.document_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(doc.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="glass-card border-border/40 cursor-pointer hover:border-primary/30 transition-all duration-200"
                onClick={() => navigate(`/projects/${id}/documents`)}
                data-testid="tool-documents"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Document Hub</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate white papers, business plans, pitch decks, and more.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-border/40 cursor-pointer hover:border-primary/30 transition-all duration-200"
                onClick={() => navigate(`/projects/${id}/landing-page`)}
                data-testid="tool-landing-page"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Landing Page Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a professional landing page for your venture.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-border/40 cursor-pointer hover:border-primary/30 transition-all duration-200"
                onClick={() => navigate(`/projects/${id}/analysis`)}
                data-testid="tool-analysis"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Analytics & Projections</h3>
                  <p className="text-sm text-muted-foreground">
                    Get comprehensive business analysis and financial projections.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass-card border-border/40 cursor-pointer hover:border-primary/30 transition-all duration-200"
                onClick={() => navigate(`/projects/${id}/simulation`)}
                data-testid="tool-simulation"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <Calculator className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Simulation Lab</h3>
                  <p className="text-sm text-muted-foreground">
                    Run what-if scenarios for financial, market, growth, and launch planning.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Business Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Business Services</h3>
              <p className="text-muted-foreground">Launch and scale your business with our partner services</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessServices.map((service) => {
                const Icon = service.icon;
                const isComingSoon = service.status === 'coming_soon';
                
                return (
                  <Card 
                    key={service.id}
                    className={`glass-card border-border/40 ${!isComingSoon ? 'cursor-pointer hover:border-primary/30' : 'opacity-70'} transition-all duration-200`}
                    data-testid={`service-${service.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/40">
                        <Button 
                          variant={isComingSoon ? 'ghost' : 'outline'}
                          size="sm"
                          className={isComingSoon ? 'text-muted-foreground' : 'border-primary/30 hover:bg-primary/10'}
                          disabled={isComingSoon}
                        >
                          {isComingSoon ? (
                            'Coming Soon'
                          ) : (
                            <>
                              {service.action}
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
