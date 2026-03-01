import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, Loader2, Calculator, TrendingUp, Users, Rocket,
  DollarSign, Target, Clock, BarChart3, Play, RotateCcw,
  Zap, Building2, PieChart, LineChart, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Simulation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Financial Simulation State
  const [financialParams, setFinancialParams] = useState({
    initialFunding: 250000,
    monthlyBurn: 25000,
    revenueStartMonth: 6,
    monthlyRevenueGrowth: 15,
    initialMRR: 5000,
    churnRate: 5,
    customerAcquisitionCost: 50,
    lifetimeValue: 500,
  });
  const [financialResults, setFinancialResults] = useState(null);

  // Market Simulation State
  const [marketParams, setMarketParams] = useState({
    totalMarketSize: 1000000000,
    yearOneShare: 0.1,
    yearTwoShare: 0.5,
    yearThreeShare: 1.5,
    competitorCount: 25,
    competitorGrowth: 10,
    marketGrowthRate: 12,
  });
  const [marketResults, setMarketResults] = useState(null);

  // Growth Simulation State
  const [growthParams, setGrowthParams] = useState({
    foundingTeamSize: 2,
    monthlyHires: 1,
    avgSalary: 8000,
    officeSpacePerPerson: 500,
    marketingBudgetPercent: 20,
    rdBudgetPercent: 30,
  });
  const [growthResults, setGrowthResults] = useState(null);

  // Launch Simulation State
  const [launchParams, setLaunchParams] = useState({
    mvpWeeks: 12,
    betaWeeks: 4,
    launchWeeks: 2,
    iterationCycles: 3,
    teamVelocity: 80,
    scopeCreep: 20,
  });
  const [launchResults, setLaunchResults] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectAPI.getOne(id);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Financial Simulation
  const runFinancialSimulation = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const months = 36;
      const projections = [];
      let cash = financialParams.initialFunding;
      let mrr = 0;
      let customers = 0;
      
      for (let month = 1; month <= months; month++) {
        // Revenue kicks in after revenueStartMonth
        if (month >= financialParams.revenueStartMonth) {
          if (month === financialParams.revenueStartMonth) {
            mrr = financialParams.initialMRR;
            customers = Math.floor(mrr / (financialParams.lifetimeValue / 12));
          } else {
            // Apply churn
            customers = Math.floor(customers * (1 - financialParams.churnRate / 100));
            // Add new customers
            const newCustomers = Math.floor((financialParams.monthlyBurn * 0.3) / financialParams.customerAcquisitionCost);
            customers += newCustomers;
            // Growth
            mrr = mrr * (1 + financialParams.monthlyRevenueGrowth / 100);
          }
        }
        
        const revenue = mrr;
        const expenses = financialParams.monthlyBurn;
        const netCashFlow = revenue - expenses;
        cash += netCashFlow;
        
        projections.push({
          month,
          revenue: Math.round(revenue),
          expenses,
          netCashFlow: Math.round(netCashFlow),
          cashBalance: Math.round(cash),
          customers,
          mrr: Math.round(mrr),
        });
      }
      
      const runwayMonths = projections.findIndex(p => p.cashBalance < 0);
      const breakEvenMonth = projections.findIndex(p => p.netCashFlow > 0);
      const peakCashNeed = Math.abs(Math.min(...projections.map(p => p.cashBalance)));
      
      setFinancialResults({
        projections,
        runway: runwayMonths === -1 ? 'Sustainable' : `${runwayMonths} months`,
        breakEven: breakEvenMonth === -1 ? 'Not achieved' : `Month ${breakEvenMonth}`,
        peakCashNeed: peakCashNeed > 0 ? peakCashNeed : 0,
        year1Revenue: projections.slice(0, 12).reduce((sum, p) => sum + p.revenue, 0),
        year2Revenue: projections.slice(12, 24).reduce((sum, p) => sum + p.revenue, 0),
        year3Revenue: projections.slice(24, 36).reduce((sum, p) => sum + p.revenue, 0),
        finalMRR: projections[35]?.mrr || 0,
        finalCustomers: projections[35]?.customers || 0,
      });
      setSimulating(false);
      toast.success('Financial simulation complete!');
    }, 1000);
  }, [financialParams]);

  // Market Simulation
  const runMarketSimulation = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const years = 5;
      const projections = [];
      let marketSize = marketParams.totalMarketSize;
      let competitors = marketParams.competitorCount;
      
      const shareProgression = [
        0,
        marketParams.yearOneShare,
        marketParams.yearTwoShare,
        marketParams.yearThreeShare,
        marketParams.yearThreeShare * 1.5,
        marketParams.yearThreeShare * 2,
      ];
      
      for (let year = 1; year <= years; year++) {
        marketSize = marketSize * (1 + marketParams.marketGrowthRate / 100);
        competitors = Math.floor(competitors * (1 + marketParams.competitorGrowth / 100));
        
        const yourShare = shareProgression[year];
        const yourRevenue = (marketSize * yourShare) / 100;
        const avgCompetitorShare = (100 - yourShare) / competitors;
        
        projections.push({
          year,
          marketSize: Math.round(marketSize),
          yourShare,
          yourRevenue: Math.round(yourRevenue),
          competitors,
          avgCompetitorShare: avgCompetitorShare.toFixed(2),
        });
      }
      
      setMarketResults({
        projections,
        totalAddressableMarket: Math.round(marketSize),
        projectedYear5Revenue: projections[4]?.yourRevenue || 0,
        marketPosition: projections[4]?.yourShare > 5 ? 'Market Leader' : 
                       projections[4]?.yourShare > 1 ? 'Strong Player' : 'Emerging Player',
        competitorThreat: competitors > 50 ? 'High' : competitors > 20 ? 'Medium' : 'Low',
      });
      setSimulating(false);
      toast.success('Market simulation complete!');
    }, 1000);
  }, [marketParams]);

  // Growth Simulation
  const runGrowthSimulation = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const months = 24;
      const projections = [];
      let teamSize = growthParams.foundingTeamSize;
      let totalCost = 0;
      
      for (let month = 1; month <= months; month++) {
        teamSize += growthParams.monthlyHires;
        
        const salaryCost = teamSize * growthParams.avgSalary;
        const officeCost = teamSize * growthParams.officeSpacePerPerson * 0.05; // $50/sqft/year
        const marketingCost = salaryCost * (growthParams.marketingBudgetPercent / 100);
        const rdCost = salaryCost * (growthParams.rdBudgetPercent / 100);
        const totalMonthlyCost = salaryCost + officeCost + marketingCost + rdCost;
        totalCost += totalMonthlyCost;
        
        projections.push({
          month,
          teamSize,
          salaryCost: Math.round(salaryCost),
          officeCost: Math.round(officeCost),
          marketingCost: Math.round(marketingCost),
          rdCost: Math.round(rdCost),
          totalMonthlyCost: Math.round(totalMonthlyCost),
          cumulativeCost: Math.round(totalCost),
        });
      }
      
      setGrowthResults({
        projections,
        finalTeamSize: teamSize,
        totalInvestmentNeeded: Math.round(totalCost),
        avgMonthlyCost: Math.round(totalCost / months),
        costPerEmployee: Math.round(totalCost / teamSize / months),
        breakdown: {
          salaries: Math.round(projections.reduce((sum, p) => sum + p.salaryCost, 0)),
          office: Math.round(projections.reduce((sum, p) => sum + p.officeCost, 0)),
          marketing: Math.round(projections.reduce((sum, p) => sum + p.marketingCost, 0)),
          rd: Math.round(projections.reduce((sum, p) => sum + p.rdCost, 0)),
        }
      });
      setSimulating(false);
      toast.success('Growth simulation complete!');
    }, 1000);
  }, [growthParams]);

  // Launch Simulation
  const runLaunchSimulation = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      const baseWeeks = launchParams.mvpWeeks + launchParams.betaWeeks + launchParams.launchWeeks;
      const velocityFactor = launchParams.teamVelocity / 100;
      const scopeCreepFactor = 1 + (launchParams.scopeCreep / 100);
      const iterationTime = launchParams.iterationCycles * 2; // 2 weeks per iteration
      
      const adjustedMVP = Math.ceil(launchParams.mvpWeeks / velocityFactor * scopeCreepFactor);
      const adjustedBeta = Math.ceil(launchParams.betaWeeks / velocityFactor);
      const adjustedLaunch = launchParams.launchWeeks;
      const totalWeeks = adjustedMVP + adjustedBeta + adjustedLaunch + iterationTime;
      
      const milestones = [
        { name: 'Project Kickoff', week: 0, status: 'completed' },
        { name: 'Requirements Complete', week: 2, status: 'completed' },
        { name: 'Design Finalized', week: 4, status: 'pending' },
        { name: 'MVP Development', week: adjustedMVP, status: 'pending' },
        { name: 'Internal Testing', week: adjustedMVP + 2, status: 'pending' },
        { name: 'Beta Launch', week: adjustedMVP + adjustedBeta, status: 'pending' },
        { name: 'Beta Feedback Iterations', week: adjustedMVP + adjustedBeta + iterationTime, status: 'pending' },
        { name: 'Public Launch', week: totalWeeks, status: 'pending' },
      ];
      
      const risks = [];
      if (launchParams.scopeCreep > 30) risks.push({ level: 'high', text: 'High scope creep risk - consider reducing features' });
      if (launchParams.teamVelocity < 70) risks.push({ level: 'medium', text: 'Below average velocity - may need more resources' });
      if (launchParams.iterationCycles < 2) risks.push({ level: 'medium', text: 'Few iterations - quality risks' });
      if (totalWeeks > 26) risks.push({ level: 'low', text: 'Long timeline - consider phased approach' });
      
      setLaunchResults({
        totalWeeks,
        totalMonths: (totalWeeks / 4.33).toFixed(1),
        milestones,
        adjustedTimeline: {
          mvp: adjustedMVP,
          beta: adjustedBeta,
          launch: adjustedLaunch,
          iterations: iterationTime,
        },
        risks,
        launchDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        confidence: risks.filter(r => r.level === 'high').length === 0 ? 'High' : 
                   risks.filter(r => r.level === 'high').length === 1 ? 'Medium' : 'Low',
      });
      setSimulating(false);
      toast.success('Launch simulation complete!');
    }, 1000);
  }, [launchParams]);

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="simulation-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Simulation Lab</h1>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/40 p-1 flex-wrap">
            <TabsTrigger value="financial" data-testid="tab-financial">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="market" data-testid="tab-market">
              <PieChart className="w-4 h-4 mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger value="growth" data-testid="tab-growth">
              <Users className="w-4 h-4 mr-2" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="launch" data-testid="tab-launch">
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </TabsTrigger>
          </TabsList>

          {/* Financial Simulation Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Parameters */}
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Initial Funding: {formatCurrency(financialParams.initialFunding)}</Label>
                    <Slider
                      value={[financialParams.initialFunding]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, initialFunding: v }))}
                      min={50000}
                      max={2000000}
                      step={25000}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Monthly Burn: {formatCurrency(financialParams.monthlyBurn)}</Label>
                    <Slider
                      value={[financialParams.monthlyBurn]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, monthlyBurn: v }))}
                      min={5000}
                      max={100000}
                      step={2500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Revenue Start Month: {financialParams.revenueStartMonth}</Label>
                    <Slider
                      value={[financialParams.revenueStartMonth]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, revenueStartMonth: v }))}
                      min={1}
                      max={18}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Monthly Revenue Growth: {financialParams.monthlyRevenueGrowth}%</Label>
                    <Slider
                      value={[financialParams.monthlyRevenueGrowth]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, monthlyRevenueGrowth: v }))}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Initial MRR: {formatCurrency(financialParams.initialMRR)}</Label>
                    <Slider
                      value={[financialParams.initialMRR]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, initialMRR: v }))}
                      min={1000}
                      max={50000}
                      step={1000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Churn Rate: {financialParams.churnRate}%</Label>
                    <Slider
                      value={[financialParams.churnRate]}
                      onValueChange={([v]) => setFinancialParams(p => ({ ...p, churnRate: v }))}
                      min={0}
                      max={20}
                      step={0.5}
                    />
                  </div>
                  <Button 
                    onClick={runFinancialSimulation} 
                    disabled={simulating}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="run-financial-sim"
                  >
                    {simulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="lg:col-span-2 glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {financialResults ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Runway</p>
                          <p className="text-2xl font-bold text-primary font-mono">{financialResults.runway}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Break Even</p>
                          <p className="text-2xl font-bold text-emerald-400 font-mono">{financialResults.breakEven}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Peak Cash Need</p>
                          <p className="text-2xl font-bold text-amber-400 font-mono">{formatCurrency(financialResults.peakCashNeed)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Final MRR</p>
                          <p className="text-2xl font-bold text-purple-400 font-mono">{formatCurrency(financialResults.finalMRR)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Revenue Projections</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-muted-foreground">Year 1</p>
                            <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(financialResults.year1Revenue)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-muted-foreground">Year 2</p>
                            <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(financialResults.year2Revenue)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-muted-foreground">Year 3</p>
                            <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(financialResults.year3Revenue)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cash Flow Timeline</p>
                        <div className="h-32 flex items-end gap-1">
                          {financialResults.projections.filter((_, i) => i % 3 === 0).map((p, i) => (
                            <div 
                              key={i}
                              className={`flex-1 rounded-t transition-all ${p.cashBalance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ 
                                height: `${Math.min(100, Math.abs(p.cashBalance) / financialParams.initialFunding * 50 + 10)}%`,
                                opacity: 0.3 + (i / 12) * 0.7
                              }}
                              title={`Month ${p.month}: ${formatCurrency(p.cashBalance)}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Month 1</span>
                          <span>Month 18</span>
                          <span>Month 36</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Adjust parameters and run simulation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Simulation Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Total Market Size: {formatCurrency(marketParams.totalMarketSize)}</Label>
                    <Slider
                      value={[marketParams.totalMarketSize]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, totalMarketSize: v }))}
                      min={10000000}
                      max={10000000000}
                      step={10000000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Year 1 Market Share: {marketParams.yearOneShare}%</Label>
                    <Slider
                      value={[marketParams.yearOneShare]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, yearOneShare: v }))}
                      min={0.01}
                      max={2}
                      step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Year 2 Market Share: {marketParams.yearTwoShare}%</Label>
                    <Slider
                      value={[marketParams.yearTwoShare]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, yearTwoShare: v }))}
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Year 3 Market Share: {marketParams.yearThreeShare}%</Label>
                    <Slider
                      value={[marketParams.yearThreeShare]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, yearThreeShare: v }))}
                      min={0.5}
                      max={10}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Number of Competitors: {marketParams.competitorCount}</Label>
                    <Slider
                      value={[marketParams.competitorCount]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, competitorCount: v }))}
                      min={5}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Market Growth Rate: {marketParams.marketGrowthRate}%</Label>
                    <Slider
                      value={[marketParams.marketGrowthRate]}
                      onValueChange={([v]) => setMarketParams(p => ({ ...p, marketGrowthRate: v }))}
                      min={0}
                      max={30}
                      step={1}
                    />
                  </div>
                  <Button 
                    onClick={runMarketSimulation} 
                    disabled={simulating}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="run-market-sim"
                  >
                    {simulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Market Position Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  {marketResults ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Year 5 TAM</p>
                          <p className="text-2xl font-bold text-primary font-mono">{formatCurrency(marketResults.totalAddressableMarket)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Year 5 Revenue</p>
                          <p className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(marketResults.projectedYear5Revenue)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Market Position</p>
                          <p className="text-lg font-bold text-purple-400">{marketResults.marketPosition}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Competitor Threat</p>
                          <p className={`text-lg font-bold ${marketResults.competitorThreat === 'High' ? 'text-red-400' : marketResults.competitorThreat === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {marketResults.competitorThreat}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">5-Year Market Share Progression</p>
                        {marketResults.projections.map((p, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="w-16 text-sm text-muted-foreground">Year {p.year}</span>
                            <div className="flex-1 h-6 bg-secondary/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, p.yourShare * 10)}%` }}
                              />
                            </div>
                            <span className="w-20 text-sm font-mono text-right">{p.yourShare}%</span>
                            <span className="w-24 text-sm font-mono text-emerald-400 text-right">{formatCurrency(p.yourRevenue)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Adjust parameters and run simulation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Growth Simulation Tab */}
          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Founding Team Size: {growthParams.foundingTeamSize}</Label>
                    <Slider
                      value={[growthParams.foundingTeamSize]}
                      onValueChange={([v]) => setGrowthParams(p => ({ ...p, foundingTeamSize: v }))}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Monthly Hires: {growthParams.monthlyHires}</Label>
                    <Slider
                      value={[growthParams.monthlyHires]}
                      onValueChange={([v]) => setGrowthParams(p => ({ ...p, monthlyHires: v }))}
                      min={0}
                      max={10}
                      step={0.5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Avg Monthly Salary: {formatCurrency(growthParams.avgSalary)}</Label>
                    <Slider
                      value={[growthParams.avgSalary]}
                      onValueChange={([v]) => setGrowthParams(p => ({ ...p, avgSalary: v }))}
                      min={3000}
                      max={20000}
                      step={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Marketing Budget: {growthParams.marketingBudgetPercent}%</Label>
                    <Slider
                      value={[growthParams.marketingBudgetPercent]}
                      onValueChange={([v]) => setGrowthParams(p => ({ ...p, marketingBudgetPercent: v }))}
                      min={0}
                      max={50}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">R&D Budget: {growthParams.rdBudgetPercent}%</Label>
                    <Slider
                      value={[growthParams.rdBudgetPercent]}
                      onValueChange={([v]) => setGrowthParams(p => ({ ...p, rdBudgetPercent: v }))}
                      min={0}
                      max={50}
                      step={5}
                    />
                  </div>
                  <Button 
                    onClick={runGrowthSimulation} 
                    disabled={simulating}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="run-growth-sim"
                  >
                    {simulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Team Growth Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  {growthResults ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Final Team Size</p>
                          <p className="text-2xl font-bold text-primary font-mono">{growthResults.finalTeamSize}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Total Investment</p>
                          <p className="text-2xl font-bold text-amber-400 font-mono">{formatCurrency(growthResults.totalInvestmentNeeded)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Avg Monthly Cost</p>
                          <p className="text-2xl font-bold text-purple-400 font-mono">{formatCurrency(growthResults.avgMonthlyCost)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Cost/Employee/Mo</p>
                          <p className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(growthResults.costPerEmployee)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cost Breakdown (24 months)</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-muted-foreground">Salaries</p>
                            <p className="text-lg font-bold text-blue-400 font-mono">{formatCurrency(growthResults.breakdown.salaries)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <p className="text-xs text-muted-foreground">Marketing</p>
                            <p className="text-lg font-bold text-purple-400 font-mono">{formatCurrency(growthResults.breakdown.marketing)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-muted-foreground">R&D</p>
                            <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(growthResults.breakdown.rd)}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-muted-foreground">Office</p>
                            <p className="text-lg font-bold text-amber-400 font-mono">{formatCurrency(growthResults.breakdown.office)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Adjust parameters and run simulation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Launch Simulation Tab */}
          <TabsContent value="launch" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">MVP Development: {launchParams.mvpWeeks} weeks</Label>
                    <Slider
                      value={[launchParams.mvpWeeks]}
                      onValueChange={([v]) => setLaunchParams(p => ({ ...p, mvpWeeks: v }))}
                      min={4}
                      max={24}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Beta Period: {launchParams.betaWeeks} weeks</Label>
                    <Slider
                      value={[launchParams.betaWeeks]}
                      onValueChange={([v]) => setLaunchParams(p => ({ ...p, betaWeeks: v }))}
                      min={2}
                      max={12}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Iteration Cycles: {launchParams.iterationCycles}</Label>
                    <Slider
                      value={[launchParams.iterationCycles]}
                      onValueChange={([v]) => setLaunchParams(p => ({ ...p, iterationCycles: v }))}
                      min={1}
                      max={6}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Team Velocity: {launchParams.teamVelocity}%</Label>
                    <Slider
                      value={[launchParams.teamVelocity]}
                      onValueChange={([v]) => setLaunchParams(p => ({ ...p, teamVelocity: v }))}
                      min={50}
                      max={120}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Scope Creep Risk: {launchParams.scopeCreep}%</Label>
                    <Slider
                      value={[launchParams.scopeCreep]}
                      onValueChange={([v]) => setLaunchParams(p => ({ ...p, scopeCreep: v }))}
                      min={0}
                      max={50}
                      step={5}
                    />
                  </div>
                  <Button 
                    onClick={runLaunchSimulation} 
                    disabled={simulating}
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="run-launch-sim"
                  >
                    {simulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Run Simulation
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Launch Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {launchResults ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Total Timeline</p>
                          <p className="text-2xl font-bold text-primary font-mono">{launchResults.totalWeeks} wks</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Launch Date</p>
                          <p className="text-lg font-bold text-emerald-400">{launchResults.launchDate}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className={`text-lg font-bold ${launchResults.confidence === 'High' ? 'text-emerald-400' : launchResults.confidence === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                            {launchResults.confidence}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-2xl font-bold text-purple-400 font-mono">{launchResults.totalMonths} mo</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Milestones</p>
                        <div className="space-y-2">
                          {launchResults.milestones.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-secondary'}`}>
                                {m.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-xs font-mono">{m.week}</span>
                                )}
                              </div>
                              <span className="flex-1 text-sm">{m.name}</span>
                              <span className="text-xs text-muted-foreground">Week {m.week}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {launchResults.risks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Risks Identified</p>
                          <div className="space-y-2">
                            {launchResults.risks.map((r, i) => (
                              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${r.level === 'high' ? 'bg-red-500/10 border border-red-500/20' : r.level === 'medium' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                                <AlertTriangle className={`w-4 h-4 mt-0.5 ${r.level === 'high' ? 'text-red-400' : r.level === 'medium' ? 'text-amber-400' : 'text-blue-400'}`} />
                                <span className="text-sm text-muted-foreground">{r.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Adjust parameters and run simulation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
