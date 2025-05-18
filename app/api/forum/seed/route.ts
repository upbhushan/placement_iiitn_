import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Topic } from '@/lib/db/models/forum';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Optional: Add authentication to prevent unauthorized access
const SEED_SECRET = process.env.SEED_SECRET || 'development-seed-key';

// Sample company names for seed data
const companies = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", 
  "Netflix", "Adobe", "Salesforce", "IBM", "Oracle",
  "Intel", "Cisco", "Uber", "Airbnb", "Twitter",
  "Infosys", "TCS", "Wipro", "Accenture", "Deloitte"
];

// Sample interview topics and structures
const interviewTopics = [
  {
    titleTemplate: "My Interview Experience at {company}",
    contentTemplate: `
# Interview Experience at {company}

## Background
I applied for a Software Engineer role at {company} through my college placement cell.

## Interview Process

### Round 1: Online Assessment
- Duration: 90 minutes
- 2 DSA problems (Medium difficulty)
- 15 MCQs on fundamentals

### Round 2: Technical Interview
- Questions on projects in my resume
- System design question: Design a basic URL shortener
- Live coding: Implement a function to check if a linked list has a cycle

### Round 3: Managerial Round
- Behavioral questions
- Situational problem-solving scenarios
- Discussion about company culture and expectations

## Tips for Future Candidates
- Focus on DSA fundamentals
- Practice system design concepts
- Be honest about your experience and knowledge

Overall, it was a great learning experience and I'm excited to join {company}!
`
  },
  {
    titleTemplate: "{company} Placement Process 2025",
    contentTemplate: `
# {company} Placement Process - Batch of 2025

## Application Process
I applied through our college placement cell for the SDE position at {company}.

## Selection Process

### Round 1: Online Test
- 2 coding questions (Array manipulation and Graph problem)
- 20 MCQs covering CS fundamentals
- 45-minute time limit

### Round 2: Technical Interview
- Deep dive into my projects
- Questions about OOP concepts
- Problem solving: Implement a caching mechanism

### Round 3: HR Round
- Discussion about my career goals
- Why {company}?
- Expected salary and location preferences

## Key Takeaways
1. Strong fundamentals are crucial
2. Communication skills matter as much as technical skills
3. Be prepared to explain your projects in detail

I received my offer letter within a week of completing all rounds. The entire process was very professional and organized.
`
  },
  {
    titleTemplate: "Cracked {company} Interview - My Journey",
    contentTemplate: `
# How I Cracked {company}'s Interview Process

## Preparation Strategy
I started preparing 3 months before the placement season:
- Solved 200+ LeetCode problems
- Revised core CS subjects
- Worked on 2 significant projects to showcase skills

## Interview Rounds

### Coding Round
- Platform: HackerRank
- 3 problems of varying difficulty
- Focus on time and space complexity optimization

### Technical Rounds (2 rounds)
- Data structures and algorithms deep dive
- System design question
- Discussion about my GitHub projects
- Questions on database optimization

### Cultural Fit Round
- Team scenarios
- Conflict resolution approach
- Working style preferences

## Tips That Worked For Me
- Practice explaining your thought process out loud
- Research the company's products thoroughly
- Prepare questions to ask the interviewer

The whole process took about 3 weeks from application to offer. {company}'s culture seemed fantastic and I'm looking forward to joining them!
`
  }
];

// Generate a random sample topic with the given user
function generateTopic(user: any) {
  const company = companies[Math.floor(Math.random() * companies.length)];
  
  // Create random date within last 30 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  
  // Select a random template
  const template = interviewTopics[Math.floor(Math.random() * interviewTopics.length)];
  
  // Replace placeholders in title and content
  const title = template.titleTemplate.replace(/\{company\}/g, company);
  const content = template.contentTemplate.replace(/\{company\}/g, company);
  
  return {
    title,
    company,
    content,
    createdBy: {
      _id: user._id.toString(),
      userId: user._id.toString(), // Add this required field
      name: user.name,
      email: user.email,
      image: user.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.name.replace(/\s+/g, '')
    },
    createdAt: date,
    updatedAt: date,
    images: [],
    likes: Math.floor(Math.random() * 25),
    comments: [],
    isActive: true
  };
}

