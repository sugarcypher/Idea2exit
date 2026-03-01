import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 'project', label: 'Create Project', path: '/projects/new' },
  { id: 'documents', label: 'Generate Documents', path: '/documents' },
  { id: 'landing', label: 'Build Landing Page', path: '/landing-page' },
  { id: 'analysis', label: 'Run Analysis', path: '/analysis' },
  { id: 'launch', label: 'Launch Ready', path: null },
];

export default function WorkflowProgress({ projectId, currentStep, completedSteps = [] }) {
  const navigate = useNavigate();

  const handleStepClick = (step) => {
    if (!projectId || !step.path) return;
    navigate(`/projects/${projectId}${step.path}`);
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full" data-testid="workflow-progress">
      {/* Desktop horizontal view */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/40" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ 
            width: `${(completedSteps.length / (WORKFLOW_STEPS.length - 1)) * 100}%` 
          }}
        />
        
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = projectId && step.path && (status === 'completed' || status === 'current');
          
          return (
            <div 
              key={step.id}
              className={`relative flex flex-col items-center z-10 ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && handleStepClick(step)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                ${status === 'current' ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                ${status === 'pending' ? 'bg-secondary text-muted-foreground' : ''}
              `}>
                {status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`
                mt-2 text-xs font-medium text-center max-w-[80px]
                ${status === 'current' ? 'text-primary' : ''}
                ${status === 'completed' ? 'text-emerald-400' : ''}
                ${status === 'pending' ? 'text-muted-foreground' : ''}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical view */}
      <div className="md:hidden space-y-2">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = projectId && step.path && (status === 'completed' || status === 'current');
          
          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                ${status === 'current' ? 'bg-primary/10 border border-primary/30' : ''}
                ${status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}
                ${status === 'pending' ? 'bg-secondary/20 border border-transparent' : ''}
                ${isClickable ? 'cursor-pointer hover:bg-secondary/30' : ''}
              `}
              onClick={() => isClickable && handleStepClick(step)}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                ${status === 'current' ? 'bg-primary text-white' : ''}
                ${status === 'pending' ? 'bg-secondary text-muted-foreground' : ''}
              `}>
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`
                text-sm font-medium flex-1
                ${status === 'current' ? 'text-primary' : ''}
                ${status === 'completed' ? 'text-emerald-400' : ''}
                ${status === 'pending' ? 'text-muted-foreground' : ''}
              `}>
                {step.label}
              </span>
              {isClickable && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
