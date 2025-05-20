Below is the reformatted and improved README in Markdown language for the `prashantsaxe-placement_iiitn_` project, based on the provided content. I've enhanced the structure, improved readability, and ensured consistency while preserving all key details, including features, tech stack, project structure, installation instructions, environment variables, Excel file formats, URLs, API endpoints, test credentials, and contribution guidelines. The content is wrapped in an `<xaiArtifact>` tag with the same `artifact_id` as the previous README to indicate it's an updated version, as per the instructions.


# Placement Portal - IIIT Nagpur

This is a web-based placement management portal developed for IIIT Nagpur to streamline placement activities for students and administrators. Built with **Next.js** and bootstrapped using `create-next-app`, the portal offers dynamic form creation, student profile management, forum discussions, file uploads, analytics, and an integrated AI-powered chatbot for real-time user assistance.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Accepted Excel File Formats](#accepted-excel-file-formats)
- [Active URLs and API Endpoints](#active-urls-and-api-endpoints)
- [Test Credentials](#test-credentials)
- [Contributing](#contributing)
- [License](#license)
- [Learn More](#learn-more)

## Features
- **Authentication**: Secure login, logout, and password reset using NextAuth.js.
- **Admin Dashboard**: Tools to manage student data, create/edit forms, view analytics, and handle bulk uploads.
- **Student Portal**: Allows students to view opportunities, submit forms, manage profiles, and participate in forums.
- **Dynamic Form Builder**: Create and manage customizable forms with Zod-based validation.
- **Forum**: Discussion platform supporting topic creation, comments, and voting.
- **File Uploads**: Cloudinary integration for uploading student photos and documents.
- **Analytics**: Data-driven insights for placement statistics (admin and student views).
- **Chatbot**: AI-powered chatbot for real-time user support.
- **Responsive Design**: Built with Tailwind CSS and optimized with `next/font` (Geist font family).
- **Excel Support**: Bulk upload student data via `.xlsx` or `.xls` files with predefined fields.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Caching**: Redis
- **Validation**: Zod
- **Linting**: ESLint
- **Fonts**: Geist (via `next/font`)
- **Other**: Custom React hooks, MongoDB models, reusable UI components

## Project Structure
```
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
```

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/prashantsaxe/placement_iiitn.git
   cd prashantsaxe-placement_iiitn_
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory and configure the variables (see [Environment Variables](#environment-variables)).

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Edit Pages**:
   Modify `app/page.tsx` to start editing. The page auto-updates as you save changes.

## Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```env
MONGODB_URI=<your-mongodb-uri>
NEXTAUTH_SECRET=<your-nextauth-secret>
CLOUDINARY_URL=<your-cloudinary-url>
REDIS_URL=<your-redis-url>
EXCEL_FILE_EXTENSIONS=.xlsx,.xls
ACCEPTED_FILE_TYPES=xlsx,xls
```

## Accepted Excel File Formats
The system supports bulk uploads via Excel files with the following requirements:
- **File Types**: `.xlsx` (Excel Workbook), `.xls` (Excel 97-2003 Workbook)
- **File Naming**: Use descriptive names (e.g., `student_data.xlsx`). Avoid special characters; use `-` or `_` instead of spaces.
- **Fields**:
  | Field Name        | Description                              | Required/Optional |
  |-------------------|------------------------------------------|-------------------|
  | Full Name         | Student's full name                     | Required          |
  | Email Address     | Student's email address                 | Required          |
  | Password          | Password for student account            | Required          |
  | Branch            | Student's branch (e.g., CSE, ECE)       | Required          |
  | Phone Number      | Student's contact number                | Required          |
  | CGPA              | Student's CGPA (e.g., 8.5)             | Required          |
  | Active Backlogs   | Number of active backlogs              | Required          |
  | Gender            | Male, Female, or Other                 | Required          |
  | Hometown          | Student's hometown                     | Required          |
  | Date of Birth     | Format: YYYY-MM-DD                     | Required          |
  | 10th Marks        | 10th grade percentage                  | Required          |
  | 12th Marks        | 12th grade percentage                  | Required          |
  | Placed            | Placement status (true/false)          | Required          |
  | Account Status    | Active, Inactive, or Blocked            | Required          |
  | Photo URL         | URL to student's photo                 | Optional          |
  | LinkedIn Profile  | LinkedIn profile URL                   | Optional          |
  | GitHub Profile    | GitHub profile URL                     | Optional          |
  | Twitter Profile   | Twitter profile URL                    | Optional          |
  | Portfolio URL     | Personal portfolio URL                 | Optional          |
  | Package           | Salary offered (in INR)                | Optional          |
  | Placement Type    | Intern, FTE, or Both                   | Optional          |
  | Company           | Company offering placement             | Optional          |
  | Offer Date        | Offer date (YYYY-MM-DD)                | Optional          |

## Active URLs and API Endpoints
### Frontend Pages
- **Admin Section**:
  - `/admin`: Admin dashboard.
  - `/admin/forms`: List all forms.
  - `/admin/forms/create`: Create a new form.
  - `/admin/forms/edit/[formId]`: Edit a specific form (e.g., `/admin/forms/edit/123xyz`).
  - `/admin/forms/[formId]/responses`: View responses for a form (e.g., `/admin/forms/123xyz/responses`).
  - `/admin/bulk-upload`: Upload student data via Excel.
  - `/admin/analytics`: View placement analytics.
- **Student Section**:
  - `/student/dashboard`: Student dashboard with forms and submission status.
  - `/forms/[formId]`: Public form for submission (e.g., `/forms/abc789`).
  - `/student/forms/[formId]/submission`: View student's submission (e.g., `/student/forms/abc789/submission`).
  - `/student/profile`: Manage student profile.
  - `/student/forum`: Forum discussion page.
  - `/student/forum/new`: Create a new forum topic.
  - `/student/forum/[id]`: View a specific forum topic.
- **Public Pages**:
  - `/about`: About page.
  - `/contact`: Contact page.
- **Authentication**:
  - `/auth/signin`: Login page.
  - `/auth/signout`: Logout.
  - `/auth/forgot-password`: Password reset page.
  - `/auth/check-email`: Email verification page.

### API Endpoints
- **Admin Form Management**:
  - `GET /api/admin/forms`: List all forms.
  - `POST /api/admin/forms`: Create a form.
  - `GET /api/admin/forms/[formId]`: Get form details.
  - `PUT /api/admin/forms/[formId]`: Update a form.
  - `DELETE /api/admin/forms/[formId]`: Delete a form.
  - `GET /api/admin/forms/[formId]/responses`: Get form responses.
  - `GET /api/admin/forms/[formId]/export`: Export responses to Excel.
- **Student Form Interaction**:
  - `GET /api/forms/[formId]`: Get form structure for submission.
  - `POST /api/forms/[formId]/responses`: Submit a form response.
  - `GET /api/student/forms`: List forms for the student.
  - `GET /api/student/forms/[formId]/submission`: Get student's submission.
- **Student Data**:
  - `GET /api/student/me/details`: Get student details.
  - `GET /api/student/profile`: Get student profile.
  - `GET /api/admin/students`: List all students (admin only).
  - `GET /api/admin/students/[id]`: Get student by ID (admin only).
- **Forum**:
  - `GET /api/forum/topics`: List forum topics.
  - `POST /api/forum/topics`: Create a topic.
  - `GET /api/forum/topics/[id]`: Get topic details.
  - `POST /api/forum/topics/[id]/comments`: Add a comment.
  - `POST /api/forum/topics/[id]/vote`: Vote on a topic.
- **File Uploads**:
  - `POST /api/upload`: Upload files to Cloudinary.
- **Authentication**:
  - `GET/POST /api/auth/[...nextauth]`: NextAuth.js routes for session management and authentication.

## Test Credentials
Use the following credentials for testing:
- **Admin**:
  - **Email**: `akashkarenight@gmail.com`
  - **Password**: `password123`
- **Student**:
  - **Email**: `bt21cse001@iiitn.ac.in`
  - **Password**: `Password123`

**Note**: These credentials are for testing only. Use secure credentials in production.

## Contributing
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add your feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.

Ensure code adheres to ESLint and TypeScript standards. Test thoroughly before submitting.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and APIs.
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial.
- [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) - Deploy your app with Vercel.
- [Next.js GitHub](https://github.com/vercel/next.js) - Contribute or provide feedback.


### Notes
- The README is formatted in Markdown (`.md`) and includes all sections from the provided content, with improvements in clarity, formatting, and structure.
- The `<xaiArtifact>` tag uses the same `artifact_id` (`ccbcaa19-762c-43e1-9453-c9a98e89ab6a`) as the previous README to indicate it's an updated version.
- The content is concise yet comprehensive, covering all required details (features, tech stack, project structure, installation, environment variables, Excel formats, URLs/endpoints, test credentials, contributing, and learning resources).
- The table for Excel file formats is properly formatted in Markdown for readability.
- Code blocks and links are formatted correctly for GitHub rendering.

Copy the content within the `<xaiArtifact>` tag (excluding the tag itself) and paste it into your GitHub `README.md` file. Let me know if you need further refinements or additional sections!
