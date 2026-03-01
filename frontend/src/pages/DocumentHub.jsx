import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, documentAPI } from '../lib/api';
import { formatDate, getDocumentTypeLabel, downloadFile } from '../lib/utils';
import { downloadPDF } from '../lib/pdf';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Zap, ArrowLeft, Loader2, FileText, Download, Plus,
  Briefcase, TrendingUp, Megaphone, Shield, Presentation,
  BookOpen, Check, FileDown
} from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { id: 'white_paper', label: 'White Paper', icon: BookOpen, description: 'Comprehensive technical document' },
  { id: 'business_plan', label: 'Business Plan', icon: Briefcase, description: 'Detailed business strategy' },
  { id: 'pitch_deck', label: 'Pitch Deck', icon: Presentation, description: 'Investor presentation content' },
  { id: 'market_research', label: 'Market Research', icon: TrendingUp, description: 'Industry and market analysis' },
  { id: 'marketing_strategy', label: 'Marketing Strategy', icon: Megaphone, description: 'Go-to-market plan' },
  { id: 'ip_protection', label: 'IP Protection Guide', icon: Shield, description: 'Intellectual property guidance' },
];

export default function DocumentHub() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      const [projectRes, docsRes] = await Promise.all([
        projectAPI.getOne(id),
        documentAPI.getAll(id)
      ]);
      setProject(projectRes.data);
      setDocuments(docsRes.data);
      if (docsRes.data.length > 0) {
        setSelectedDoc(docsRes.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (type) => {
    setGenerating(type);
    try {
      const response = await documentAPI.generate({
        project_id: id,
        document_type: type
      });
      setDocuments(prev => [response.data, ...prev]);
      setSelectedDoc(response.data);
      toast.success(`${getDocumentTypeLabel(type)} generated successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate document');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = () => {
    if (!selectedDoc) return;
    const filename = `${selectedDoc.title.replace(/\s+/g, '_')}.md`;
    downloadFile(selectedDoc.content, filename, 'text/markdown');
    toast.success('Markdown downloaded');
  };

  const handleDownloadPDF = () => {
    if (!selectedDoc) return;
    downloadPDF(selectedDoc.content, selectedDoc.title, selectedDoc.document_type);
    toast.success('PDF downloaded');
  };

  const getExistingTypes = () => {
    return documents.map(d => d.document_type);
  };

  // Simple markdown renderer
  const renderMarkdown = (content) => {
    if (!content) return null;
    
    // Split by lines and process
    const lines = content.split('\n');
    const elements = [];
    
    lines.forEach((line, idx) => {
      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-3xl font-bold mb-4 mt-6">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-2xl font-semibold mb-3 mt-5">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-xl font-medium mb-2 mt-4">{line.slice(4)}</h3>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={idx} className="ml-4 mb-1">{line.slice(2)}</li>);
      } else if (line.match(/^\d+\./)) {
        elements.push(<li key={idx} className="ml-4 mb-1 list-decimal">{line.replace(/^\d+\./, '')}</li>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={idx} className="font-bold mb-2">{line.slice(2, -2)}</p>);
      } else if (line.trim() === '') {
        elements.push(<br key={idx} />);
      } else {
        elements.push(<p key={idx} className="mb-2 text-gray-700">{line}</p>);
      }
    });
    
    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="document-hub-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)} data-testid="back-btn">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Document Hub</h1>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Document Types */}
        <aside className="w-80 border-r border-border/40 bg-card/20 p-6 overflow-auto">
          <h2 className="text-sm font-medium mb-4">Generate Documents</h2>
          <div className="space-y-2">
            {DOCUMENT_TYPES.map((type) => {
              const Icon = type.icon;
              const exists = getExistingTypes().includes(type.id);
              const isGenerating = generating === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => !isGenerating && generateDocument(type.id)}
                  disabled={isGenerating}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    exists 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30'
                  }`}
                  data-testid={`generate-${type.id}-btn`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      exists ? 'bg-emerald-500/10' : 'bg-primary/10'
                    }`}>
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : exists ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {documents.length > 0 && (
            <>
              <h2 className="text-sm font-medium mt-8 mb-4">Generated Documents</h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedDoc?.id === doc.id
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/40 hover:bg-secondary/30'
                    }`}
                    data-testid={`doc-list-item-${doc.id}`}
                  >
                    <p className="font-medium text-sm truncate">{getDocumentTypeLabel(doc.document_type)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(doc.created_at)}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Main Content - Document View */}
        <main className="flex-1 overflow-auto">
          {selectedDoc ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {getDocumentTypeLabel(selectedDoc.document_type)}
                  </Badge>
                  <h2 className="text-2xl font-semibold">{selectedDoc.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generated on {formatDate(selectedDoc.created_at)}
                  </p>
                </div>
                <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90" data-testid="download-pdf-btn">
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownload} variant="outline" className="border-primary/30" data-testid="download-doc-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>
              
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="bg-card/50 border border-border/40 mb-6">
                  <TabsTrigger value="preview" data-testid="preview-tab">Preview</TabsTrigger>
                  <TabsTrigger value="markdown" data-testid="markdown-tab">Markdown</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview">
                  <Card className="bg-white text-black shadow-xl min-h-[800px] w-full max-w-[850px] mx-auto rounded-sm p-12">
                    {renderMarkdown(selectedDoc.content)}
                  </Card>
                </TabsContent>
                
                <TabsContent value="markdown">
                  <Card className="glass-card border-border/40">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <pre className="p-6 text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                        {selectedDoc.content}
                      </pre>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Document Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a document from the sidebar to get started
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
