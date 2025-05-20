Placement Portal - IIIT Nagpur
This is a web-based placement management portal built for IIIT Nagpur to streamline placement activities for students and administrators. The application supports features like dynamic form creation, student profile management, forum discussions, file uploads, analytics, and an integrated chatbot for user assistance. It is built using Next.js and bootstrapped with create-next-app.
Table of Contents

Features
Tech Stack
Project Structure
Installation
Environment Variables
Accepted Excel File Formats
Active URLs and API Endpoints
Test Credentials
Contributing
License

Features

Authentication: Secure login, logout, and password reset using NextAuth.js.
Admin Dashboard: Manage student data, create/edit forms, view analytics, and perform bulk uploads.
Student Portal: View opportunities, submit forms, manage profiles, and engage in forum discussions.
Dynamic Form Builder: Create and manage forms with customizable fields and validation using Zod.
Forum: Discussion platform with topic creation, comments, and voting.
File Uploads: Supports Cloudinary for uploading student photos and documents.
Analytics: Data insights for administrators and students, including placement statistics.
Chatbot: Integrated AI-powered chatbot for real-time user assistance.
Responsive Design: Built with Tailwind CSS and optimized with next/font (Geist font family).
Excel Support: Bulk upload student data via .xlsx or .xls files with predefined fields.

Tech Stack

Framework: Next.js (App Router)
Language: TypeScript
Styling: Tailwind CSS, PostCSS
Database: MongoDB
Authentication: NextAuth.js
File Storage: Cloudinary
Caching: Redis
Validation: Zod
Linting: ESLint
Fonts: Geist (via next/font)
Other: Custom React hooks, MongoDB models, and reusable UI components

Project Structure
prashantsaxe-placement_iiitn_/
├── README.md                   # Project documentation
├── app/                        # Next.js app directory (pages and routes)
│   ├── (auth)/                 # Authentication pages (login, forgot-password, check-email)
│   ├── (public)/               # Public pages (about, contact)
│   ├── admin/                  # Admin dashboard, forms, analytics, bulk uploads
│   ├── api/                    # API routes for forms, students, forum, auth, etc.
│   ├── dashboard/              # General dashboard
│   ├── forms/                  # Public form viewing and submission
│   ├── opportunities/          # Job and internship listings
│   ├── settings/               # User settings
│   ├── student/                # Student dashboard, profile, forum, submissions
│   └── unauthorized/           # Unauthorized access page
├── components/                 # Reusable React components
│   ├── admin/                  # Admin-specific components (form builder, student table)
│   ├── auth/                   # Login and password reset forms
│   ├── chatbot/                # AI-powered chatbot component
│   ├── dashboard/              # Dashboard UI components
│   ├── forms/                  # Form rendering components
│   ├── layout/                 # Layout components (navbar, sidebar, footer)
│   ├── shared/                 # Shared utilities (error messages, loading spinner)
│   └── ui/                     # UI component library (buttons, tables, modals, etc.)
├── hooks/                      # Custom React hooks (e.g., useMediaQuery)
├── lib/                        # Utilities, database config, and validators
│   ├── db/                     # MongoDB client and models (admin, student, forms)
│   ├── hooks/                  # Custom hooks (e.g., focus ring fix)
│   ├── store/                  # State management (form builder, user store)
│   ├── utils/                  # Utility functions (e.g., schema generation)
│   └── validators/             # Zod validation schemas
├── public/                     # Static assets and backup Excel files
├── trials/                     # Experimental components (e.g., settings page)
├── types/                      # TypeScript type definitions
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies
└── ...                         # ESLint, PostCSS, middleware, etc.

Installation

Clone the repository:
git clone https://github.com/prashantsaxe/placement_iiitn.git
cd prashantsaxe-placement_iiitn_


Install dependencies:
npm install


Set up environment variables:Create a .env.local file in the root directory and configure the variables (see Environment Variables).

Run the development server:
npm run dev

Open http://localhost:3000 to view the application.

Edit pages:Start by modifying app/page.tsx. The page auto-updates as you edit.


Environment Variables
Create a .env.local file with the following variables:
MONGODB_URI=<your-mongodb-uri>
NEXTAUTH_SECRET=<your-nextauth-secret>
CLOUDINARY_URL=<your-cloudinary-url>
REDIS_URL=<your-redis-url>
EXCEL_FILE_EXTENSIONS=.xlsx,.xls
ACCEPTED_FILE_TYPES=xlsx,xls

