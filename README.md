# 🛡️ SafeScroll

### A safer scroll starts with a smarter filter.

SafeScroll is an **AI-assisted child content safety platform** designed to help parents understand potentially harmful online content before deciding whether their child should access it.

Instead of trying to directly block or control third-party social media platforms, SafeScroll provides a **content-analysis and parental decision layer**. Parents can create child profiles, configure safety policies, submit content for analysis, review AI-generated safety recommendations, and make the final decision.

---

## 🚀 Live Demo

**Production:**
https://kidssafescroll.vercel.app/

**GitHub Repository:**
https://github.com/Anjalivk3/kidssafescroll

---

## 🎯 Problem Statement

Children increasingly consume short-form videos and online content through social media platforms.

Parents may not always have enough context about a video before allowing their child to watch it. Content can contain:

* Violence or fighting
* Profanity
* Adult content
* Dangerous behavior
* Drugs
* Hate-related content
* Disturbing material
* Self-harm related content

SafeScroll addresses this problem by providing a simple workflow:

```text
Parent
   ↓
Create Child Profile
   ↓
Configure Safety Policy
   ↓
Submit Content
   ↓
AI Safety Analysis
   ↓
Risk Classification
   ↓
AI Recommendation
   ↓
Parent Makes Final Decision
```

---

# ✨ Key Features

## 👨‍👩‍👧 Parent Authentication

Parents can:

* Register an account
* Login securely
* Logout
* Maintain an authenticated session

Authentication is handled using a secure **HTTP-only cookie**, rather than relying on a user ID supplied by the client.

---

## 👶 Child Profiles

Parents can create and manage multiple child profiles.

Each child profile contains information such as:

* Name
* Age
* Parent ownership
* Safety policy
* Content history

Available operations:

* Create child
* View children
* Update child
* Delete child

Parents can only access their own child profiles.

---

## 🛡️ Safety Policies

Each child can have an individual content safety policy.

Parents can configure restricted categories such as:

```text
VIOLENCE
PROFANITY
ADULT_CONTENT
DANGEROUS_BEHAVIOR
DRUGS
HATE_CONTENT
DISTURBING_CONTENT
SELF_HARM
```

This allows the application to evaluate content according to the selected safety preferences.

---

# 🤖 AI-Powered Content Analysis

SafeScroll uses an AI analysis layer to evaluate submitted content.

A submission can contain:

* Video/Reel URL
* Title
* Description
* Transcript
* Optional image URL

The server sends the available content information to the AI analysis layer.

The AI returns structured safety information.

### Risk Levels

```text
SAFE
LOW
MEDIUM
HIGH
```

### Content Categories

```text
VIOLENCE
PROFANITY
ADULT_CONTENT
DANGEROUS_BEHAVIOR
DRUGS
HATE_CONTENT
DISTURBING_CONTENT
SELF_HARM
NONE
```

### AI Recommendation

```text
ALLOW
REVIEW
RESTRICT
```

The AI recommendation is **not treated as the final parental decision**.

The parent remains responsible for making the final decision.

---

# ⚖️ Parent Decision System

After reviewing the AI analysis, the parent can make a final decision:

```text
ALLOWED
REVIEW
RESTRICTED
```

This creates a clear separation between:

```text
AI Recommendation
        ↓
Parent Review
        ↓
Final Parent Decision
```

This design prevents the AI layer from automatically making every parenting decision.

---

# 📊 Dashboard & History

The dashboard provides parents with an overview of their children's content activity.

Parents can review:

* Child profiles
* Submitted content
* Risk levels
* Detected categories
* AI recommendations
* Final parental decisions
* Previous content analysis

History can be filtered based on relevant safety information such as child and risk/recommendation status.

---

# 🔐 Security

Security was considered throughout the application.

### HTTP-Only Authentication Cookie

Authentication information is stored in a secure HTTP-only cookie.

This helps prevent client-side JavaScript from directly accessing the authentication cookie.

### Server-Side User Identification

Protected APIs do not trust a `userId` sent by the client.

Instead:

```text
Request
   ↓
Authentication Cookie
   ↓
Server Authentication
   ↓
Authenticated Parent
   ↓
Authorized Resource
```

This prevents a client from simply changing a user ID to access another parent's data.

### Authorization

Child resources are checked against the authenticated parent before operations are performed.

For example:

```text
Parent A
   ↓
Child belonging to Parent A
   ↓
Allowed

Parent A
   ↓
Child belonging to Parent B
   ↓
Rejected
```

---

# 🏗️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Next.js App Router

## Backend

* Next.js Route Handlers
* REST-style APIs
* TypeScript

## Database

* PostgreSQL
* Prisma ORM

## Validation & Authentication

* Zod
* bcrypt
* HTTP-only cookies

## AI

* Gemini API

## Deployment

* Vercel

## Version Control

* Git
* GitHub

## CI/CD

* GitHub Actions

---

# 🧩 Architecture