// HTML response for browser access
function generateHtmlResponse(message: string, data?: any, isError?: boolean) {
  const color = isError ? '#f56565' : '#48bb78';
  const title = isError ? 'Error' : 'Success';
  
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Forum Seed Tool</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f8f9fa;
        }
        h1 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        .card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          background-color: ${color};
          color: white;
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
        }
        button {
          background-color: #4299e1;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
        }
        button:hover {
          background-color: #3182ce;
        }
        pre {
          background-color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          font-size: 0.875rem;
        }
        .fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .fields {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <h1>Forum Seeding Tool</h1>
      
      <div class="card">
        <span class="status">${title}</span>
        <p>${message}</p>
        ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
      </div>
      
      <div class="card">
        <form method="get" action="/api/forum/seed">
          <div class="fields">
            <div>
              <label for="count">Number of Topics</label>
              <input type="number" id="count" name="count" value="20" min="1" max="100">
            </div>
            
            <div>
              <label for="secret">Secret Key</label>
              <input type="password" id="secret" name="secret" placeholder="Enter secret key" 
                value="${process.env.NODE_ENV === 'development' ? SEED_SECRET : ''}">
            </div>
          </div>
          
          <button type="submit">Generate Forum Topics</button>
        </form>
      </div>
      
      <div class="card">
        <h3>Available Companies</h3>
        <p>The generated topics will reference these companies:</p>
        <pre>${JSON.stringify(companies, null, 2)}</pre>
      </div>
    </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

export async function GET(request: Request) {
  // Check for a secret to prevent unauthorized seeding
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const count = parseInt(searchParams.get('count') || '20');

  // If no secret is provided, show the form
  if (!secret) {
    return generateHtmlResponse(
      "Welcome to the Forum Seeding Tool. Enter your secret key and choose how many topics to generate.",
    );
  }
  
  // Check if secret matches
  if (secret !== SEED_SECRET) {
    return generateHtmlResponse(
      "Invalid secret key. Access denied.",
      null,
      true
    );
  }
  
  try {
    console.log('🌱 Starting forum topics seeding...');
    await connectToDatabase();
    console.log('📡 Connected to database');

    // Get existing students to use as authors
    const { Student } = await import('@/lib/db/models/student');
    const students = await Student.find({ accountStatus: 'active' }).lean();
    
    if (students.length === 0) {
      return generateHtmlResponse(
        "No active students found to use as authors. Please seed student data first.",
        null,
        true
      );
    }

    // Clear existing forum topics
    console.log('🧹 Clearing existing forum topics...');
    await Topic.deleteMany({});

    // Seed forum topics
    console.log('📝 Seeding forum topics...');
    const topics = [];
    
    // Generate topics distributed among all students
    for (let i = 0; i < count; i++) {
      const user = students[i % students.length]; // Distribute topics among available students
      topics.push(generateTopic(user));
    }

    const result = await Topic.insertMany(topics);
    
    // Invalidate caches
    try {
      // Clear forum related caches
      await redis.del("forum:companies:stats");
      const topicCacheKeys = await redis.keys("topics:*");
      if (topicCacheKeys.length > 0) {
        for (const key of topicCacheKeys) {
          await redis.del(key);
        }
      }
      console.log("🔄 Cache invalidated after seeding topics");
    } catch (cacheError) {
      console.warn("⚠️ Cache invalidation error:", cacheError);
    }

    console.log('✅ Forum topics seeding completed successfully');
    
    const resultData = {
      topics: result.length,
      companies: [...new Set(topics.map(t => t.company))].length, // Count unique companies
      authors: [...new Set(topics.map(t => t.createdBy._id))].length // Count unique authors
    };
    
    return generateHtmlResponse(
      `Successfully seeded ${result.length} forum topics.`,
      resultData
    );
    
  } catch (error) {
    console.error('❌ Error seeding forum topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return generateHtmlResponse(
      "Failed to seed forum topics: " + errorMessage,
      null,
      true
    );
  }
}