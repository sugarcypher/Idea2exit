import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Zap, ArrowRight, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(email, password, fullName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Generate white papers & business plans',
    'AI-powered market research',
    'Pitch deck creation',
    'Landing page builder',
    'IP protection guidance',
    'Financial projections',
  ];

  return (
    <div className="min-h-screen bg-background flex" data-testid="register-page">
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
          <h1 className="heading-1 mb-6">
            Start Building<br />
            <span className="text-primary">Your Vision</span>
          </h1>
          <p className="body-text max-w-md text-lg mb-8">
            Join thousands of entrepreneurs using AI to accelerate their journey from idea to successful business.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Register form */}
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
              Create an account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="custom-input h-11"
                  data-testid="register-name-input"
                />
              </div>
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
                  data-testid="register-email-input"
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
                  minLength={6}
                  className="custom-input h-11"
                  data-testid="register-password-input"
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 btn-glow font-medium"
                disabled={loading}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium" data-testid="login-link">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