SafeScroll follows a full-stack architecture using the Next.js App Router.

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │  React / Next.js UI │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Routes    │
                    │    Route Handlers   │
                    └──────────┬──────────┘
                               │
                  ┌────────────┼────────────┐
                  │            │            │
                  ▼            ▼            ▼
             PostgreSQL     Prisma       Gemini
             Database        ORM           AI
                  │
                  ▼
             Application Data
```

---

# 📁 Project Structure

The main application structure is:

```text
kidssafescroll/
│
├── app/
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── register/
│   │   │
│   │   ├── children/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── content/
│   │   │       └── policy/
│   │   │
│   │   ├── dashboard/
│   │   ├── submissions/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── login/
│   ├── register/
│   │
│   ├── (parent)/
│   │   ├── dashboard/
│   │   ├── child/
│   │   └── submit/
│   │
│   ├── (watch)/
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── prisma/
│   └── schema.prisma
│
├── prisma7.config.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# 🗄️ Database Design

The application uses **PostgreSQL** with **Prisma ORM**.

The database stores relationships between:

```text
Parent
  │
  └── Child
       │
       ├── Safety Policy
       │
       └── Content Submissions
              │
              ├── AI Analysis
              │
              └── Parent Decision
```

This relational structure ensures that content and policies remain associated with the correct child and parent.

---

# 🔌 API Overview

## Authentication

### Register

```http
POST /api/auth/register
```

Creates a new parent account.

### Login

```http
POST /api/auth/login
```

Authenticates the parent and establishes the session.

### Logout

```http
POST /api/auth/logout
```

Clears the authentication session.

---

# 👶 Child APIs

### Get Children

```http
GET /api/children
```

Returns children belonging to the authenticated parent.

### Create Child

```http
POST /api/children
```

Creates a new child profile.

### Update Child

```http
PUT /api/children/:id
```

Updates a child profile.

### Delete Child

```http
DELETE /api/children/:id
```

Deletes a child profile.

---

# 🛡️ Safety Policy APIs

### Get Policy

```http
GET /api/children/:id/policy
```

Returns the safety policy for a child.

### Create / Update Policy

```http
PUT /api/children/:id/policy
```

Updates the selected restricted categories.

---

# 🎬 Content APIs

### Submit Content

```http
POST /api/children/:id/content
```

Creates a content submission for a child.

---

# 🤖 AI Analysis

### Analyze Submission

```http
POST /api/submissions/:id/analyze
```

Runs AI-based safety analysis on the submitted content.

The analysis produces information such as:

```text
Risk Level
Risk Score
Detected Categories
Explanation
Recommendation
```

---

# ⚖️ Parent Decision

### Submit Final Decision

```http
POST /api/submissions/:id/decision
```

Stores the parent's final decision.

Possible decisions:

```text
ALLOWED
REVIEW
RESTRICTED
```

---

# 👁️ Content Access

### Access Submission

```http
GET /api/submissions/:id/access
```

Provides controlled access to the submitted content based on the application's decision flow.

---

# 📈 Dashboard

```http
GET /api/dashboard
```

Returns dashboard-related information for the authenticated parent.

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="your_postgresql_connection_string"

AUTH_SECRET="your_secure_auth_secret"

GEMINI_API_KEY="your_gemini_api_key"
```

### Important

Never commit `.env` to GitHub.

The environment file contains sensitive credentials and should remain private.

---

# 💻 Local Development

## 1. Clone the repository

```bash
git clone https://github.com/Anjalivk3/kidssafescroll.git
```

Move into the project:

```bash
cd kidssafescroll
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create:

```text
.env
```

and add:

```env
DATABASE_URL="your_postgresql_connection_string"
AUTH_SECRET="your_secure_auth_secret"
GEMINI_API_KEY="your_gemini_api_key"
```

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Run database migrations

```bash
npx prisma migrate dev
```

---

## 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏭 Production Build

To create a production build:

```bash
npm run build
```

The project is configured to generate the Prisma Client before building:

```text
prisma generate && next build
```

To start the production server:

```bash
npm start
```

---

# 🔄 CI/CD

SafeScroll uses **GitHub Actions** for continuous integration.

The workflow performs:

```text
Git Push
   ↓
GitHub Actions
   ↓
Install Dependencies
   ↓
Generate Prisma Client
   ↓
Next.js Production Build
   ↓
Build Result
```

The CI environment uses the required environment secrets for the production build.

---

# ☁️ Deployment

The application is deployed using **Vercel**.

Deployment flow:

```text
Developer
    ↓
Git Push
    ↓
GitHub Repository
    ↓
Vercel
    ↓
Next.js Build
    ↓
Production Deployment
```

Production URL:

https://kidssafescroll.vercel.app/

---

# 🧪 Suggested Demo Flow

For demonstrating the project:

### Step 1 — Register

Create a parent account.

### Step 2 — Login

Login using the newly created account.

### Step 3 — Create Child

Create a child profile.

Example:

```text
Name: Aarav
Age: 10
```

