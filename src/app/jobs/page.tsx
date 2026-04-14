"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { Job, MatchedJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Heart,
  Sparkles,
  Loader2,
  Building,
  Filter,
  Target,
  BookmarkPlus,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

export default function JobsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadMatchedJobs();
      loadSavedJobs();
    }
  }, [isAuthenticated]);

  const loadJobs = async (searchQuery?: string, type?: string) => {
    try {
      setLoading(true);
      const { jobs: data } = await api.getJobs({ search: searchQuery, type });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchedJobs = async () => {
    try {
      const data = await api.getMatchedJobs();
      setMatchedJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const data = await api.getSavedJobs();
      setSavedJobs(data);
      setSavedIds(new Set(data.map((j) => j._id)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = () => {
    loadJobs(search, typeFilter);
  };

  const toggleSave = async (jobId: string) => {
    try {
      await api.saveJob(jobId);
      const newSaved = new Set(savedIds);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
      } else {
        newSaved.add(jobId);
      }
      setSavedIds(newSaved);
      loadSavedJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const jobTypes = ["Full-time", "Part-time", "Remote", "Contract", "Internship"];

  const formatSalary = (job: Job) => {
    if (!job.salary?.min) return "Competitive";
    return `$${(job.salary.min / 1000).toFixed(0)}K - $${(job.salary.max / 1000).toFixed(0)}K`;
  };

  const JobCard = ({ job, matchPercent }: { job: Job; matchPercent?: number }) => (
    <Card className="group hover:shadow-lg hover:border-forest/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-forest-100 to-forest-50 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6 text-forest" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div>
                <h3 className="font-semibold group-hover:text-forest transition-colors">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> {formatSalary(job)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {job.skills?.slice(0, 4).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-0.5">{skill}</Badge>
                ))}
                {job.skills?.length > 4 && (
                  <Badge variant="secondary" className="text-xs py-0.5">+{job.skills.length - 4}</Badge>
                )}
              </div>
              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {matchPercent !== undefined && matchPercent > 0 && (
              <div className="text-center">
                <div className={`text-lg font-bold ${matchPercent >= 70 ? "text-green-600" : matchPercent >= 40 ? "text-yellow-600" : "text-muted-foreground"}`}>
                  {matchPercent}%
                </div>
                <p className="text-xs text-muted-foreground">Match</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleSave(job._id)}
              className={savedIds.has(job._id) ? "text-forest" : "text-muted-foreground"}
            >
              {savedIds.has(job._id) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <BookmarkPlus className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            <span className="text-sm font-medium text-forest">Smart Matching</span>
          </div>
          <h1 className="text-3xl font-bold">Job Matching</h1>
          <p className="text-muted-foreground mt-1">
            Discover opportunities tailored to your skills and career goals
          </p>
        </div>

        <Tabs defaultValue="browse">
          <TabsList className="mb-6">
            <TabsTrigger value="browse" className="gap-1.5">
              <Search className="w-4 h-4" /> Browse
            </TabsTrigger>
            <TabsTrigger value="matched" className="gap-1.5">
              <Target className="w-4 h-4" /> AI Matched
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-1.5">
              <Heart className="w-4 h-4" /> Saved ({savedJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            {/* Search & Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs, skills, or companies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); loadJobs(search, e.target.value); }}
                      className="h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                    >
                      <option value="">All Types</option>
                      {jobTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <Button onClick={handleSearch} className="gap-1.5">
                      <Filter className="w-4 h-4" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Briefcase, label: "Active Jobs", value: jobs.length },
                { icon: Star, label: "AI Matched", value: matchedJobs.length },
                { icon: Heart, label: "Saved", value: savedJobs.length },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-forest" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-forest">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Job List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-forest" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8 text-forest" />
                </div>
                <p className="text-muted-foreground">No jobs found. Try different search terms.</p>
              </div>
            )}
          </TabsContent>

          {/* Matched Tab */}
          <TabsContent value="matched">
            <Card className="mb-6 bg-linear-to-r from-forest-50 to-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Job Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Jobs are matched based on your profile skills. Add more skills to get better matches.
                  </p>
                </div>
              </CardContent>
            </Card>

            {matchedJobs.length > 0 ? (
              <div className="space-y-4">
                {matchedJobs.map((job) => (
                  <JobCard key={job._id} job={job} matchPercent={job.matchPercent} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-forest" />
                </div>
                <p className="text-muted-foreground">Add skills to your profile to see matched jobs</p>
                <Button onClick={() => router.push("/profile")} className="gap-2">
                  <Users className="w-4 h-4" />
                  Update Profile
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedJobs.length > 0 ? (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-forest" />
                </div>
                <p className="text-muted-foreground">No saved jobs yet</p>
                <p className="text-sm text-muted-foreground">Browse jobs and click the bookmark icon to save them</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
