import { type ProjectTemplateConfig } from '@/app/types/Playground';

export const PROJECT_TEMPLATES: Record<string, ProjectTemplateConfig> = {
  none: {
    name: '단일 파일',
    description: '기본 언어 선택',
    files: [],
  },
  'react-spring': {
    name: 'React + Spring Boot',
    description: '풀스택 웹 애플리케이션',
    files: [
      {
        name: 'App.jsx',
        language: 'javascript',
        content: `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 더미 데이터 로드
    setLoading(true);
    setTimeout(() => {
      setData([
        { id: 1, name: 'Item 1', description: 'First item' },
        { id: 2, name: 'Item 2', description: 'Second item' },
        { id: 3, name: 'Item 3', description: 'Third item' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="App">
      <h1>React + Spring Boot</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;`,
      },
      {
        name: 'DataController.java',
        language: 'java',
        content: `package com.example.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000" )
public class DataController {

  @GetMapping("/data")
  public List<String> getData() {
    return Arrays.asList(
      "Item 1",
      "Item 2",
      "Item 3"
    );
  }

  @PostMapping("/data")
  public String createData(@RequestBody String data) {
    return "Data created: " + data;
  }
}`,
      },
    ],
  },
  'nodejs-react': {
    name: 'Node.js + React',
    description: 'Express + React 풀스택',
    files: [
      {
        name: 'server.js',
        language: 'javascript',
        content: `const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 더미 데이터
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  res.status(201).json({ message: 'User created', user: newUser });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      },
      {
        name: 'UserList.jsx',
        language: 'javascript',
        content: `import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 더미 데이터
    setUsers([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;`,
      },
    ],
  },
  'nextjs-api': {
    name: 'Next.js + API Routes',
    description: '풀스택 Next.js 애플리케이션',
    files: [
      {
        name: 'pages/api/hello.js',
        language: 'javascript',
        content: `export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Hello from Next.js API',
      timestamp: new Date().toISOString(),
      data: [
        { id: 1, text: 'Sample 1' },
        { id: 2, text: 'Sample 2' },
      ],
    });
  } else if (req.method === 'POST') {
    const { name } = req.body;
    res.status(201).json({
      message: \`Hello, \${name}!\`,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}`,
      },
      {
        name: 'pages/index.jsx',
        language: 'javascript',
        content: `import { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hello', { method: 'GET' });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Next.js Full Stack</h1>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}`,
      },
    ],
  },
  'flask-react': {
    name: 'Flask + React',
    description: 'Python Flask 백엔드 + React 프론트엔드',
    files: [
      {
        name: 'app.py',
        language: 'python',
        content: `from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 더미 데이터
items = [
    {'id': 1, 'name': 'Item 1'},
    {'id': 2, 'name': 'Item 2'},
    {'id': 3, 'name': 'Item 3'},
]

@app.route('/api/items', methods=['GET'])
def get_items():
    return jsonify(items)

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.json
    return jsonify({'message': 'Item created', 'item': data}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)`,
      },
      {
        name: 'ItemList.jsx',
        language: 'javascript',
        content: `import React, { useState, useEffect } from 'react';

function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 더미 데이터
    setItems([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ]);
  }, []);

  return (
    <div>
      <h2>Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;`,
      },
    ],
  },
};