### Step 4 — Configure Safety Policy

Select categories such as:

```text
Violence
Profanity
Dangerous Behavior
```

### Step 5 — Submit Content

Submit a video/reel URL with available title, description, or transcript.

### Step 6 — Run AI Analysis

The server analyzes the submitted content.

### Step 7 — Review Result

Example:

```text
Risk: HIGH

Categories:
VIOLENCE
DANGEROUS_BEHAVIOR

Recommendation:
RESTRICT
```

### Step 8 — Parent Decision

The parent can choose:

```text
ALLOWED
REVIEW
RESTRICTED
```

### Step 9 — Dashboard

Review the content history and previous decisions.

---

# 🧠 Design Decisions

## Why Next.js?

Next.js provides:

* React-based UI
* App Router
* Server-side capabilities
* API Route Handlers
* Production deployment support
* Good integration with Vercel

It allows the frontend and backend API layer to exist within one application.

---

## Why PostgreSQL?

SafeScroll contains relational data:

```text
Parent → Children
Child → Policy
Child → Submissions
Submission → Analysis
Submission → Decision
```

PostgreSQL is well suited for these relationships and provides strong relational data integrity.

---

## Why Prisma?

Prisma provides:

* Type-safe database access
* Schema-based database modeling
* Migrations
* Generated Prisma Client
* Better developer experience with TypeScript

---

## Why AI Analysis?

Traditional keyword filtering can miss context.

For example, a word may appear in:

* Educational content
* News
* Fiction
* A harmful situation

An AI-assisted analysis layer can consider multiple pieces of information such as title, description, and transcript.

However, AI analysis can still produce incorrect or incomplete results, so SafeScroll keeps the **parent as the final decision-maker**.

---

# 🔒 Privacy & Safety Considerations

SafeScroll is designed as a prototype and should not be treated as a guaranteed child-safety system.

Important considerations include:

* AI analysis can contain false positives.
* AI analysis can contain false negatives.
* External URLs may become unavailable.
* Third-party platforms may change their content.
* The prototype does not directly control or block Instagram, YouTube, or other platforms.
* Parents should review important decisions themselves.

The application is intended to assist parents rather than replace parental judgment.

---

# ⚠️ Current Limitations

This project is an MVP/prototype.

Current limitations include:

1. It does not directly block content on third-party social media applications.

2. AI analysis depends on the information available from the submitted content.

3. A URL alone may not provide enough information for accurate analysis.

4. The AI response should not be considered a perfect moderation system.

5. The current application focuses on the core parent → child → policy → analysis → decision workflow.

---

# 🔮 Future Improvements

Possible future improvements include:

* Browser extension for real-time content checking
* Mobile application
* Direct platform integrations where APIs permit
* More advanced video/audio extraction
* OCR for text inside videos/images
* More detailed parental controls
* Age-based policies
* Notification system
* Analytics and safety reports
* Improved AI moderation with multiple models
* Human review workflow
* More comprehensive audit logs
* Rate limiting and abuse prevention
* Automated testing
* Monitoring and observability

---

# 🎓 Assignment Objectives Covered

SafeScroll demonstrates several full-stack development concepts:

| Requirement        | Implementation                       |
| ------------------ | ------------------------------------ |
| React              | Next.js / React UI                   |
| Next.js            | App Router                           |
| TypeScript         | Application and API code             |
| REST APIs          | Next.js Route Handlers               |
| Database           | PostgreSQL                           |
| ORM                | Prisma                               |
| Authentication     | HTTP-only cookie session             |
| Authorization      | Parent/child ownership checks        |
| Validation         | Zod                                  |
| Password Security  | bcrypt                               |
| AI Integration     | Gemini API                           |
| CRUD               | Child profiles and policies          |
| Data Relationships | Parent → Child → Policy → Submission |
| Deployment         | Vercel                               |
| Version Control    | Git/GitHub                           |
| CI                 | GitHub Actions                       |

---

# 🌟 What Makes SafeScroll Different?

SafeScroll is not simply a CRUD application.

The project combines:

```text
Authentication
      +
Authorization
      +
Relational Database
      +
REST APIs
      +
AI Integration
      +
Content Risk Classification
      +
Parent Safety Policies
      +
Human Decision Layer
      +
Production Deployment
      +
CI/CD
```

The main goal is to demonstrate how a real-world product can combine traditional full-stack engineering with an AI-assisted workflow.

---

# 👩‍💻 Author

**Anjali Jain**

MERN / Full-Stack Developer

### Profiles

* GitHub: https://github.com/Anjalivk3
* LinkedIn: https://www.linkedin.com/in/contactanjalijain/

---

# 📄 Project Disclaimer

SafeScroll is an educational/prototype project created to demonstrate full-stack development, AI integration, authentication, authorization, database design, and deployment.

It is not intended to provide guaranteed protection from harmful online content or replace parental supervision.

---

## 🛡️ SafeScroll

### A safer scroll starts with a smarter filter.
