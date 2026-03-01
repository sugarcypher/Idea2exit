import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { fundingKitAPI, projectAPI } from '../lib/api';
import {
  ArrowLeft, Rocket, Users, DollarSign, Mail, Video, Palette,
  Building2, UserCircle, Landmark, Factory, Briefcase,
  Download, Copy, Play, RefreshCw, Loader2, CheckCircle2,
  ExternalLink, Sparkles, Image, Film, FileText, Target,
  TrendingUp, Clock, Lightbulb, Megaphone
} from 'lucide-react';

export default function FundingKit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [fundingKit, setFundingKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [logos, setLogos] = useState([]);
  const [videos, setVideos] = useState([]);
  
  // Generation options
  const [options, setOptions] = useState({
    include_investors: true,
    include_crowdfunding: true,
    include_outreach: true,
    include_video: true,
    include_branding: true,
    video_duration: 4,
    logo_styles: ['modern', 'minimal', 'bold']
  });
  
  const [logoStyle, setLogoStyle] = useState('modern');
  const [videoStyle, setVideoStyle] = useState('professional');
  const [videoDuration, setVideoDuration] = useState(4);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectRes = await projectAPI.getOne(id);
      setProject(projectRes.data);
      
      try {
        const kitRes = await fundingKitAPI.get(id);
        setFundingKit(kitRes.data);
      } catch (e) {
        // No existing kit
      }
      
      try {
        const logosRes = await fundingKitAPI.getLogos(id);
        setLogos(logosRes.data || []);
      } catch (e) {}
      
      try {
        const videosRes = await fundingKitAPI.getVideos(id);
        setVideos(videosRes.data || []);
      } catch (e) {}
      
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateFundingKit = async () => {
    setGenerating(true);
    try {
      toast.info('Generating your complete funding kit... This may take a minute.');
      const response = await fundingKitAPI.generate({
        project_id: id,
        ...options
      });
      setFundingKit(response.data);
      toast.success('Funding kit generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate funding kit');
    } finally {
      setGenerating(false);
    }
  };

  const generateLogo = async () => {
    setGeneratingLogo(true);
    try {
      toast.info('Generating logo... This may take up to a minute.');
      const response = await fundingKitAPI.generateLogo({
        project_id: id,
        style: logoStyle
      });
      setLogos(prev => [response.data, ...prev]);
      toast.success('Logo generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate logo');
    } finally {
      setGeneratingLogo(false);
    }
  };

  const generateVideo = async () => {
    setGeneratingVideo(true);
    try {
      toast.info('Generating promotional video... This may take several minutes.');
      const response = await fundingKitAPI.generateVideo({
        project_id: id,
        style: videoStyle,
        duration: videoDuration
      });
      setVideos(prev => [response.data, ...prev]);
      toast.success('Video generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate video');
    } finally {
      setGeneratingVideo(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadLogo = (base64, style) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `${project?.name || 'logo'}_${style}.png`;
    link.click();
  };

  const downloadVideo = (base64) => {
    const link = document.createElement('a');
    link.href = `data:video/mp4;base64,${base64}`;
    link.download = `${project?.name || 'promo'}_video.mp4`;
    link.click();
  };

  const getInvestorIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vc': return <Building2 className="w-4 h-4" />;
      case 'angel': return <UserCircle className="w-4 h-4" />;
      case 'accelerator': return <Rocket className="w-4 h-4" />;
      case 'corporate vc': return <Factory className="w-4 h-4" />;
      case 'family office': return <Landmark className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
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
    <div className="min-h-screen bg-background" data-testid="funding-kit-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{project?.name}</h1>
                <p className="text-sm text-muted-foreground">Funding & Branding Kit</p>
              </div>
            </div>
            <Button
              onClick={generateFundingKit}
              disabled={generating}
              className="btn-glow gap-2"
              data-testid="generate-kit-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Complete Kit
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Generation Options */}
        {!fundingKit && (
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                One-Click Funding Kit Generator
              </CardTitle>
              <CardDescription>
                Generate everything you need to secure funding - investors, outreach templates, crowdfunding strategies, branding, and promotional content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="investors"
                    checked={options.include_investors}
                    onCheckedChange={(v) => setOptions({...options, include_investors: v})}
                  />
                  <Label htmlFor="investors" className="text-sm">Investor List</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="crowdfunding"
                    checked={options.include_crowdfunding}
                    onCheckedChange={(v) => setOptions({...options, include_crowdfunding: v})}
                  />
                  <Label htmlFor="crowdfunding" className="text-sm">Crowdfunding</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="outreach"
                    checked={options.include_outreach}
                    onCheckedChange={(v) => setOptions({...options, include_outreach: v})}
                  />
                  <Label htmlFor="outreach" className="text-sm">Outreach Templates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="video"
                    checked={options.include_video}
                    onCheckedChange={(v) => setOptions({...options, include_video: v})}
                  />
                  <Label htmlFor="video" className="text-sm">Video Script</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="branding"
                    checked={options.include_branding}
                    onCheckedChange={(v) => setOptions({...options, include_branding: v})}
                  />
                  <Label htmlFor="branding" className="text-sm">Brand Kit</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="investors" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="investors" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Investors</span>
            </TabsTrigger>
            <TabsTrigger value="crowdfunding" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Crowdfunding</span>
            </TabsTrigger>
            <TabsTrigger value="outreach" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Outreach</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
          </TabsList>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Matched Investors</h2>
              {fundingKit && (
                <Badge variant="outline">{fundingKit.investors?.length || 0} investors found</Badge>
              )}
            </div>
            
            {!fundingKit?.investors?.length ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Generate your funding kit to see matched investors</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {fundingKit.investors.map((investor, idx) => (
                  <Card key={idx} className="glass-card hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {getInvestorIcon(investor.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{investor.name}</h3>
                            <Badge variant="secondary" className="text-xs">{investor.type}</Badge>
                          </div>
                        </div>
                        {investor.website && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={investor.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>{investor.typical_check_size}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>{investor.stage_preference}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {investor.focus_areas?.map((area, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                          ))}
                        </div>
                        <p className="text-muted-foreground mt-2">{investor.notes}</p>
                        <p className="text-xs text-primary mt-2">{investor.contact_method}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Crowdfunding Tab */}
          <TabsContent value="crowdfunding" className="space-y-4">
            <h2 className="text-lg font-semibold">Crowdfunding Strategies</h2>
            
            {!fundingKit?.crowdfunding_strategies?.length ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Generate your funding kit to see crowdfunding strategies</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {fundingKit.crowdfunding_strategies.map((strategy, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-primary" />
                          {strategy.platform}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">{strategy.recommended_goal}</Badge>
                          <Badge variant="secondary">{strategy.campaign_duration}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Reward Tiers */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Reward Tiers
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {strategy.reward_tiers?.map((tier, i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{tier.name}</span>
                                <Badge>{tier.price}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{tier.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Campaign Timeline
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {strategy.timeline?.map((phase, i) => (
                            <div key={i} className="flex-1 min-w-[200px] p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="font-medium text-sm">{phase.phase}</div>
                              <div className="text-xs text-muted-foreground">{phase.duration}</div>
                              <div className="text-xs mt-1">{phase.tasks}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tips */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {strategy.tips?.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Outreach Tab */}
          <TabsContent value="outreach" className="space-y-4">
            <h2 className="text-lg font-semibold">Outreach Templates</h2>
            
            {!fundingKit?.outreach_templates?.length ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Generate your funding kit to see outreach templates</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {fundingKit.outreach_templates.map((template, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {template.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(template.content, 'Template')}
                          className="gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                      </div>
                      {template.subject && (
                        <CardDescription className="font-medium">
                          Subject: {template.subject}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg border border-border/50 mb-4">
                        {template.content}
                      </pre>
                      <div className="flex flex-wrap gap-2">
                        {template.tips?.map((tip, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {tip}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Promotional Videos</h2>
            </div>
            
            {/* Video Generation Controls */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  AI Video Generator (Sora 2)
                </CardTitle>
                <CardDescription>
                  Generate professional promotional videos for your startup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  <div className="space-y-2">
                    <Label>Video Style</Label>
                    <Select value={videoStyle} onValueChange={setVideoStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={videoDuration.toString()} onValueChange={(v) => setVideoDuration(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 seconds</SelectItem>
                        <SelectItem value="8">8 seconds</SelectItem>
                        <SelectItem value="12">12 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateVideo}
                      disabled={generatingVideo}
                      className="w-full gap-2"
                      data-testid="generate-video-btn"
                    >
                      {generatingVideo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Script */}
            {fundingKit?.pitch_video_script && (
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Video Script</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(fundingKit.pitch_video_script, 'Script')}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg border border-border/50 max-h-96 overflow-y-auto">
                    {fundingKit.pitch_video_script}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Generated Videos */}
            {videos.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {videos.map((video, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {video.video_base64 ? (
                          <video
                            controls
                            className="w-full h-full object-cover"
                            src={`data:video/mp4;base64,${video.video_base64}`}
                          />
                        ) : (
                          <Play className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline">{video.style}</Badge>
                          <Badge variant="secondary" className="ml-2">{video.duration}s</Badge>
                        </div>
                        {video.video_base64 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadVideo(video.video_base64)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Brand Identity Kit</h2>
            </div>

            {/* Logo Generation */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  AI Logo Generator
                </CardTitle>
                <CardDescription>
                  Generate unique logos for your brand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label>Logo Style</Label>
                    <Select value={logoStyle} onValueChange={setLogoStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateLogo}
                      disabled={generatingLogo}
                      className="w-full gap-2"
                      data-testid="generate-logo-btn"
                    >
                      {generatingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Logo
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Generated Logos */}
                {logos.length > 0 && (
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
                    {logos.map((logo, idx) => (
                      <div key={idx} className="group relative">
                        <div className="aspect-square bg-white rounded-lg border border-border/50 p-2 overflow-hidden">
                          <img
                            src={`data:image/png;base64,${logo.image_base64}`}
                            alt={`Logo ${logo.style}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadLogo(logo.image_base64, logo.style)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <Badge variant="outline" className="absolute bottom-2 left-2 text-xs">
                          {logo.style}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Assets from Kit */}
            {fundingKit?.brand_assets?.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {fundingKit.brand_assets.map((asset, idx) => (
                  <Card key={idx} className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-base">{asset.name}</CardTitle>
                      <CardDescription>{asset.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {asset.type === 'color_palette' && asset.data && (
                        <div className="space-y-2">
                          {Object.entries(asset.data).map(([key, color]) => (
                            <div key={key} className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg border border-border/50"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div>
                                <div className="font-medium text-sm">{color.name}</div>
                                <div className="text-xs text-muted-foreground">{color.hex} - {color.usage}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {asset.type === 'typography' && asset.data && (
                        <div className="space-y-3">
                          {Object.entries(asset.data).map(([key, font]) => (
                            <div key={key} className="p-3 bg-muted/50 rounded-lg">
                              <div className="font-medium text-sm">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                              <div className="text-lg" style={{ fontFamily: font.name }}>{font.name}</div>
                              <div className="text-xs text-muted-foreground">Style: {font.style} | Fallback: {font.fallback}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {asset.type === 'brand_voice' && asset.data && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {asset.data.tone?.map((t, i) => (
                              <Badge key={i} variant="secondary">{t}</Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{asset.data.personality}</p>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <div className="text-xs font-medium text-green-500 mb-1">Do</div>
                              <ul className="text-xs space-y-1">
                                {asset.data.do?.map((item, i) => (
                                  <li key={i} className="text-muted-foreground">{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-red-500 mb-1">Don't</div>
                              <ul className="text-xs space-y-1">
                                {asset.data.dont?.map((item, i) => (
                                  <li key={i} className="text-muted-foreground">{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {asset.type === 'taglines' && Array.isArray(asset.data) && (
                        <div className="space-y-2">
                          {asset.data.map((tagline, i) => (
                            <div key={i} className="p-3 bg-muted/50 rounded-lg text-center font-medium">
                              "{tagline}"
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {asset.type === 'logo_concept' && typeof asset.data === 'string' && (
                        <p className="text-sm text-muted-foreground">{asset.data}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
