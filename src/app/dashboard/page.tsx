"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { ResumeHistoryItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  FileText,
  Briefcase,
  Map,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Activity,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const history = await api.getResumeHistory();
      setResumeHistory(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  const latestResume = resumeHistory.length > 0 ? resumeHistory[resumeHistory.length - 1] : null;
  const resumeScore = latestResume?.score || 0;
  const skills = user?.profile?.skills || [];
  const completionItems = [
    { label: "Profile completed", done: !!user?.profile?.bio },
    { label: "Resume analyzed", done: resumeHistory.length > 0 },
    { label: "Skills added", done: skills.length > 0 },
    { label: "Career goal set", done: !!user?.profile?.desiredRole },
  ];
  const profileCompletion = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  const quickActions = [
    { icon: MessageSquare, label: "AI Counselor", href: "/chat", desc: "Get career advice", color: "bg-forest" },
    { icon: FileText, label: "Resume Analyzer", href: "/resume", desc: "Analyze your resume", color: "bg-emerald-600" },
    { icon: Briefcase, label: "Job Matching", href: "/jobs", desc: "Find matching jobs", color: "bg-green-700" },
    { icon: Map, label: "Career Roadmap", href: "/roadmap", desc: "Plan your career", color: "bg-forest-dark" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-forest" />
            <span className="text-sm font-medium text-forest">Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "User"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your career progress overview</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Card className="group cursor-pointer hover:shadow-lg hover:border-forest/20 transition-all h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-forest transition-colors">{action.label}</h3>
                      <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resume Score</p>
                      <p className="text-3xl font-bold text-forest mt-1">{resumeScore || "—"}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-forest" />
                    </div>
                  </div>
                  {resumeScore > 0 && (
                    <div className="mt-3">
                      <Progress value={resumeScore} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Skills</p>
                      <p className="text-3xl font-bold text-forest mt-1">{skills.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-forest" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {skills.length > 0 ? "Skills on profile" : "Add skills to your profile"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Analyses</p>
                      <p className="text-3xl font-bold text-forest mt-1">{resumeHistory.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-forest" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Resume analyses done</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Resume Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-forest" />
                  Latest Resume Analysis
                </CardTitle>
                <CardDescription>Your most recent resume analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                {latestResume ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-forest-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-forest flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{latestResume.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(latestResume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-forest">{latestResume.score}/100</p>
                        <Badge variant={latestResume.score >= 70 ? "default" : "secondary"}>
                          {latestResume.score >= 80 ? "Excellent" : latestResume.score >= 60 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                    </div>

                    {latestResume.analysis?.strengths && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-forest" />
                          Top Strengths
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {latestResume.analysis.strengths.slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href="/resume">
                      <Button variant="outline" className="w-full gap-2">
                        View Full Analysis <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-forest" />
                    </div>
                    <p className="text-muted-foreground">No resume analyzed yet</p>
                    <Link href="/resume">
                      <Button className="gap-2">
                        Analyze Resume <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Career Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-forest" />
                  Career Insights
                </CardTitle>
                <CardDescription>Personalized tips to boost your career</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Target,
                      title: "Set Clear Goals",
                      desc: "Define your dream role and use our roadmap feature to plan your journey.",
                    },
                    {
                      icon: BookOpen,
                      title: "Continuous Learning",
                      desc: "Stay updated with industry trends and upskill with recommended courses.",
                    },
                    {
                      icon: MessageSquare,
                      title: "AI-Powered Advice",
                      desc: "Chat with our AI counselor for personalized career guidance anytime.",
                    },
                    {
                      icon: Clock,
                      title: "Regular Reviews",
                      desc: "Analyze your resume regularly to keep it optimized for ATS systems.",
                    },
                  ].map((insight) => {
                    const Icon = insight.icon;
                    return (
                      <div key={insight.title} className="flex gap-3 p-4 rounded-xl bg-muted/50 hover:bg-forest-50/50 transition">
                        <Icon className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{insight.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-forest" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-forest">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} />
                  <div className="space-y-2.5">
                    {completionItems.map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2
                          className={`w-4 h-4 ${item.done ? "text-forest" : "text-muted-foreground/30"}`}
                        />
                        <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-forest" />
                  Your Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm">Add Skills</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="bg-linear-to-br from-forest to-forest-dark text-white border-0">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">Need Career Advice?</h3>
                <p className="text-sm text-white/80">
                  Our AI counselor is available 24/7 to help you with career decisions, interview prep, and more.
                </p>
                <Link href="/chat">
                  <Button className="w-full bg-white text-forest hover:bg-white/90 gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Start Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
