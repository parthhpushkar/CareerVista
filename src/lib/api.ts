const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('careervista_token');
  }

  private getHeaders(hasBody = false): HeadersInit {
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (hasBody) headers['Content-Type'] = 'application/json';
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  // Auth
  async register(name: string, email: string, password: string) {
    return this.post<{ token: string; user: User }>('/api/auth/register', { name, email, password });
  }

  async login(email: string, password: string) {
    return this.post<{ token: string; user: User }>('/api/auth/login', { email, password });
  }

  async getMe() {
    return this.get<User>('/api/auth/me');
  }

  // Profile
  async updateProfile(profile: UserProfile) {
    return this.put<User>('/api/profile', profile);
  }

  // Resume
  async analyzeResume(resumeText: string, fileName: string) {
    return this.post<ResumeAnalysis>('/api/resume/analyze', { resumeText, fileName });
  }

  async uploadResumeFile(file: File): Promise<{ text: string; fileName: string }> {
    const formData = new FormData();
    formData.append('resume', file);
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${this.baseUrl}/api/resume/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  }

  async getResumeHistory() {
    return this.get<ResumeHistoryItem[]>('/api/resume/history');
  }

  // Chat
  async sendMessage(message: string, history: ChatMessage[]) {
    return this.post<{ reply: string }>('/api/chat', { message, history });
  }

  async getChatHistory() {
    return this.get<ChatMessage[]>('/api/chat/history');
  }

  // Roadmap
  async generateRoadmap(data: RoadmapRequest) {
    return this.post<CareerRoadmap>('/api/roadmap/generate', data);
  }

  async getRoadmap() {
    return this.get<CareerRoadmap | null>('/api/roadmap');
  }

  // Jobs
  async getJobs(params?: JobSearchParams) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', params.page.toString());
    return this.get<{ jobs: Job[]; total: number; pages: number }>(`/api/jobs?${query.toString()}`);
  }

  async getMatchedJobs() {
    return this.get<MatchedJob[]>('/api/jobs/match');
  }

  async saveJob(jobId: string) {
    return this.post<{ saved: boolean }>(`/api/jobs/${jobId}/save`);
  }

  async getSavedJobs() {
    return this.get<Job[]>('/api/jobs/saved');
  }

  // Admin
  async getAdminStats() {
    return this.get<AdminStats>('/api/admin/stats');
  }

  async getAdminUsers() {
    return this.get<User[]>('/api/admin/users');
  }

  async createJob(job: Partial<Job>) {
    return this.post<Job>('/api/jobs', job);
  }

  async seedJobs() {
    return this.post<{ message: string }>('/api/seed/jobs');
  }
}

// Types
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: UserProfile;
  resumeAnalyses?: ResumeHistoryItem[];
  chatHistory?: ChatMessage[];
  savedJobs?: string[];
  roadmap?: CareerRoadmap;
  createdAt?: string;
}

export interface UserProfile {
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: string;
  education?: string;
  desiredRole?: string;
  avatar?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contact: SectionScore;
    summary: SectionScore;
    experience: SectionScore;
    education: SectionScore;
    skills: SectionScore;
    formatting: SectionScore;
  };
  keywords: {
    found: string[];
    missing: string[];
    industryRelevance: number;
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
  strengths: string[];
  improvements: string[];
  careerSuggestions: string[];
  summary: string;
}

export interface SectionScore {
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface ResumeHistoryItem {
  fileName: string;
  score: number;
  analysis: ResumeAnalysis;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface CareerRoadmap {
  title?: string;
  currentRole?: string;
  targetRole?: string;
  estimatedTime?: string;
  phases?: RoadmapPhase[];
  recommendedCourses?: Course[];
  certifications?: Certification[];
  networkingTips?: string[];
  salaryExpectation?: string | {
    entry?: string;
    mid?: string;
    senior?: string;
  };
  summary?: string;
}

export interface RoadmapPhase {
  title?: string;
  name?: string;
  duration?: string;
  description?: string;
  tasks?: RoadmapTask[];
  milestones?: string[];
  skills?: string[];
  resources?: string[];
}

export interface RoadmapTask {
  title: string;
  description: string;
  resources: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface Course {
  name: string;
  platform: string;
  type: 'free' | 'paid';
  url: string;
}

export interface Certification {
  name: string;
  provider: string;
  importance: 'essential' | 'recommended' | 'optional';
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  category: string;
  postedDate: string;
  deadline?: string;
  isActive: boolean;
}

export interface MatchedJob extends Job {
  matchPercent: number;
}

export interface JobSearchParams {
  search?: string;
  type?: string;
  category?: string;
  page?: number;
}

export interface RoadmapRequest {
  currentRole?: string;
  targetRole: string;
  skills?: string[];
  experience?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalResumes: number;
  recentUsers?: User[];
  usersWithAnalyses?: number;
}

export const api = new ApiClient();
export default api;
