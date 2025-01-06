const http = require('http');
const fs = require('fs');
const url = require('url');

const usersDataPath = './users.json';
const blogDataPath = './blog.json';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url);
  const method = req.method;

  if (parsedUrl.pathname === '/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { username, password, fullName, age, email, gender } = JSON.parse(body);

      if (username.length < 3 || password.length < 5 || age < 10 || !email.includes('@')) {
        return res.end(JSON.stringify({ message: 'Invalid data' }));
      }

      const users = JSON.parse(fs.readFileSync(usersDataPath));
      const userExists = users.find(user => user.username === username || user.email === email);
      if (userExists) {
        return res.end(JSON.stringify({ message: 'User already exists' }));
      }

      const newUser = { id: users.length + 1, username, password, fullName, age, email, gender };
      users.push(newUser);

      fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));

      res.statusCode = 201;
      res.end(JSON.stringify(newUser));
    });
  }

  else if (parsedUrl.pathname === '/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { username, password } = JSON.parse(body);
      const users = JSON.parse(fs.readFileSync(usersDataPath));

      const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
      if (!user) {
        return res.end(JSON.stringify({ message: 'Invalid credentials' }));
      }

      res.end(JSON.stringify({ message: 'Login successful' }));
    });
  }

  else if (parsedUrl.pathname.startsWith('/profile/') && method === 'GET') {
    const identifier = parsedUrl.pathname.split('/')[2];
    const users = JSON.parse(fs.readFileSync(usersDataPath));

    const user = users.find(u => u.username === identifier || u.email === identifier);
    if (!user) {
      return res.end(JSON.stringify({ message: 'User not found' }));
    }

    res.end(JSON.stringify(user));
  }

  else if (parsedUrl.pathname.startsWith('/profile/') && method === 'PUT') {
    const identifier = parsedUrl.pathname.split('/')[2];
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { fullName, age, gender } = JSON.parse(body);
      const users = JSON.parse(fs.readFileSync(usersDataPath));

      const user = users.find(u => u.username === identifier || u.email === identifier);
      if (!user) {
        return res.end(JSON.stringify({ message: 'User not found' }));
      }

      user.fullName = fullName || user.fullName;
      user.age = age || user.age;
      user.gender = gender || user.gender;

      fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));

      res.end(JSON.stringify(user));
    });
  }

  else if (parsedUrl.pathname.startsWith('/profile/') && method === 'DELETE') {
    const identifier = parsedUrl.pathname.split('/')[2];
    const users = JSON.parse(fs.readFileSync(usersDataPath));

    const userIndex = users.findIndex(u => u.username === identifier || u.email === identifier);
    if (userIndex === -1) {
      return res.end(JSON.stringify({ message: 'User not found' }));
    }

    users.splice(userIndex, 1);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));

    res.end(JSON.stringify({ message: 'User deleted' }));
  }

  else if (parsedUrl.pathname === '/blog' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { title, slug, content, tags } = JSON.parse(body);

      const blogs = JSON.parse(fs.readFileSync(blogDataPath));
      const newBlog = { id: blogs.length + 1, title, slug, content, tags, comments: [] };
      blogs.push(newBlog);

      fs.writeFileSync(blogDataPath, JSON.stringify(blogs, null, 2));

      res.statusCode = 201;
      res.end(JSON.stringify(newBlog));
    });
  }

  else if (parsedUrl.pathname === '/blog' && method === 'GET') {
    const blogs = JSON.parse(fs.readFileSync(blogDataPath));
    res.end(JSON.stringify(blogs));
  }

  else if (parsedUrl.pathname.startsWith('/blog/') && method === 'PUT') {
    const blogId = parsedUrl.pathname.split('/')[2];
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const { title, slug, content, tags } = JSON.parse(body);
      const blogs = JSON.parse(fs.readFileSync(blogDataPath));

      const blog = blogs.find(b => b.id === parseInt(blogId));
      if (!blog) {
        return res.end(JSON.stringify({ message: 'Blog not found' }));
      }

      blog.title = title || blog.title;
      blog.slug = slug || blog.slug;
      blog.content = content || blog.content;
      blog.tags = tags || blog.tags;

      fs.writeFileSync(blogDataPath, JSON.stringify(blogs, null, 2));

      res.end(JSON.stringify(blog));
    });
  }

  else if (parsedUrl.pathname.startsWith('/blog/') && method === 'DELETE') {
    const blogId = parsedUrl.pathname.split('/')[2];
    const blogs = JSON.parse(fs.readFileSync(blogDataPath));

    const blogIndex = blogs.findIndex(b => b.id === parseInt(blogId));
    if (blogIndex === -1) {
      return res.end(JSON.stringify({ message: 'Blog not found' }));
    }

    blogs.splice(blogIndex, 1);
    fs.writeFileSync(blogDataPath, JSON.stringify(blogs, null, 2));

    res.end(JSON.stringify({ message: 'Blog deleted' }));
  } 

  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
