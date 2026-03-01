import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Zap, ArrowRight, Loader2, FileText, Rocket, DollarSign, Globe, Palette, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      try {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail[0]?.msg?.replace('Value error, ', '') || errorMessage;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FileText, text: 'Auto-generate business plans, pitch decks & white papers' },
    { icon: Rocket, text: 'AI agent swarm handles research to launch' },
    { icon: DollarSign, text: 'Find investors & crowdfunding strategies' },
    { icon: Globe, text: 'Build landing pages with one click' },
    { icon: Palette, text: 'Generate logos & complete brand identity' },
    { icon: BarChart3, text: 'Financial projections & market analysis' },
  ];

  return (
    <div className="min-h-screen bg-background flex" data-testid="login-page">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 grid-background" />
        <div className="absolute inset-0 hero-glow" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              IdeaForge
            </span>
          </div>
          <h1 className="heading-1 mb-4">
            From Idea to<br />
            <span className="text-primary">Funded Business</span>
          </h1>
          <p className="body-text max-w-lg text-lg mb-8">
            The AI-powered platform that transforms your vision into a launch-ready business. 
            Generate documents, find investors, build your brand, and plan your market entry - all in one place.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md glass-card border-border/40">
          <CardHeader className="space-y-1 pb-6">
            <div className="lg:hidden flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">IdeaForge</span>
            </div>
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue building your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="custom-input h-11"
                  data-testid="login-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="custom-input h-11"
                  data-testid="login-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 btn-glow font-medium"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium" data-testid="register-link">
                Create one
              </Link>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/terms" className="hover:underline">Terms</Link>
              {' · '}
              <Link to="/privacy" className="hover:underline">Privacy</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