Accepted Excel File Formats
The system supports bulk uploads via Excel files with the following requirements:

File Types: .xlsx (Excel Workbook), .xls (Excel 97-2003 Workbook)
File Naming: Use descriptive names (e.g., student_data.xlsx). Avoid special characters; use - or _ for spaces.
Required Fields:


Field Name
Description
Required/Optional



Full Name
Student's full name
Required


Email Address
Student's email address
Required


Password
Password for student account
Required


Branch
Student's branch (e.g., CSE, ECE)
Required


Phone Number
Student's contact number
Required


CGPA
Student's CGPA (e.g., 8.5)
Required


Active Backlogs
Number of active backlogs
Required


Gender
Male, Female, or Other
Required


Hometown
Student's hometown
Required


Date of Birth
Format: YYYY-MM-DD
Required


10th Marks
10th grade percentage
Required


12th Marks
12th grade percentage
Required


Placed
Placement status (true/false)
Required


Account Status
Active, Inactive, or Blocked
Required


Photo URL
URL to student's photo
Optional


LinkedIn Profile
LinkedIn profile URL
Optional


GitHub Profile
GitHub profile URL
Optional


Twitter Profile
Twitter profile URL
Optional


Portfolio URL
Personal portfolio URL
Optional


Package
Salary offered (in INR)
Optional


Placement Type
Intern, FTE, or Both
Optional


Company
Company offering placement
Optional


Offer Date
Offer date (YYYY-MM-DD)
Optional




Active URLs and API Endpoints
Frontend Pages

Admin Section:
/admin: Admin dashboard.
/admin/forms: List all forms.
/admin/forms/create: Create a new form.
/admin/forms/edit/[formId]: Edit a specific form (e.g., /admin/forms/edit/123xyz).
/admin/forms/[formId]/responses: View responses for a form (e.g., /admin/forms/123xyz/responses).
/admin/bulk-upload: Upload student data via Excel.
/admin/analytics: View placement analytics.


Student Section:
/student/dashboard: Student dashboard with forms and submission status.
/forms/[formId]: Public form for submission (e.g., /forms/abc789).
/student/forms/[formId]/submission: View student's submission (e.g., /student/forms/abc789/submission).
/student/profile: Manage student profile.
/student/forum: Forum discussion page.
/student/forum/new: Create a new forum topic.
/student/forum/[id]: View a specific forum topic.


Public Pages:
/about: About page.
/contact: Contact page.


Authentication:
/auth/signin: Login page.
/auth/signout: Logout.
/auth/forgot-password: Password reset page.
/auth/check-email: Email verification page.



API Endpoints

Admin Form Management:
GET /api/admin/forms: List all forms.
POST /api/admin/forms: Create a form.
GET /api/admin/forms/[formId]: Get form details.
PUT /api/admin/forms/[formId]: Update a form.
DELETE /api/admin/forms/[formId]: Delete a form.
GET /api/admin/forms/[formId]/responses: Get form responses.
GET /api/admin/forms/[formId]/export: Export responses to Excel.


Student Form Interaction:
GET /api/forms/[formId]: Get form structure for submission.
POST /api/forms/[formId]/responses: Submit a form response.
GET /api/student/forms: List forms for the student.
GET /api/student/forms/[formId]/submission: Get student's submission.


Student Data:
GET /api/student/me/details: Get student details.
GET /api/student/profile: Get student profile.
GET /api/admin/students: List all students (admin only).
GET /api/admin/students/[id]: Get student by ID (admin only).


Forum:
GET /api/forum/topics: List forum topics.
POST /api/forum/topics: Create a topic.
GET /api/forum/topics/[id]: Get topic details.
POST /api/forum/topics/[id]/comments: Add a comment.
POST /api/forum/topics/[id]/vote: Vote on a topic.


File Uploads:
POST /api/upload: Upload files to Cloudinary.


Authentication:
GET/POST /api/auth/[...nextauth]: NextAuth.js routes for session management and authentication.



Test Credentials
Use the following credentials for testing:

Admin:
Email: akashkarenight@gmail.com
Password: password123


Student:
Email: bt21cse001@iiitn.ac.in
Password: Password123



Note: These are for testing purposes only. Ensure secure credentials in production.
Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Ensure code adheres to ESLint and TypeScript standards. Test thoroughly before submitting.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Learn More

Next.js Documentation
Learn Next.js
Vercel Deployment
Next.js GitHub

