"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, { UserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Save,
  Loader2,
  Plus,
  X,
  Target,
  Award,
  Code,
  FileText,
  CheckCircle,
  Sparkles,
  Edit3,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [profile, setProfile] = useState<UserProfile>({
    bio: "",
    skills: [],
    experience: "",
    education: "",
    desiredRole: "",
    location: "",
    linkedIn: "",
    github: "",
    portfolio: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        bio: user.profile.bio || "",
        skills: user.profile.skills || [],
        experience: user.profile.experience || "",
        education: user.profile.education || "",
        desiredRole: user.profile.desiredRole || "",
        location: user.profile.location || "",
        linkedIn: user.profile.linkedIn || "",
        github: user.profile.github || "",
        portfolio: user.profile.portfolio || "",
      });
    }
  }, [user]);

  const profileCompletion = () => {
    const fields = [
      profile.bio,
      profile.skills.length > 0,
      profile.experience,
      profile.education,
      profile.desiredRole,
      profile.location,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile((p) => ({ ...p, skills: [...p.skills, skill] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateProfile(profile);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  const completion = profileCompletion();

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-5 h-5 text-forest" />
            <span className="text-sm font-medium text-forest">Profile</span>
          </div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to get better job matches and career advice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-linear-to-br from-forest to-forest-600 text-white text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile.desiredRole && (
                  <Badge variant="secondary" className="mt-3">
                    <Target className="w-3 h-3 mr-1" />
                    {profile.desiredRole}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Completion */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forest" />
                  Profile Completion
                </h4>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={completion} className="flex-1" />
                  <span className="text-sm font-semibold text-forest">{completion}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {completion === 100
                    ? "Your profile is complete! 🎉"
                    : "Complete your profile for better recommendations"}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <h4 className="font-semibold mb-1">Quick Stats</h4>
                {[
                  { icon: Code, label: "Skills", value: profile.skills.length },
                  { icon: FileText, label: "Resumes Analyzed", value: user?.resumeAnalyses?.length || 0 },
                  { icon: Briefcase, label: "Saved Jobs", value: user?.savedJobs?.length || 0 },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="w-4 h-4" /> {stat.label}
                      </span>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Banner */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                Profile updated successfully!
              </div>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-forest" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., San Francisco, CA"
                        value={profile.location}
                        onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Desired Role</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Senior Full Stack Developer"
                        value={profile.desiredRole}
                        onChange={(e) => setProfile((p) => ({ ...p, desiredRole: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-forest" />
                  Skills
                </CardTitle>
                <CardDescription>Add your technical and soft skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button onClick={addSkill} size="icon" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 py-1.5 px-3">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience & Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-forest" />
                  Experience & Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Experience</label>
                  <Textarea
                    placeholder="Describe your work experience..."
                    value={profile.experience}
                    onChange={(e) => setProfile((p) => ({ ...p, experience: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Education</label>
                  <Textarea
                    placeholder="Describe your educational background..."
                    value={profile.education}
                    onChange={(e) => setProfile((p) => ({ ...p, education: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-forest" />
                  Links & Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">LinkedIn</label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={profile.linkedIn}
                    onChange={(e) => setProfile((p) => ({ ...p, linkedIn: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">GitHub</label>
                  <Input
                    placeholder="https://github.com/..."
                    value={profile.github}
                    onChange={(e) => setProfile((p) => ({ ...p, github: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Portfolio</label>
                  <Input
                    placeholder="https://yourportfolio.com"
                    value={profile.portfolio}
                    onChange={(e) => setProfile((p) => ({ ...p, portfolio: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
