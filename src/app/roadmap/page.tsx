"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { CareerRoadmap, RoadmapPhase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Map,
  Sparkles,
  Loader2,
  Target,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  BookOpen,
  Award,
  DollarSign,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Rocket,
  GraduationCap,
  Briefcase,
} from "lucide-react";

export default function RoadmapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  // Form state
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) loadRoadmap();
  }, [isAuthenticated]);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const data = await api.getRoadmap();
      if (data) setRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentRole.trim() || !targetRole.trim()) return;
    try {
      setGenerating(true);
      const data = await api.generateRoadmap({
        currentRole: currentRole.trim(),
        targetRole: targetRole.trim(),
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: experience.trim(),
      });
      setRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const phaseIcons = [Rocket, TrendingUp, Target, GraduationCap, Award];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-forest" />
            <span className="text-sm font-medium text-forest">Career Roadmap</span>
          </div>
          <h1 className="text-3xl font-bold">AI Career Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Get a personalized step-by-step plan to reach your dream career
          </p>
        </div>

        {/* Generator Form */}
        <Card className="mb-8 border-forest/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-forest" />
              Generate Your Roadmap
            </CardTitle>
            <CardDescription>
              Tell us where you are and where you want to go
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Current Role</label>
                <Input
                  placeholder="e.g., Junior Developer"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Target Role</label>
                <Input
                  placeholder="e.g., Senior Full Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Skills</label>
              <Input
                placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Experience & Background</label>
              <Textarea
                placeholder="Tell us about your current experience, education, and any relevant background..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || !currentRole.trim() || !targetRole.trim()}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generating State */}
        {generating && (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-forest to-forest-600 flex items-center justify-center mx-auto animate-pulse">
              <Map className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Creating Your Career Roadmap</h3>
              <p className="text-muted-foreground text-sm">
                Our AI is analyzing career paths and building your personalized plan...
              </p>
            </div>
            <Progress value={60} className="max-w-xs mx-auto" />
          </div>
        )}

        {/* Roadmap Display */}
        {roadmap && !generating && (
          <div className="space-y-6 animate-fade-in">
            {/* Roadmap Header Card */}
            <Card className="bg-linear-to-r from-forest-50 to-white border-forest/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {roadmap.currentRole}
                    </Badge>
                  </div>
                  <ArrowRight className="w-5 h-5 text-forest hidden sm:block" />
                  <div>
                    <Badge className="mb-2 bg-forest text-white">
                      {roadmap.targetRole}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-6 mt-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {roadmap.estimatedTime || "6-12 months"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    {roadmap.phases?.length || 0} Phases
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {typeof roadmap.salaryExpectation === 'object' && roadmap.salaryExpectation
                      ? `${roadmap.salaryExpectation.entry || '?'} → ${roadmap.salaryExpectation.mid || '?'} → ${roadmap.salaryExpectation.senior || '?'}`
                      : (roadmap.salaryExpectation || "Competitive")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-forest via-forest/50 to-forest/10 hidden sm:block" />

              <div className="space-y-6">
                {roadmap.phases?.map((phase, idx) => {
                  const PhaseIcon = phaseIcons[idx % phaseIcons.length];
                  const isExpanded = expandedPhase === idx;

                  return (
                    <div key={idx} className="relative flex gap-4 sm:gap-6">
                      {/* Timeline dot */}
                      <div className="relative z-10 shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-forest to-forest-600 flex items-center justify-center shadow-lg shadow-forest/20">
                          <PhaseIcon className="w-7 h-7 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <Card className="flex-1 hover:border-forest/20 transition-all">
                        <CardContent className="p-6">
                          <div
                            className="cursor-pointer"
                            onClick={() => setExpandedPhase(isExpanded ? null : idx)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    Phase {idx + 1}
                                  </Badge>
                                  {phase.duration && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {phase.duration}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold">{phase.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {phase.description}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t space-y-5 animate-fade-in">
                              {/* Tasks / Milestones */}
                              {phase.milestones && phase.milestones.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                                    <CheckCircle className="w-4 h-4 text-forest" />
                                    Key Milestones
                                  </h4>
                                  <div className="space-y-2">
                                    {phase.milestones.map((m, i) => (
                                      <div key={i} className="flex items-start gap-2.5 text-sm">
                                        <Circle className="w-3 h-3 mt-1.5 text-forest shrink-0" />
                                        <span>{m}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Skills to Learn */}
                              {phase.skills && phase.skills.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                                    <TrendingUp className="w-4 h-4 text-forest" />
                                    Skills to Develop
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {phase.skills.map((s, i) => (
                                      <Badge key={i} variant="secondary">{s}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recommended Resources */}
                              {phase.resources && phase.resources.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                                    <BookOpen className="w-4 h-4 text-forest" />
                                    Recommended Resources
                                  </h4>
                                  <div className="space-y-2">
                                    {phase.resources.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2.5 text-sm">
                                        <GraduationCap className="w-3.5 h-3.5 mt-1 text-forest shrink-0" />
                                        <span>{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Card */}
            {roadmap.summary && (
              <Card className="border-forest/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-forest" />
                    Summary & Tips
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {roadmap.summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!roadmap && !generating && !loading && (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
              <Map className="w-10 h-10 text-forest" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Roadmap Yet</h3>
              <p className="text-muted-foreground text-sm">
                Fill in the form above and let our AI create a personalized career roadmap for you
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
