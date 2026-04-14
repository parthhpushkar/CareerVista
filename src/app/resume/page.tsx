"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { ResumeAnalysis, ResumeHistoryItem } from "@/lib/api";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  BookOpen,
  Award,
  BarChart3,
  Clock,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Search,
  Zap,
} from "lucide-react";

export default function ResumePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      const data = await api.getResumeHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setUploadedFile(file);

    const isBinary = file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword';

    if (isBinary) {
      setResumeText(`[${file.name} – will be parsed on upload]`);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const analyzeResume = async () => {
    if (!resumeText.trim() && !uploadedFile) {
      setError("Please upload or paste your resume text");
      return;
    }
    setError("");
    setAnalyzing(true);
    try {
      let textToAnalyze = resumeText;
      let nameToUse = fileName || "resume.txt";

      // If a binary file was uploaded (PDF/DOCX), extract text server-side first
      if (uploadedFile && (uploadedFile.type === 'application/pdf' ||
          uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          uploadedFile.type === 'application/msword')) {
        const uploaded = await api.uploadResumeFile(uploadedFile);
        textToAnalyze = uploaded.text;
        nameToUse = uploaded.fileName;
      }

      const result = await api.analyzeResume(textToAnalyze, nameToUse);
      setAnalysis(result);
      setActiveTab("results");
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume. Make sure the OpenAI API key is configured.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-forest" />
            <span className="text-sm font-medium text-forest">AI-Powered</span>
          </div>
          <h1 className="text-3xl font-bold">Resume Analyzer</h1>
          <p className="text-muted-foreground mt-1">
            Get instant AI feedback on your resume with detailed scoring and actionable improvements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upload" className="gap-1.5">
              <Upload className="w-4 h-4" /> Upload
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-1.5" disabled={!analysis}>
              <BarChart3 className="w-4 h-4" /> Results
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <Clock className="w-4 h-4" /> History ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Drop Zone */}
                <Card>
                  <CardContent className="p-8">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? "border-forest bg-forest-50"
                          : "border-border hover:border-forest/50 hover:bg-forest-50/30"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-forest-100 flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-forest" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">
                            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            or click to browse • Supports PDF, DOCX, TXT, MD files (max 10MB)
                          </p>
                        </div>
                        {fileName && (
                          <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
                            <FileText className="w-3.5 h-3.5" />
                            {fileName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Or paste your resume text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={resumeText}
                      onChange={(e) => { setResumeText(e.target.value); setFileName("pasted-resume.txt"); }}
                      placeholder="Paste your resume content here...&#10;&#10;John Doe&#10;Software Engineer&#10;john@example.com | (555) 123-4567&#10;&#10;EXPERIENCE&#10;Senior Developer at TechCorp (2022-Present)&#10;- Led development of microservices architecture&#10;- Improved system performance by 40%&#10;&#10;EDUCATION&#10;B.S. Computer Science, State University (2018)&#10;&#10;SKILLS&#10;JavaScript, React, Node.js, Python, AWS"
                      className="w-full min-h-50 p-4 rounded-xl border border-border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest resize-none"
                    />
                  </CardContent>
                </Card>

                {error && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={analyzeResume}
                  disabled={analyzing || !resumeText.trim()}
                  size="lg"
                  className="w-full gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing your resume...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze Resume with AI
                    </>
                  )}
                </Button>
              </div>

              {/* Tips Sidebar */}
              <div className="space-y-6">
                <Card className="bg-linear-to-br from-forest to-forest-dark text-white border-0">
                  <CardContent className="p-6 space-y-4">
                    <Sparkles className="w-8 h-8" />
                    <h3 className="font-semibold text-lg">AI Analysis Includes</h3>
                    <ul className="space-y-2.5 text-sm text-white/90">
                      {[
                        "Overall resume score (0-100)",
                        "Section-by-section feedback",
                        "ATS compatibility check",
                        "Keyword analysis",
                        "Improvement suggestions",
                        "Career recommendations",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-forest-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-forest" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Use action verbs to start bullet points",
                      "Quantify achievements with numbers",
                      "Keep resume to 1-2 pages",
                      "Tailor keywords to job description",
                    ].map((tip) => (
                      <div key={tip} className="flex items-start gap-2 text-sm">
                        <Target className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {analysis && (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid sm:grid-cols-3 gap-6">
                  <Card className={`${getScoreBg(analysis.overallScore)} border-2 sm:col-span-1`}>
                    <CardContent className="p-6 text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </div>
                      <div className="text-sm font-medium mt-1">out of 100</div>
                      <Badge className="mt-2" variant={analysis.overallScore >= 70 ? "default" : "secondary"}>
                        {getScoreLabel(analysis.overallScore)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="sm:col-span-2">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-forest" />
                        ATS Compatibility
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Score</span>
                          <span className={`font-bold text-lg ${getScoreColor(analysis.atsCompatibility?.score || 0)}`}>
                            {analysis.atsCompatibility?.score || 0}%
                          </span>
                        </div>
                        <Progress value={analysis.atsCompatibility?.score || 0} />
                        {analysis.atsCompatibility?.issues?.length > 0 && (
                          <div className="space-y-1.5 mt-2">
                            {analysis.atsCompatibility.issues.slice(0, 3).map((issue, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-forest" />
                      Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-forest" />
                      Section Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analysis.sections || {}).map(([key, section]) => (
                        <div key={key} className="p-4 rounded-xl border border-border hover:border-forest/20 transition space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{key}</span>
                            <span className={`font-bold ${getScoreColor(section.score)}`}>
                              {section.score}
                            </span>
                          </div>
                          <Progress value={section.score} />
                          <p className="text-xs text-muted-foreground">{section.feedback}</p>
                          {section.suggestions?.length > 0 && (
                            <div className="space-y-1">
                              {section.suggestions.slice(0, 2).map((s, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs">
                                  <Lightbulb className="w-3 h-3 text-forest shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{s}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Search className="w-4 h-4 text-forest" />
                        Keywords Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(analysis.keywords?.found || []).map((kw, i) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            {kw}
                          </Badge>
                        ))}
                        {(!analysis.keywords?.found || analysis.keywords.found.length === 0) && (
                          <p className="text-sm text-muted-foreground">No keywords detected</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(analysis.keywords?.missing || []).map((kw, i) => (
                          <Badge key={i} variant="destructive" className="gap-1">
                            {kw}
                          </Badge>
                        ))}
                        {(!analysis.keywords?.missing || analysis.keywords.missing.length === 0) && (
                          <p className="text-sm text-muted-foreground">No missing keywords</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(analysis.strengths || []).map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(analysis.improvements || []).map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Career Suggestions */}
                {analysis.careerSuggestions?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-forest" />
                        Career Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {analysis.careerSuggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-forest-50/50">
                            <Award className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                            <span className="text-sm">{s}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={() => setActiveTab("upload")} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Analyze Another Resume
                </Button>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>Your previous resume analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-forest/20 transition cursor-pointer"
                        onClick={() => {
                          setAnalysis(item.analysis);
                          setActiveTab("results");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-forest" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                            {item.score}
                          </p>
                          <p className="text-xs text-muted-foreground">/ 100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-forest" />
                    </div>
                    <p className="text-muted-foreground">No analyses yet</p>
                    <Button onClick={() => setActiveTab("upload")} className="gap-2">
                      Analyze Your First Resume
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
