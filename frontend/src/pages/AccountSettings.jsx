import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  ArrowLeft, Loader2, User, Bell, Shield, Download,
  Trash2, Key, Mail, Lock, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    marketing_emails: false,
    product_updates: true,
    security_alerts: true
  });
  const [consents, setConsents] = useState({
    marketing: false,
    analytics: true,
    third_party: false
  });
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [deletionRequested, setDeletionRequested] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/user/preferences');
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
      if (response.data.consents) {
        setConsents({
          marketing: response.data.consents.marketing || false,
          analytics: response.data.consents.analytics || true,
          third_party: response.data.consents.third_party || false
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await api.put('/user/preferences', preferences);
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateConsent = async (type, value) => {
    try {
      await api.put('/user/consent', { consent_type: type, granted: value });
      setConsents(prev => ({ ...prev, [type]: value }));
      toast.success(`${type} consent updated`);
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  const changePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      await api.put('/user/change-password', null, {
        params: {
          old_password: passwords.old_password,
          new_password: passwords.new_password
        }
      });
      toast.success('Password changed successfully');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const response = await api.get('/user/export-data');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ideaforge_data_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const requestDeletion = async () => {
    try {
      await api.post('/user/request-deletion');
      setDeletionRequested(true);
      toast.success('Account deletion scheduled for 30 days from now');
    } catch (error) {
      toast.error('Failed to request deletion');
    }
  };

  const cancelDeletion = async () => {
    try {
      await api.post('/user/cancel-deletion');
      setDeletionRequested(false);
      toast.success('Account deletion cancelled');
    } catch (error) {
      toast.error('Failed to cancel deletion');
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
    <div className="min-h-screen bg-background" data-testid="account-settings-page">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Account Settings</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={user?.full_name || ''} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contact support to update your profile information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Email Preferences
                </CardTitle>
                <CardDescription>Control what emails you receive from us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important account notifications</p>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(v) => setPreferences(p => ({...p, email_notifications: v}))}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                  </div>
                  <Switch
                    checked={preferences.marketing_emails}
                    onCheckedChange={(v) => setPreferences(p => ({...p, marketing_emails: v}))}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Product Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new features</p>
                  </div>
                  <Switch
                    checked={preferences.product_updates}
                    onCheckedChange={(v) => setPreferences(p => ({...p, product_updates: v}))}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                  <Switch
                    checked={preferences.security_alerts}
                    onCheckedChange={(v) => setPreferences(p => ({...p, security_alerts: v}))}
                  />
                </div>
                <Button onClick={savePreferences} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Consent Management</h4>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Marketing & Advertising</Label>
                      <p className="text-sm text-muted-foreground">Allow personalized marketing</p>
                    </div>
                    <Switch
                      checked={consents.marketing}
                      onCheckedChange={(v) => updateConsent('marketing', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help us improve with usage data</p>
                    </div>
                    <Switch
                      checked={consents.analytics}
                      onCheckedChange={(v) => updateConsent('analytics', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Third-Party Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share data with partners</p>
                    </div>
                    <Switch
                      checked={consents.third_party}
                      onCheckedChange={(v) => updateConsent('third_party', v)}
                    />
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 space-y-4">
                  <h4 className="font-medium">Your Data Rights</h4>
                  <Button variant="outline" onClick={exportData} disabled={exporting} className="w-full gap-2">
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export All My Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Download a copy of all your data in JSON format (GDPR Article 20)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent>
                {deletionRequested ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className="text-sm">Your account is scheduled for deletion in 30 days</span>
                    </div>
                    <Button variant="outline" onClick={cancelDeletion} className="w-full">
                      Cancel Deletion Request
                    </Button>
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <Trash2 className="w-4 h-4" />
                        Request Account Deletion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will schedule your account for permanent deletion in 30 days.
                          All your projects, documents, and data will be permanently removed.
                          You can cancel this request by logging in within 30 days.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={requestDeletion} className="bg-red-600 hover:bg-red-700">
                          Yes, Delete My Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwords.old_password}
                    onChange={(e) => setPasswords(p => ({...p, old_password: e.target.value}))}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords(p => ({...p, new_password: e.target.value}))}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords(p => ({...p, confirm_password: e.target.value}))}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
                <Button 
                  onClick={changePassword} 
                  disabled={saving || !passwords.old_password || !passwords.new_password}
                  className="w-full"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Password Protected</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span>Email Verified</span>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
