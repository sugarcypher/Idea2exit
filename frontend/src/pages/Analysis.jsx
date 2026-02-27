import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, analysisAPI } from '../lib/api';
import { formatDate } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Zap, ArrowLeft, Loader2, TrendingUp, DollarSign, Clock,
  Target, AlertTriangle, CheckCircle2, BarChart3, RefreshCw,
  ThumbsUp, ThumbsDown, Lightbulb, Scale
} from 'lucide-react';
import { toast } from 'sonner';

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const projectRes = await projectAPI.getOne(id);
      setProject(projectRes.data);
      
      try {
        const analysisRes = await analysisAPI.get(id);
        setAnalysis(analysisRes.data);
      } catch (e) {
        // No analysis yet
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setGenerating(true);
    try {
      const response = await analysisAPI.generate({ project_id: id });
      setAnalysis(response.data);
      toast.success('Analysis generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate analysis');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const comparative = analysis?.comparative_analysis || {};
  const timeline = analysis?.timeline_estimate || {};
  const financial = analysis?.financial_projection || {};
  const prognosis = analysis?.business_prognosis || {};

  return (
    <div className="min-h-screen bg-background" data-testid="analysis-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Analysis & Projections</h1>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
          </div>
          
          {analysis && (
            <Button 
              variant="outline" 
              onClick={generateAnalysis}
              disabled={generating}
              className="border-primary/30"
              data-testid="regenerate-btn"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Regenerate
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {analysis ? (
          <Tabs defaultValue="comparative" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/40 p-1">
              <TabsTrigger value="comparative" data-testid="tab-comparative">
                <Scale className="w-4 h-4 mr-2" />
                Comparative
              </TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial">
                <DollarSign className="w-4 h-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="prognosis" data-testid="tab-prognosis">
                <BarChart3 className="w-4 h-4 mr-2" />
                Prognosis
              </TabsTrigger>
            </TabsList>

            {/* Comparative Analysis Tab */}
            <TabsContent value="comparative" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Without Solution */}
                <Card className="glass-card border-red-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <ThumbsDown className="w-5 h-5 text-red-400" />
                      </div>
                      <CardTitle className="heading-3 text-red-400">World Without Your Solution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="caption-text">Current State</span>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {comparative.world_without_solution?.current_state || 'Analysis pending'}
                      </p>
                    </div>
                    <div>
                      <span className="caption-text">Pain Points</span>
                      <ul className="mt-2 space-y-2">
                        {(comparative.world_without_solution?.pain_points || []).map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="caption-text">Market Gap</span>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {comparative.world_without_solution?.market_gap || 'Analysis pending'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* With Solution */}
                <Card className="glass-card border-emerald-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ThumbsUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <CardTitle className="heading-3 text-emerald-400">World With Your Solution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="caption-text">Improved State</span>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {comparative.world_with_solution?.improved_state || 'Analysis pending'}
                      </p>
                    </div>
                    <div>
                      <span className="caption-text">Benefits</span>
                      <ul className="mt-2 space-y-2">
                        {(comparative.world_with_solution?.benefits || []).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="caption-text">Competitive Advantage</span>
                      <p className="mt-2 text-muted-foreground text-sm">
                        {comparative.world_with_solution?.competitive_advantage || 'Analysis pending'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                      <Lightbulb className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="caption-text">MVP Development</p>
                    <p className="metric-text text-blue-400 mt-2">{timeline.mvp_development?.duration || 'TBD'}</p>
                    <div className="mt-4 space-y-1">
                      {(timeline.mvp_development?.milestones || []).map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {m}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="caption-text">Market Launch</p>
                    <p className="metric-text text-purple-400 mt-2">{timeline.market_launch?.duration || 'TBD'}</p>
                    <div className="mt-4 space-y-1">
                      {(timeline.market_launch?.milestones || []).map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {m}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="caption-text">Scale Up</p>
                    <p className="metric-text text-emerald-400 mt-2">{timeline.scale_up?.duration || 'TBD'}</p>
                    <div className="mt-4 space-y-1">
                      {(timeline.scale_up?.milestones || []).map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {m}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <p className="caption-text">Total to Profitability</p>
                    <p className="metric-text text-primary mt-2">{timeline.total_to_profitability || 'TBD'}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-border/40">
                  <CardHeader>
                    <CardTitle className="heading-3">Startup Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Development</span>
                      <span className="font-mono font-medium">{financial.startup_costs?.development || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Marketing</span>
                      <span className="font-mono font-medium">{financial.startup_costs?.marketing || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Operations</span>
                      <span className="font-mono font-medium">{financial.startup_costs?.operations || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <span className="font-medium">Total</span>
                      <span className="font-mono font-bold text-primary">{financial.startup_costs?.total || 'TBD'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40">
                  <CardHeader>
                    <CardTitle className="heading-3">Revenue Projections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 1</span>
                      <span className="font-mono font-medium text-emerald-400">{financial.revenue_projections?.year1 || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 2</span>
                      <span className="font-mono font-medium text-emerald-400">{financial.revenue_projections?.year2 || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 3</span>
                      <span className="font-mono font-medium text-emerald-400">{financial.revenue_projections?.year3 || 'TBD'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="caption-text text-amber-400">Monthly Burn</p>
                        <p className="font-mono font-medium mt-1">{financial.monthly_burn_rate || 'TBD'}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="caption-text text-emerald-400">Break Even</p>
                        <p className="font-mono font-medium mt-1">{financial.break_even_point || 'TBD'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-primary/30 bg-primary/5">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="caption-text">Recommended Funding</p>
                    <p className="text-sm text-muted-foreground mt-1">To reach profitability with buffer</p>
                  </div>
                  <p className="metric-text text-primary">{financial.funding_needed || 'TBD'}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prognosis Tab */}
            <TabsContent value="prognosis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card border-border/40">
                  <CardHeader>
                    <CardTitle className="heading-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Key Success Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(prognosis.key_success_factors || []).map((factor, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-mono text-emerald-400 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40">
                  <CardHeader>
                    <CardTitle className="heading-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Major Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(prognosis.major_risks || []).map((risk, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-mono text-amber-400 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-primary/30">
                  <CardHeader>
                    <CardTitle className="heading-3">Success Probability</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-32 h-32">
                        <circle
                          className="text-secondary"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                        />
                        <circle
                          className="text-primary"
                          strokeWidth="8"
                          strokeDasharray={`${(parseInt(prognosis.success_probability) || 0) * 3.52} 352`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                      </svg>
                      <span className="absolute metric-text text-primary">
                        {prognosis.success_probability || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="heading-3">Recommended Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{prognosis.recommended_strategy || 'Analysis pending'}</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="heading-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Overall Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{prognosis.overall_assessment || 'Analysis pending'}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Business Analysis</h3>
              <p className="text-muted-foreground mb-6">
                Get comprehensive insights including comparative analysis, timeline estimates, financial projections, and business prognosis.
              </p>
              <Button 
                onClick={generateAnalysis}
                disabled={generating}
                className="btn-glow"
                size="lg"
                data-testid="generate-analysis-btn"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
