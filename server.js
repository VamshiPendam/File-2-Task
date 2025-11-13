const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse'); // Make sure to use pdf-parse@1.1.1!
const mammoth = require('mammoth');

const port = 2005;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '191261934491-l3rrbrl8cqljj6cmvikfmie1il2frbh4.apps.googleusercontent.com';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC and DOCX files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/file2task')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// New user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  standard: String,
  password: String,
  googleId: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});
const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  originalContent: String,
  tasks: [{
    question: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// File Upload and Processing Route
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let content = '';
    const filePath = req.file.path;

    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      content = fs.readFileSync(filePath, 'utf8');
    } else if (req.file.mimetype.includes('word')) {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    }

    const tasks = generateTasks(content);

    const taskDoc = new Task({
      userId: req.user.userId,
      fileName: req.file.originalname,
      originalContent: content,
      tasks: tasks
    });

    await taskDoc.save();
    fs.unlinkSync(filePath);
    res.json({
      message: 'File processed successfully',
      taskId: taskDoc._id,
      tasks: tasks
    });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

function generateTasks(content) {
  const tasks = [];
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
  paragraphs.forEach(paragraph => {
    const questions = generateQuestionsFromParagraph(paragraph);
    tasks.push(...questions);
  });
  return tasks;
}

function generateQuestionsFromParagraph(paragraph) {
  const questions = [];
  if (paragraph.includes('define') || paragraph.includes('definition')) {
    questions.push({
      question: `Define the concept: "${paragraph.substring(0, 100)}..."`,
    });
  }
  if (paragraph.includes('example') || paragraph.includes('instance')) {
    questions.push({
      question: `Provide an example related to: "${paragraph.substring(0, 100)}..."`,
    });
  }
  if (paragraph.includes('compare') || paragraph.includes('difference')) {
    questions.push({
      question: `Compare and contrast the elements in: "${paragraph.substring(0, 100)}..."`,
    });
  }
  questions.push({
    question: `Explain the main idea in: "${paragraph.substring(0, 100)}..."`,
  });
  return questions;
}

// Get all tasks for user
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId }).sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving tasks' });
  }
});

// Get a single task document by id
app.get('/api/task/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (String(task.userId) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task by id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration Route
app.post('/register', async (req, res) => {
  const { name, email, gender, standard, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'exists' });
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      gender,
      standard,
      password: hashedPwd,
    });
    await user.save();
    res.status(201).json({ message: 'registered' });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Serve the authentication page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Authentication', 'athen.html'));
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!user.password) {
      return res.status(401).json({ error: 'Please use Google Sign-In' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, redirect: '/LandingPages/index.html' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sign-In verification and login
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        createdAt: new Date()
      });
    } else {
      user.googleId = payload.sub;
    }
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, redirect: '/LandingPages/index.html' });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Get current user profile
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a task item as complete
app.post('/tasks/mark', authenticateToken, async (req, res) => {
  const { taskId, idx } = req.body;
  if (!taskId || typeof idx !== 'number') return res.status(400).json({ error: 'Missing parameters' });
  try {
    const taskDoc = await Task.findById(taskId);
    if (!taskDoc) return res.status(404).json({ error: 'Task not found' });
    if (String(taskDoc.userId) !== String(req.user.userId)) return res.status(403).json({ error: 'Forbidden' });
    if (!taskDoc.tasks[idx]) return res.status(400).json({ error: 'Invalid task index' });
    taskDoc.tasks[idx].status = 'completed';
    await taskDoc.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log("server started on port", port);
});






// ================== AI Chat Integration (Gemini) ==================
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build chat context from user history
    let conversationContext = 'You are a helpful and friendly AI assistant.\n\n';

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user') {
          conversationContext += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversationContext += `Assistant: ${msg.content}\n`;
        }
      }
    }

    conversationContext += `User: ${message}\nAssistant:`;

    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: conversationContext }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const aiResponse = result.response.text();

    res.json({
      response: aiResponse,
      usage: {
        total_tokens: result.response.usageMetadata?.totalTokenCount || 0,
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});
// ================================================================

