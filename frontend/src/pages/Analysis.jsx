import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, analysisAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ArrowLeft, Loader2, TrendingUp, DollarSign, Clock,
  Target, AlertTriangle, CheckCircle2, BarChart3, RefreshCw,
  ThumbsUp, ThumbsDown, Lightbulb, Scale, Globe, PieChart,
  Users, Megaphone, ShoppingCart, Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [marketScope, setMarketScope] = useState('regional');
  const [financialScenario, setFinancialScenario] = useState('B');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Enhanced mock data for comprehensive analytics
  const marketingAnalytics = {
    cac: '$45-85',
    ltv: '$450-1200',
    conversionRate: '2.5-4.5%',
    channels: [
      { name: 'Organic Search', share: 35, growth: '+12%' },
      { name: 'Paid Social', share: 25, growth: '+8%' },
      { name: 'Content Marketing', share: 20, growth: '+15%' },
      { name: 'Referrals', share: 15, growth: '+22%' },
      { name: 'Email', share: 5, growth: '+5%' },
    ]
  };

  const salesAnalytics = {
    avgDealSize: '$2,500-5,000',
    salesCycle: '30-45 days',
    winRate: '25-35%',
    pipeline: [
      { stage: 'Leads', count: 1000, value: '$2.5M' },
      { stage: 'Qualified', count: 400, value: '$1.2M' },
      { stage: 'Proposal', count: 150, value: '$600K' },
      { stage: 'Negotiation', count: 75, value: '$350K' },
      { stage: 'Closed', count: 30, value: '$150K' },
    ]
  };

  const industryData = {
    marketSize: marketScope === 'global' ? '$45.2B' : '$12.8B',
    growth: '12.5% CAGR',
    competitors: 45,
    marketShare: '0.5-2%',
    trends: [
      'AI/ML Integration increasing 40% YoY',
      'Mobile-first solutions dominating',
      'Sustainability focus growing',
      'B2B market expanding faster than B2C',
    ]
  };

  // Financial scenarios A/B/C
  const financialScenarios = {
    A: { // Conservative
      label: 'Conservative',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      startupCosts: '$75,000',
      monthlyBurn: '$15,000',
      breakEven: '24 months',
      year1Revenue: '$180,000',
      year2Revenue: '$450,000',
      year3Revenue: '$900,000',
      fundingNeeded: '$200,000',
      roi: '150%',
    },
    B: { // Moderate
      label: 'Moderate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      startupCosts: '$125,000',
      monthlyBurn: '$25,000',
      breakEven: '18 months',
      year1Revenue: '$350,000',
      year2Revenue: '$850,000',
      year3Revenue: '$1.8M',
      fundingNeeded: '$400,000',
      roi: '280%',
    },
    C: { // Aggressive
      label: 'Aggressive',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      startupCosts: '$250,000',
      monthlyBurn: '$50,000',
      breakEven: '14 months',
      year1Revenue: '$750,000',
      year2Revenue: '$2.2M',
      year3Revenue: '$5.5M',
      fundingNeeded: '$750,000',
      roi: '450%',
    }
  };

  const currentScenario = financialScenarios[financialScenario];
  const comparative = analysis?.comparative_analysis || {};
  const timeline = analysis?.timeline_estimate || {};
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
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Analytics & Projections</h1>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={marketScope} onValueChange={setMarketScope}>
              <SelectTrigger className="w-[140px] bg-secondary/50" data-testid="market-scope-select">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="global">Global</SelectItem>
              </SelectContent>
            </Select>
            
            {analysis && (
              <Button 
                variant="outline" 
                onClick={generateAnalysis}
                disabled={generating}
                className="border-primary/30"
                data-testid="regenerate-btn"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {analysis ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/40 p-1 flex-wrap">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="marketing" data-testid="tab-marketing">
                <Megaphone className="w-4 h-4 mr-2" />
                Marketing
              </TabsTrigger>
              <TabsTrigger value="sales" data-testid="tab-sales">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="industry" data-testid="tab-industry">
                <Building2 className="w-4 h-4 mr-2" />
                Industry
              </TabsTrigger>
              <TabsTrigger value="financial" data-testid="tab-financial">
                <DollarSign className="w-4 h-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="prognosis" data-testid="tab-prognosis">
                <Target className="w-4 h-4 mr-2" />
                Prognosis
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Market Size</span>
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary font-mono">{industryData.marketSize}</p>
                    <p className="text-xs text-muted-foreground mt-1">{marketScope === 'global' ? 'Global' : 'Regional'} TAM</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Growth Rate</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">{industryData.growth}</p>
                    <p className="text-xs text-muted-foreground mt-1">Annual Growth</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Break Even</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-amber-400 font-mono">{currentScenario.breakEven}</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentScenario.label} Scenario</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Est. ROI</span>
                      <PieChart className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-purple-400 font-mono">{currentScenario.roi}</p>
                    <p className="text-xs text-muted-foreground mt-1">3-Year Return</p>
                  </CardContent>
                </Card>
              </div>

              {/* Comparative Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-red-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <ThumbsDown className="w-5 h-5 text-red-400" />
                      </div>
                      <CardTitle className="text-lg text-red-400">Without Your Solution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {comparative.world_without_solution?.current_state || 'Market continues with inefficient legacy solutions'}
                    </p>
                    <ul className="space-y-2">
                      {(comparative.world_without_solution?.pain_points || ['Inefficient processes', 'High costs', 'Poor user experience']).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-emerald-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <ThumbsUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <CardTitle className="text-lg text-emerald-400">With Your Solution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {comparative.world_with_solution?.improved_state || 'Streamlined operations with modern technology'}
                    </p>
                    <ul className="space-y-2">
                      {(comparative.world_with_solution?.benefits || ['Increased efficiency', 'Cost savings', 'Better UX']).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Marketing Analytics Tab */}
            <TabsContent value="marketing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Customer Acquisition Cost</p>
                    <p className="text-3xl font-bold text-primary font-mono">{marketingAnalytics.cac}</p>
                    <p className="text-xs text-emerald-400 mt-1">Industry avg: $60-120</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Lifetime Value</p>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">{marketingAnalytics.ltv}</p>
                    <p className="text-xs text-muted-foreground mt-1">LTV:CAC ratio 5-15x</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-purple-400 font-mono">{marketingAnalytics.conversionRate}</p>
                    <p className="text-xs text-muted-foreground mt-1">Visitor to customer</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Channel Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketingAnalytics.channels.map((channel, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-32 text-sm text-muted-foreground">{channel.name}</span>
                        <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${channel.share}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm font-mono text-right">{channel.share}%</span>
                        <span className="w-16 text-sm font-mono text-emerald-400 text-right">{channel.growth}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Analytics Tab */}
            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Avg Deal Size</p>
                    <p className="text-3xl font-bold text-primary font-mono">{salesAnalytics.avgDealSize}</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sales Cycle</p>
                    <p className="text-3xl font-bold text-amber-400 font-mono">{salesAnalytics.salesCycle}</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Win Rate</p>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">{salesAnalytics.winRate}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Sales Pipeline (Projected)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesAnalytics.pipeline.map((stage, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-28 text-sm text-muted-foreground">{stage.stage}</span>
                        <div className="flex-1 h-8 bg-secondary/50 rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                            style={{ width: `${(stage.count / 1000) * 100}%` }}
                          >
                            <span className="text-xs font-mono text-white">{stage.count}</span>
                          </div>
                        </div>
                        <span className="w-20 text-sm font-mono text-emerald-400 text-right">{stage.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Industry Data Tab */}
            <TabsContent value="industry" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Addressable Market</p>
                    <p className="text-3xl font-bold text-primary font-mono">{industryData.marketSize}</p>
                    <p className="text-xs text-muted-foreground mt-1">{marketScope === 'global' ? 'Worldwide' : 'Target Region'}</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Market Growth</p>
                    <p className="text-3xl font-bold text-emerald-400 font-mono">{industryData.growth}</p>
                    <p className="text-xs text-muted-foreground mt-1">Compound Annual</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Competitors</p>
                    <p className="text-3xl font-bold text-amber-400 font-mono">{industryData.competitors}</p>
                    <p className="text-xs text-muted-foreground mt-1">Direct competitors</p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-border/40">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Target Market Share</p>
                    <p className="text-3xl font-bold text-purple-400 font-mono">{industryData.marketShare}</p>
                    <p className="text-xs text-muted-foreground mt-1">Year 3 goal</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Industry Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {industryData.trends.map((trend, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-secondary/20">
                        <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Projections Tab */}
            <TabsContent value="financial" className="space-y-6">
              {/* Scenario Selector */}
              <div className="flex flex-wrap gap-3">
                {Object.entries(financialScenarios).map(([key, scenario]) => (
                  <Button
                    key={key}
                    variant={financialScenario === key ? 'default' : 'outline'}
                    onClick={() => setFinancialScenario(key)}
                    className={financialScenario === key ? '' : scenario.borderColor}
                    data-testid={`scenario-${key}-btn`}
                  >
                    <span className={financialScenario !== key ? scenario.color : ''}>
                      Scenario {key}: {scenario.label}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={`glass-card ${currentScenario.borderColor}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Costs & Investment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Startup Costs</span>
                      <span className="font-mono font-medium">{currentScenario.startupCosts}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Monthly Burn Rate</span>
                      <span className="font-mono font-medium">{currentScenario.monthlyBurn}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Break Even Point</span>
                      <span className="font-mono font-medium">{currentScenario.breakEven}</span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${currentScenario.bgColor} border ${currentScenario.borderColor}`}>
                      <span className="font-medium">Funding Needed</span>
                      <span className={`font-mono font-bold ${currentScenario.color}`}>{currentScenario.fundingNeeded}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`glass-card ${currentScenario.borderColor}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Projections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 1</span>
                      <span className="font-mono font-medium text-emerald-400">{currentScenario.year1Revenue}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 2</span>
                      <span className="font-mono font-medium text-emerald-400">{currentScenario.year2Revenue}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                      <span className="text-muted-foreground">Year 3</span>
                      <span className="font-mono font-medium text-emerald-400">{currentScenario.year3Revenue}</span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${currentScenario.bgColor} border ${currentScenario.borderColor}`}>
                      <span className="font-medium">3-Year ROI</span>
                      <span className={`font-mono font-bold ${currentScenario.color}`}>{currentScenario.roi}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Prognosis Tab */}
            <TabsContent value="prognosis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glass-card border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Success Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(prognosis.key_success_factors || ['Strong product-market fit', 'Experienced team', 'Growing market']).map((factor, i) => (
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
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(prognosis.major_risks || ['Market competition', 'Funding challenges', 'Execution risk']).map((risk, i) => (
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
                    <CardTitle className="text-lg">Success Probability</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-flex items-center justify-center mb-4">
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
                          strokeDasharray={`${(parseInt(prognosis.success_probability) || 65) * 3.52} 352`}
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
                      <span className="absolute text-3xl font-bold text-primary font-mono">
                        {prognosis.success_probability || '65%'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Based on {currentScenario.label} scenario</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Strategic Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {prognosis.recommended_strategy || `Based on our analysis, we recommend starting with the ${currentScenario.label} approach. Focus on validating product-market fit in your target region before expanding. Key priorities should include building a strong founding team, securing initial funding of ${currentScenario.fundingNeeded}, and achieving early customer traction within the first 6 months.`}
                  </p>
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
                Get comprehensive insights including marketing analytics, sales projections, industry data, financial scenarios, and business prognosis.
              </p>
              <Button 
                onClick={generateAnalysis}
                disabled={generating}
                className="bg-primary hover:bg-primary/90"
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
