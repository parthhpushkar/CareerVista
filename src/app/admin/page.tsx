"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { AdminStats, Job } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  Users,
  Briefcase,
  BarChart3,
  Loader2,
  Plus,
  Trash2,
  Save,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  MessageSquare,
  Database,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // New Job form
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    skills: "",
    salaryMin: "",
    salaryMax: "",
  });

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
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (e: any) {
      if (e?.message?.includes('Admin access required') || e?.message?.includes('403')) {
        setAccessDenied(true);
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.company) return;
    try {
      setCreating(true);
      await api.createJob({
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        type: jobForm.type,
        description: jobForm.description,
        requirements: jobForm.requirements.split("\n").filter(Boolean),
        skills: jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        salary: {
          min: Number(jobForm.salaryMin) || 0,
          max: Number(jobForm.salaryMax) || 0,
          currency: 'USD',
        },
      });
      setSuccess("Job created successfully!");
      setJobForm({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        skills: "",
        salaryMin: "",
        salaryMax: "",
      });
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSeedJobs = async () => {
    try {
      setSeeding(true);
      await api.seedJobs();
      setSuccess("Sample jobs seeded successfully!");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            You need admin privileges to access this page. The first registered account is automatically an admin.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-forest" />
            <span className="text-sm font-medium text-forest">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, jobs, and platform data</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm animate-fade-in mb-6">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Briefcase, label: "Total Jobs", value: stats?.totalJobs || 0, color: "text-forest", bg: "bg-forest-50" },
            { icon: Activity, label: "Active Jobs", value: stats?.activeJobs || 0, color: "text-green-600", bg: "bg-green-50" },
            { icon: FileText, label: "Resumes Analyzed", value: stats?.totalResumes || 0, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="create-job" className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Job
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5">
              <Database className="w-4 h-4" /> Tools
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Registered Users</CardTitle>
                    <CardDescription>{users.length} total users</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2 font-medium text-muted-foreground">User</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Email</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Skills</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Role</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-forest-100 text-forest text-xs">
                                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1 flex-wrap">
                              {u.profile?.skills?.slice(0, 3).map((s: string) => (
                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {u.role || "user"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Job Tab */}
          <TabsContent value="create-job">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-forest" />
                  Create New Job
                </CardTitle>
                <CardDescription>Add a new job listing to the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Job Title *</label>
                    <Input
                      placeholder="e.g., Senior React Developer"
                      value={jobForm.title}
                      onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Company *</label>
                    <Input
                      placeholder="e.g., Google"
                      value={jobForm.company}
                      onChange={(e) => setJobForm((f) => ({ ...f, company: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Location</label>
                    <Input
                      placeholder="e.g., Remote, San Francisco"
                      value={jobForm.location}
                      onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Type</label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Remote</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Job description..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Requirements (one per line)</label>
                  <Textarea
                    placeholder="5+ years experience in React&#10;Strong TypeScript skills&#10;..."
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm((f) => ({ ...f, requirements: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Skills (comma separated)</label>
                  <Input
                    placeholder="React, TypeScript, Node.js, GraphQL"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm((f) => ({ ...f, skills: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Min Salary ($)</label>
                    <Input
                      type="number"
                      placeholder="80000"
                      value={jobForm.salaryMin}
                      onChange={(e) => setJobForm((f) => ({ ...f, salaryMin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Max Salary ($)</label>
                    <Input
                      type="number"
                      placeholder="150000"
                      value={jobForm.salaryMax}
                      onChange={(e) => setJobForm((f) => ({ ...f, salaryMax: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateJob}
                  disabled={creating || !jobForm.title || !jobForm.company}
                  className="gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Job
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                        <Database className="w-6 h-6 text-forest" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Seed Sample Jobs</h3>
                        <p className="text-sm text-muted-foreground">
                          Populate the database with 12 sample job listings for demo purposes
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleSeedJobs} disabled={seeding} variant="outline" className="gap-2">
                      {seeding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Seeding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Seed Jobs
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Platform Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        {stats?.totalUsers || 0} users, {stats?.totalJobs || 0} jobs, {stats?.totalResumes || 0} resume analyses performed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
