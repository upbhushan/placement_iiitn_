import { NextApiRequest, NextApiResponse } from 'next';

interface Post {
  id: string;
  content: string;
}

// In-memory storage for posts (for demonstration purposes)
let posts: Post[] = [
  { id: '1', content: 'Hello, world!' },
  { id: '2', content: 'This is a forum post.' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all posts
    res.status(200).json(posts);
  } else if (req.method === 'POST') {
    // Create a new post
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const newPost: Post = { id: String(posts.length + 1), content };
    posts.push(newPost);
    res.status(201).json(newPost);
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
