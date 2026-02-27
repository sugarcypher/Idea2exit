import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../lib/api';
import { formatDate, truncateText } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Zap, Plus, FolderOpen, FileText, Users, TrendingUp,
  ArrowRight, Loader2, LayoutDashboard, LogOut, Settings,
  Briefcase, Lightbulb, Clock, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, documents: 0 });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
      
      // Calculate stats
      const totalDocs = response.data.reduce((acc, p) => acc + (p.documents?.length || 0), 0);
      setStats({
        total: response.data.length,
        active: response.data.filter(p => p.status === 'active').length,
        documents: totalDocs
      });
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex" data-testid="dashboard-page">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-card/30 border-r border-border/40 p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            IdeaForge
          </span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link 
            to="/dashboard" 
            className="sidebar-link active"
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/projects/new" 
            className="sidebar-link"
            data-testid="nav-new-project"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Link>
          <div className="pt-4 pb-2">
            <span className="caption-text px-4">Projects</span>
          </div>
          <ScrollArea className="h-[200px]">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="sidebar-link text-sm"
                data-testid={`nav-project-${project.id}`}
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </ScrollArea>
        </nav>

        <div className="pt-6 border-t border-border/40 space-y-2">
          <Link to="/settings" className="sidebar-link" data-testid="nav-settings">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="sidebar-link w-full text-left text-destructive"
            data-testid="nav-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 max-w-[1400px]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <p className="caption-text mb-1">Welcome back</p>
              <h1 className="heading-2">{user?.full_name || 'Innovator'}</h1>
            </div>
            <Button 
              onClick={() => navigate('/projects/new')}
              className="btn-glow"
              data-testid="create-project-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            <Card className="glass-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="caption-text mb-1">Total Projects</p>
                    <p className="metric-text text-foreground">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="caption-text mb-1">Active Projects</p>
                    <p className="metric-text text-emerald-400">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="caption-text mb-1">Documents Generated</p>
                    <p className="metric-text text-purple-400">{stats.documents}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Recent Projects - 2 cols */}
            <Card className="lg:col-span-2 glass-card border-border/40">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="heading-3">Recent Projects</CardTitle>
                  <Link 
                    to="/projects" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                    data-testid="view-all-projects"
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No projects yet</p>
                    <Button 
                      onClick={() => navigate('/projects/new')}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10"
                      data-testid="empty-create-project-btn"
                    >
                      Create your first project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="block p-4 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-200"
                        data-testid={`project-card-${project.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {truncateText(project.description, 80)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-4 flex-shrink-0">
                            {project.industry || 'General'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {project.documents?.length || 0} docs
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.agents?.length || 0} agents
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(project.created_at)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-border/40">
              <CardHeader className="pb-4">
                <CardTitle className="heading-3">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-4 px-4 border-border/40 hover:bg-primary/10 hover:border-primary/30"
                  onClick={() => navigate('/projects/new')}
                  data-testid="quick-new-project"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">New Project</p>
                    <p className="text-xs text-muted-foreground">Start a new venture</p>
                  </div>
                </Button>
                {projects.length > 0 && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-4 px-4 border-border/40 hover:bg-purple-500/10 hover:border-purple-500/30"
                      onClick={() => navigate(`/projects/${projects[0].id}/documents`)}
                      data-testid="quick-generate-docs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Generate Documents</p>
                        <p className="text-xs text-muted-foreground">Business plans, pitch decks</p>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto py-4 px-4 border-border/40 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                      onClick={() => navigate(`/projects/${projects[0].id}/analysis`)}
                      data-testid="quick-analysis"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-4">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Run Analysis</p>
                        <p className="text-xs text-muted-foreground">Financial projections</p>
                      </div>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
