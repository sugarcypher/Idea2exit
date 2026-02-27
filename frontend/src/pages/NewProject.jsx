import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { 
  Zap, ArrowRight, ArrowLeft, Loader2, Check, 
  Lightbulb, Target, Puzzle, Rocket
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Lightbulb, description: 'Name and describe your idea' },
  { id: 2, title: 'Vision', icon: Target, description: 'Define your vision and target market' },
  { id: 3, title: 'Problem & Solution', icon: Puzzle, description: 'Articulate the problem and your solution' },
  { id: 4, title: 'Launch', icon: Rocket, description: 'Review and create your project' },
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Entertainment', 'Food & Beverage', 'Real Estate', 'Transportation',
  'Energy', 'Manufacturing', 'Retail', 'Media', 'Agriculture', 'Other'
];

export default function NewProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vision: '',
    target_market: '',
    problem_statement: '',
    solution: '',
    industry: 'Technology',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.description.trim();
      case 2:
        return formData.vision.trim() && formData.target_market.trim();
      case 3:
        return formData.problem_statement.trim() && formData.solution.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.create(formData);
      toast.success('Project created successfully!');
      navigate(`/projects/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background" data-testid="new-project-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              IdeaForge
            </span>
          </Link>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="cancel-btn">
            Cancel
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="heading-2">Create New Project</h1>
            <span className="caption-text">Step {step} of 4</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            
            return (
              <div 
                key={s.id}
                className={`flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-primary/10 border border-primary/30' : 
                  isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30' : 
                  'bg-secondary/20 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive ? 'bg-primary text-primary-foreground' :
                  isCompleted ? 'bg-emerald-500 text-white' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Steps */}
        <Card className="glass-card border-border/40">
          <CardHeader>
            <CardTitle className="heading-3">{STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., EcoTrack - Sustainable Living App"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="custom-input h-11"
                    data-testid="project-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe your idea in 2-3 sentences..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="custom-input min-h-[120px]"
                    data-testid="project-description-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                    <SelectTrigger className="custom-input h-11" data-testid="industry-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="vision" className="text-sm font-medium">Your Vision *</Label>
                  <Textarea
                    id="vision"
                    placeholder="What's your long-term vision? Where do you see this in 5-10 years?"
                    value={formData.vision}
                    onChange={(e) => updateField('vision', e.target.value)}
                    className="custom-input min-h-[120px]"
                    data-testid="project-vision-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_market" className="text-sm font-medium">Target Market *</Label>
                  <Textarea
                    id="target_market"
                    placeholder="Who are your ideal customers? Be specific about demographics, behaviors, pain points..."
                    value={formData.target_market}
                    onChange={(e) => updateField('target_market', e.target.value)}
                    className="custom-input min-h-[120px]"
                    data-testid="project-target-market-input"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="problem_statement" className="text-sm font-medium">Problem Statement *</Label>
                  <Textarea
                    id="problem_statement"
                    placeholder="What problem are you solving? Why does it matter? What are the current alternatives and their limitations?"
                    value={formData.problem_statement}
                    onChange={(e) => updateField('problem_statement', e.target.value)}
                    className="custom-input min-h-[150px]"
                    data-testid="project-problem-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solution" className="text-sm font-medium">Your Solution *</Label>
                  <Textarea
                    id="solution"
                    placeholder="How does your solution address this problem? What makes it unique? What's your competitive advantage?"
                    value={formData.solution}
                    onChange={(e) => updateField('solution', e.target.value)}
                    className="custom-input min-h-[150px]"
                    data-testid="project-solution-input"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <p className="body-text">Review your project details before creating:</p>
                <div className="space-y-4 p-6 rounded-xl bg-secondary/20 border border-border/40">
                  <div>
                    <span className="caption-text">Project Name</span>
                    <p className="font-medium mt-1">{formData.name}</p>
                  </div>
                  <div>
                    <span className="caption-text">Industry</span>
                    <p className="font-medium mt-1">{formData.industry}</p>
                  </div>
                  <div>
                    <span className="caption-text">Description</span>
                    <p className="text-muted-foreground mt-1">{formData.description}</p>
                  </div>
                  <div>
                    <span className="caption-text">Vision</span>
                    <p className="text-muted-foreground mt-1">{formData.vision}</p>
                  </div>
                  <div>
                    <span className="caption-text">Target Market</span>
                    <p className="text-muted-foreground mt-1">{formData.target_market}</p>
                  </div>
                  <div>
                    <span className="caption-text">Problem Statement</span>
                    <p className="text-muted-foreground mt-1">{formData.problem_statement}</p>
                  </div>
                  <div>
                    <span className="caption-text">Solution</span>
                    <p className="text-muted-foreground mt-1">{formData.solution}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary">
                    <strong>What happens next?</strong> Our AI agent swarm will be activated to help you generate business documents, market research, and more.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                data-testid="back-btn"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="btn-glow"
                  data-testid="next-btn"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-glow"
                  data-testid="create-project-btn"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
