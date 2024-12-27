// blog-api.js
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Helper functions
const readFile = (path) => {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const writeFile = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
};

// Paths to database files
const USERS_DB = './database/users.json';
const BLOGS_DB = './database/blog.json';

// 1. REGISTER USER - POST
app.post('/register', (req, res) => {
  const { username, password, fullName, age, email, gender } = req.body;

  if (!username || username.length < 3) return res.status(400).send('Username must be at least 3 characters long.');
  if (!password || password.length < 5) return res.status(400).send('Password must be at least 5 characters long.');
  if (fullName && fullName.length < 10) return res.status(400).send('Full name must be at least 10 characters long.');
  if (!age || age < 10) return res.status(400).send('Age must be at least 10.');
  if (!email) return res.status(400).send('Email is required.');
  if (gender && !['male', 'female'].includes(gender)) return res.status(400).send('Gender must be either male or female.');

  const users = readFile(USERS_DB);
  if (users.find((user) => user.username === username || user.email === email)) {
    return res.status(400).send('Username or email already exists.');
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    fullName,
    age,
    email,
    gender,
  };

  users.push(newUser);
  writeFile(USERS_DB, users);
  res.status(201).send('User registered successfully.');
});

// 2. LOGIN - POST
app.post('/login', (req, res) => {
  const { username, email, password } = req.body;

  const users = readFile(USERS_DB);
  const user = users.find((u) => (u.username === username || u.email === email) && u.password === password);

  if (!user) return res.status(400).send('Invalid username/email or password.');

  res.send(`Welcome ${user.username}!`);
});

// 3. PROFILE
// GET Profile
app.get('/profile/:key', (req, res) => {
  const key = req.params.key;
  const users = readFile(USERS_DB);
  const user = users.find((u) => u.username === key || u.email === key);

  if (!user) return res.status(404).send('User not found.');

  res.json(user);
});

// UPDATE Profile
app.put('/profile/:key', (req, res) => {
  const key = req.params.key;
  const users = readFile(USERS_DB);
  const userIndex = users.findIndex((u) => u.username === key || u.email === key);

  if (userIndex === -1) return res.status(404).send('User not found.');

  users[userIndex] = { ...users[userIndex], ...req.body };
  writeFile(USERS_DB, users);
  res.send('Profile updated successfully.');
});

// DELETE Profile
app.delete('/profile/:key', (req, res) => {
  const key = req.params.key;
  const users = readFile(USERS_DB);
  const userIndex = users.findIndex((u) => u.username === key || u.email === key);

  if (userIndex === -1) return res.status(404).send('User not found.');

  users.splice(userIndex, 1);
  writeFile(USERS_DB, users);
  res.send('Profile deleted successfully.');
});

// 4. BLOG OPERATIONS
// CREATE Blog
app.post('/blog', (req, res) => {
  const { title, slug, content, tags } = req.body;

  if (!title || !slug || !content) return res.status(400).send('Title, slug, and content are required.');

  const blogs = readFile(BLOGS_DB);
  const newBlog = {
    id: blogs.length + 1,
    title,
    slug,
    content,
    tags,
    comments: [],
  };

  blogs.push(newBlog);
  writeFile(BLOGS_DB, blogs);
  res.status(201).send('Blog created successfully.');
});

// READ Blogs
app.get('/blog', (req, res) => {
  const blogs = readFile(BLOGS_DB);
  res.json(blogs);
});

// UPDATE Blog
app.put('/blog/:id', (req, res) => {
  const blogId = parseInt(req.params.id, 10);
  const blogs = readFile(BLOGS_DB);
  const blogIndex = blogs.findIndex((b) => b.id === blogId);

  if (blogIndex === -1) return res.status(404).send('Blog not found.');

  blogs[blogIndex] = { ...blogs[blogIndex], ...req.body };
  writeFile(BLOGS_DB, blogs);
  res.send('Blog updated successfully.');
});

// DELETE Blog
app.delete('/blog/:id', (req, res) => {
  const blogId = parseInt(req.params.id, 10);
  const blogs = readFile(BLOGS_DB);
  const blogIndex = blogs.findIndex((b) => b.id === blogId);

  if (blogIndex === -1) return res.status(404).send('Blog not found.');

  blogs.splice(blogIndex, 1);
  writeFile(BLOGS_DB, blogs);
  res.send('Blog deleted successfully.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
