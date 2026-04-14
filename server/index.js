const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer config for file uploads (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, TXT, and MD files are allowed'));
    }
  },
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ─── Schemas ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    phone: String,
    location: String,
    bio: String,
    skills: [String],
    experience: String,
    education: String,
    desiredRole: String,
    avatar: String,
    linkedIn: String,
    github: String,
    portfolio: String,
  },
  resumeAnalyses: [{
    fileName: String,
    score: Number,
    analysis: Object,
    createdAt: { type: Date, default: Date.now }
  }],
  chatHistory: [{
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  roadmap: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'] },
  salary: { min: Number, max: Number, currency: { type: String, default: 'USD' } },
  description: String,
  requirements: [String],
  skills: [String],
  experience: String,
  category: String,
  postedDate: { type: Date, default: Date.now },
  deadline: Date,
  isActive: { type: Boolean, default: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

// ─── Gemini AI Helper (with retry + model fallback) ──────
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];

async function callGemini(prompt, retries = 3) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        if (err.status === 429) {
          // Rate limited — wait before retry or try next model
          const waitMs = (attempt + 1) * 5000;
          console.log(`Rate limited on ${modelName}, waiting ${waitMs / 1000}s (attempt ${attempt + 1}/${retries})...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        if (err.status === 404) {
          // Model not found — skip to next model
          console.log(`Model ${modelName} not available, trying next...`);
          break;
        }
        throw err; // Other errors — don't retry
      }
    }
  }
  throw lastError || new Error('All Gemini models exhausted');
}

// ─── Auth Middleware ─────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'careervista-secret-key-2026';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Auth Routes ─────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 12);
    // First user becomes admin automatically
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ─── Profile Routes ──────────────────────────────────────
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profile: req.body, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── Resume Analysis Routes ──────────────────────────────

// File upload endpoint - extracts text from PDF/DOCX/TXT
app.post('/api/resume/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { mimetype, originalname, buffer } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      // TXT / MD
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the file. The file may be image-based or empty.' });
    }

    res.json({ text: extractedText, fileName: originalname });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.post('/api/resume/analyze', authMiddleware, async (req, res) => {
  try {
    const { resumeText, fileName } = req.body;
    
    // Use Google Gemini API for analysis (FREE)
    const prompt = `You are an expert resume analyzer. Analyze the given resume and provide a detailed JSON response with the following structure:
{
  "overallScore": <number 0-100>,
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    "summary": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    "experience": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    "education": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    "skills": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] },
    "formatting": { "score": <0-100>, "feedback": "<string>", "suggestions": ["<string>"] }
  },
  "keywords": { "found": ["<string>"], "missing": ["<string>"], "industryRelevance": <0-100> },
  "atsCompatibility": { "score": <0-100>, "issues": ["<string>"] },
  "strengths": ["<string>"],
  "improvements": ["<string>"],
  "careerSuggestions": ["<string>"],
  "summary": "<brief overall summary>"
}
Return ONLY valid JSON, no markdown, no code fences.

Analyze this resume:

${resumeText}`;

    const responseText = await callGemini(prompt);
    const analysis = JSON.parse(responseText.replace(/```json\n?|```\n?/g, '').trim());
    
    // Save to user's resume analyses
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        resumeAnalyses: {
          fileName,
          score: analysis.overallScore,
          analysis,
          createdAt: new Date()
        }
      }
    });

    res.json(analysis);
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

app.get('/api/resume/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('resumeAnalyses');
    res.json(user?.resumeAnalyses || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ─── AI Chat Routes ──────────────────────────────────────
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;

    const user = await User.findById(req.userId).select('profile name');
    const userContext = user?.profile
      ? `User: ${user.name}, Skills: ${user.profile.skills?.join(', ') || 'N/A'}, Experience: ${user.profile.experience || 'N/A'}, Desired Role: ${user.profile.desiredRole || 'N/A'}`
      : `User: ${user?.name || 'Anonymous'}`;

    const chatHistory = (history || []).slice(-10).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');

    const prompt = `You are CareerVista AI, an expert career counselor. You help users with career guidance, job search strategies, interview preparation, skill development, salary negotiation, and professional growth.

Context about the user: ${userContext}

Be supportive, specific, and actionable in your advice. Use a professional but friendly tone. Format responses with markdown for readability.

${chatHistory ? `Previous conversation:\n${chatHistory}\n\n` : ''}User: ${message}`;

    const reply = await callGemini(prompt);

    // Save to chat history
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        chatHistory: [
          { role: 'user', content: message },
          { role: 'assistant', content: reply }
        ]
      }
    });

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

app.get('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('chatHistory');
    res.json(user?.chatHistory || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// ─── Career Roadmap Routes ───────────────────────────────
app.post('/api/roadmap/generate', authMiddleware, async (req, res) => {
  try {
    const { currentRole, targetRole, skills, experience } = req.body;

    const prompt = `You are a career roadmap expert. Generate a detailed career transition roadmap as JSON:
{
  "title": "<Career transition title>",
  "estimatedTime": "<e.g., 6-12 months>",
  "phases": [
    {
      "name": "<Phase name>",
      "duration": "<e.g., 1-2 months>",
      "description": "<Phase description>",
      "tasks": [
        { "title": "<Task>", "description": "<Details>", "resources": ["<Resource>"], "priority": "high|medium|low" }
      ],
      "milestones": ["<Milestone>"],
      "skills": ["<Skill to learn>"]
    }
  ],
  "recommendedCourses": [
    { "name": "<Course>", "platform": "<Platform>", "type": "free|paid", "url": "<URL>" }
  ],
  "certifications": [
    { "name": "<Cert>", "provider": "<Provider>", "importance": "essential|recommended|optional" }
  ],
  "networkingTips": ["<Tip>"],
  "salaryExpectation": { "entry": "<Range>", "mid": "<Range>", "senior": "<Range>" }
}
Return ONLY valid JSON, no markdown, no code fences.

Create a roadmap for: Current Role: ${currentRole || 'N/A'}, Target Role: ${targetRole}, Current Skills: ${skills || 'N/A'}, Experience: ${experience || 'N/A'}`;

    const responseText = await callGemini(prompt);
    const roadmap = JSON.parse(responseText.replace(/```json\n?|```\n?/g, '').trim());
    await User.findByIdAndUpdate(req.userId, { roadmap });
    res.json(roadmap);
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap' });
  }
});

app.get('/api/roadmap', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('roadmap');
    res.json(user?.roadmap || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// ─── Job Routes ──────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, type, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } }
    ];
    if (type) filter.type = type;
    if (category) filter.category = category;

    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Job.countDocuments(filter);
    res.json({ jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/match', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile');
    const skills = user?.profile?.skills || [];
    
    let jobs;
    if (skills.length > 0) {
      jobs = await Job.find({
        isActive: true,
        skills: { $in: skills.map(s => new RegExp(s, 'i')) }
      }).limit(20);
    } else {
      jobs = await Job.find({ isActive: true }).limit(20);
    }
    
    // Calculate match percentage
    const matchedJobs = jobs.map(job => {
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const userSkills = skills.map(s => s.toLowerCase());
      const matched = jobSkills.filter(s => userSkills.some(us => s.includes(us) || us.includes(s)));
      const matchPercent = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
      return { ...job.toObject(), matchPercent };
    });

    matchedJobs.sort((a, b) => b.matchPercent - a.matchPercent);
    res.json(matchedJobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to match jobs' });
  }
});

// Make current user admin
app.post('/api/make-admin', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { role: 'admin' });
    res.json({ message: 'You are now admin. Please log out and log back in.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.post('/api/jobs/:id/save', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const jobId = req.params.id;
    if (user.savedJobs.includes(jobId)) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    res.json({ saved: user.savedJobs.includes(jobId) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.get('/api/jobs/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('savedJobs');
    res.json(user?.savedJobs || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// ─── Admin Routes ────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const usersWithAnalyses = await User.countDocuments({ 'resumeAnalyses.0': { $exists: true } });
    
    const allUsers = await User.find().select('resumeAnalyses');
    const totalResumes = allUsers.reduce((acc, u) => acc + (u.resumeAnalyses?.length || 0), 0);
    res.json({ totalUsers, totalJobs, activeJobs, recentUsers, usersWithAnalyses, totalResumes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── Seed Sample Jobs ────────────────────────────────────
app.post('/api/seed/jobs', async (req, res) => {
  try {
    const sampleJobs = [
      {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: { min: 120000, max: 180000, currency: 'USD' },
        description: 'We are looking for an experienced frontend developer to lead our UI team and build cutting-edge web applications.',
        requirements: ['5+ years experience', 'Strong React/Next.js skills', 'Team leadership experience'],
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
        experience: 'Senior',
        category: 'Engineering',
      },
      {
        title: 'Data Scientist',
        company: 'AI Solutions Ltd.',
        location: 'New York, NY',
        type: 'Full-time',
        salary: { min: 130000, max: 190000, currency: 'USD' },
        description: 'Join our data science team to build ML models and drive data-driven decision making.',
        requirements: ['MS/PhD in Data Science or related field', '3+ years experience', 'Published research is a plus'],
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'NLP'],
        experience: 'Mid-Senior',
        category: 'Data Science',
      },
      {
        title: 'UX/UI Designer',
        company: 'DesignStudio',
        location: 'Remote',
        type: 'Remote',
        salary: { min: 90000, max: 140000, currency: 'USD' },
        description: 'Create beautiful, intuitive user experiences for our SaaS platform.',
        requirements: ['3+ years UX design experience', 'Strong portfolio', 'Figma expertise'],
        skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
        experience: 'Mid',
        category: 'Design',
      },
      {
        title: 'Backend Engineer',
        company: 'CloudNative Systems',
        location: 'Austin, TX',
        type: 'Full-time',
        salary: { min: 110000, max: 170000, currency: 'USD' },
        description: 'Build scalable microservices and APIs for our cloud-native platform.',
        requirements: ['4+ years backend development', 'Cloud platform experience', 'Microservices architecture'],
        skills: ['Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'MongoDB'],
        experience: 'Mid-Senior',
        category: 'Engineering',
      },
      {
        title: 'Product Manager',
        company: 'InnovateTech',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: { min: 130000, max: 180000, currency: 'USD' },
        description: 'Lead product strategy and roadmap for our B2B SaaS products.',
        requirements: ['5+ years PM experience', 'B2B SaaS background', 'Data-driven mindset'],
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Stakeholder Management'],
        experience: 'Senior',
        category: 'Product',
      },
      {
        title: 'DevOps Engineer',
        company: 'ScaleUp Labs',
        location: 'Denver, CO',
        type: 'Full-time',
        salary: { min: 115000, max: 165000, currency: 'USD' },
        description: 'Build and maintain CI/CD pipelines, infrastructure, and monitoring systems.',
        requirements: ['3+ years DevOps experience', 'Infrastructure as Code', 'CI/CD expertise'],
        skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Linux'],
        experience: 'Mid-Senior',
        category: 'Engineering',
      },
      {
        title: 'Marketing Analyst',
        company: 'GrowthMetrics',
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: { min: 70000, max: 100000, currency: 'USD' },
        description: 'Analyze marketing campaigns, optimize spend, and provide data-driven insights.',
        requirements: ['2+ years marketing analytics', 'SQL proficiency', 'Digital marketing knowledge'],
        skills: ['SQL', 'Google Analytics', 'Excel', 'Tableau', 'Digital Marketing', 'A/B Testing'],
        experience: 'Mid',
        category: 'Marketing',
      },
      {
        title: 'Mobile App Developer',
        company: 'AppWorks Studio',
        location: 'Remote',
        type: 'Remote',
        salary: { min: 100000, max: 150000, currency: 'USD' },
        description: 'Develop cross-platform mobile applications using React Native.',
        requirements: ['3+ years mobile development', 'React Native expertise', 'Published apps'],
        skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Firebase'],
        experience: 'Mid',
        category: 'Engineering',
      },
      {
        title: 'Cybersecurity Analyst',
        company: 'SecureShield Corp',
        location: 'Washington, DC',
        type: 'Full-time',
        salary: { min: 95000, max: 145000, currency: 'USD' },
        description: 'Monitor and protect organizational assets from cyber threats.',
        requirements: ['Security certifications (CISSP/CEH)', '3+ years cybersecurity', 'Incident response experience'],
        skills: ['Network Security', 'SIEM', 'Incident Response', 'Penetration Testing', 'Compliance'],
        experience: 'Mid-Senior',
        category: 'Security',
      },
      {
        title: 'Full Stack Developer Intern',
        company: 'StartupHub',
        location: 'Remote',
        type: 'Internship',
        salary: { min: 40000, max: 60000, currency: 'USD' },
        description: 'Learn and grow as a developer in a fast-paced startup environment.',
        requirements: ['Currently pursuing CS degree', 'Basic web development knowledge', 'Eager to learn'],
        skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git'],
        experience: 'Entry',
        category: 'Engineering',
      },
      {
        title: 'AI/ML Engineer',
        company: 'DeepMind Analytics',
        location: 'Boston, MA',
        type: 'Full-time',
        salary: { min: 150000, max: 220000, currency: 'USD' },
        description: 'Design and implement machine learning systems at scale.',
        requirements: ['MS/PhD in CS or related field', '4+ years ML engineering', 'Production ML systems experience'],
        skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Deep Learning', 'Computer Vision'],
        experience: 'Senior',
        category: 'Data Science',
      },
      {
        title: 'Technical Writer',
        company: 'DocuTech',
        location: 'Remote',
        type: 'Contract',
        salary: { min: 60000, max: 90000, currency: 'USD' },
        description: 'Create clear, concise technical documentation for developer tools and APIs.',
        requirements: ['2+ years technical writing', 'API documentation experience', 'Developer background preferred'],
        skills: ['Technical Writing', 'API Documentation', 'Markdown', 'Git', 'Developer Tools'],
        experience: 'Mid',
        category: 'Content',
      },
    ];

    await Job.deleteMany({});
    await Job.insertMany(sampleJobs);
    res.json({ message: `Seeded ${sampleJobs.length} jobs` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed jobs' });
  }
});

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 CareerVista API running on http://localhost:${PORT}`);
});
