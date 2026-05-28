<div align="center">

# VedaAI

### AI-Powered Question Paper & Assessment Generator for Teachers

Generate comprehensive question papers, quizzes, worksheets, and homework assignments in seconds — powered by Groq AI with real-time progress updates.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://veda-ai-web-psi.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://veda-ai-3-2ogp.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Workflow](#workflow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

**VedaAI** is a full-stack AI teacher toolkit that helps educators generate professional-grade assessments in seconds. Teachers can configure exam patterns (CBSE, MCQ Quiz, Unit Test, Mid-Term, Final Exam), set difficulty levels using Bloom's Taxonomy, choose question types (MCQ, Short Answer, Long Answer, Fill in the Blanks, True/False, Numerical), and receive a beautifully formatted question paper — all powered by Groq AI.

The app features real-time generation progress via WebSockets, PDF export, a student group management system, a question paper library, and full mobile responsiveness.

---

## Screenshots

### Dashboard & Assignments
| Desktop | Mobile |
|---------|--------|
| ![Dashboard Desktop](./screenshots/veda1.jpg) | ![Dashboard Mobile](./screenshots/veda2.jpg) |

### Create Question Paper
| Assignment Details | Exam Pattern & Difficulty |
|-------------------|--------------------------|
| ![Create Form](./screenshots/veda3.jpg) | ![Exam Pattern](./screenshots/veda4.jpg) |

| Bloom's Taxonomy & Question Types | Generated Output |
|----------------------------------|-----------------|
| ![Blooms Taxonomy](./screenshots/veda5.jpg) | ![Output Desktop](./screenshots/veda6.jpg) |

### Mobile Output View
| Output (Mobile) | Question Difficulty (Mobile) |
|----------------|------------------------------|
| ![Output Mobile](./screenshots/veda13.jpg) | ![Question Difficulty](./screenshots/veda14.jpg) |

### Classroom Management
| My Groups | Group Detail (empty) | Group Detail (with students) | Bulk Import CSV |
|-----------|---------------------|------------------------------|-----------------|
| ![Groups](./screenshots/veda7.jpg) | ![Group Detail](./screenshots/veda8.jpg) | ![Group Students](./screenshots/veda9.jpg) | ![CSV Import](./screenshots/veda10.jpg) |

### AI Teacher's Toolkit & Library
| AI Toolkit | My Library |
|------------|------------|
| ![Toolkit](./screenshots/veda11.jpg) | ![Library](./screenshots/veda12.jpg) |

> Screenshots are in the `screenshots/` folder, named `veda1.jpg` through `veda12.jpg`.

---

## Features

### AI-Powered Assessment Generation
- Generate question papers, quizzes, worksheets, and homework in seconds
- Powered by **Groq AI** for high-quality, curriculum-aligned questions
- Support for **7 question types**: MCQ, Short Answer, Long Answer, Fill in the Blanks, True/False, Numerical, Diagram/Graph
- Real-time generation progress with **WebSocket** updates (no page refresh needed)

### Smart Configuration
- **5 Exam Pattern Templates**: CBSE, MCQ Quiz, Unit Test, Mid-Term, Final Exam — one click auto-fills question types
- **4 Difficulty Levels**: Easy, Medium, Hard, and Hybrid (custom % split)
- **Bloom's Taxonomy** targeting — select cognitive levels: Remember, Understand, Apply, Analyze, Evaluate, Create
- Custom marks per question type with live total marks calculator
- Upload reference images/documents for context-aware generation

### Question Paper Output
- Beautifully formatted question paper rendered in-browser
- **Download as PDF** (pure Node.js via pdfkit — no browser/Chrome dependency)
- **Regenerate** with one click if output isn't satisfactory
- Answer key included in the PDF

### Classroom & Group Management
- Create student groups by class, subject, and section
- Add students manually or **bulk import via CSV** (Name, Email, Roll Number)
- Track students, assignments, and performance per group
- Assign question papers to specific groups

### My Library
- Browse and manage all generated question papers
- Filter by subject and class
- Star/bookmark favourite papers
- View paper metadata: total questions, marks, date created

### AI Teacher's Toolkit
- **Question Paper Generator** — full papers with multiple question types
- **Worksheet Generator** — practice worksheets with fill-in-the-blanks and short answers
- **Quiz Generator** — quick MCQ quizzes for pop assessments
- **Homework Generator** — structured homework with progressive difficulty

### Mobile Responsive
- Fully responsive across desktop, tablet, and mobile
- Mobile-optimised bottom navigation bar
- Touch-friendly form inputs and card layouts

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | React framework with SSR/SSG |
| React 19 | UI library |
| TypeScript | Type safety |
| Zustand | Global state management |
| Socket.IO Client | Real-time WebSocket updates |
| Axios | HTTP API client |
| React Hot Toast | Toast notifications |
| CSS Modules | Component-scoped styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Primary database |
| Redis (ioredis) | Caching + job queue broker |
| BullMQ | Background job queue for AI generation |
| Socket.IO | Real-time progress events |
| Groq API | AI question generation |
| pdfkit | Server-side PDF generation (no Chrome) |
| Multer | File upload handling |
| Zod | Request validation |

### DevOps & Tooling
| Technology | Purpose |
|------------|---------|
| Turborepo | Monorepo build system |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| npm Workspaces | Monorepo package management |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                   │
│   Next.js 15 App (Vercel)                                        │
│   ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐   │
│   │  Pages   │  │  Zustand   │  │   Socket.IO Client       │   │
│   │ /create  │  │   Store    │  │   (real-time progress)   │   │
│   │ /output  │  │            │  │                          │   │
│   │ /groups  │  └────────────┘  └──────────────────────────┘   │
│   └──────────┘                                                   │
└──────────────────────────┬──────────────────────┬───────────────┘
                           │ HTTP (REST API)       │ WebSocket
                           ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Render)                                │
│                                                                   │
│   Express + TypeScript                                            │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                   REST API Routes                         │  │
│   │  POST /assignments        GET /assignments/:id/paper      │  │
│   │  POST /assignments/:id/regenerate                         │  │
│   │  GET  /assignments/:id/pdf                                │  │
│   └──────────────────────┬───────────────────────────────────┘  │
│                           │                                       │
│   ┌───────────────────────▼──────────────────────────────────┐  │
│   │              BullMQ Job Queue                             │  │
│   │                                                           │  │
│   │  addGenerationJob()  ──►  Worker processes job           │  │
│   │                           │                              │  │
│   │                           ├─ buildPrompt()               │  │
│   │                           ├─ generateQuestionPaper() ──► Groq API  │
│   │                           ├─ save to MongoDB             │  │
│   │                           ├─ cache in Redis              │  │
│   │                           └─ emit GENERATION_COMPLETED   │  │
│   └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│   ┌────────────────┐   ┌─────────────────┐   ┌──────────────┐  │
│   │    MongoDB     │   │      Redis       │   │  Socket.IO   │  │
│   │  (Assignments) │   │  (Cache+Queue)   │   │   Server     │  │
│   │  (Papers)      │   │                  │   │              │  │
│   │  (Groups)      │   │                  │   │              │  │
│   └────────────────┘   └─────────────────┘   └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │          Groq API             │
                    │    (AI Question Generation)   │
                    └───────────────────────────────┘
```

---

## Workflow

```
Teacher fills form
        │
        ▼
POST /assignments  ──►  Assignment created (status: "generating")
        │                       │
        │                       ▼
        │            BullMQ job added to queue
        │                       │
        ▼                       ▼
Frontend redirects        Worker picks up job
to /output/[id]                 │
        │               ┌───────┴──────────┐
        │               │  Emit progress   │
        │               │  10% → 25% →    │◄──── Socket.IO
        │               │  40% → 70% →    │      room events
        │               │  90% → 100%     │
        │               └───────┬──────────┘
        │                       │
        │               Groq AI generates paper
        │                       │
        │               Save to MongoDB
        │                       │
        │               Cache in Redis (1hr TTL)
        │                       │
        │               Emit GENERATION_COMPLETED
        │               with full paper data
        │                       │
        ▼                       ▼
Socket listener ◄──── Receives paper via socket
        │              (no extra API call needed)
        ▼
Display question paper
        │
        ├──► Download as PDF  (GET /assignments/:id/pdf)
        │
        └──► Regenerate       (POST /assignments/:id/regenerate)


Page Refresh / Direct URL:
        │
        ▼
GET /assignments/:id/paper
        │
        ├── Redis cache hit?   ──► 200 return paper
        │
        ├── MongoDB found?     ──► 200 return paper
        │
        ├── Status generating  ──► 202 wait for socket
        │
        └── Status failed      ──► 500 show retry button
```

---

## Project Structure

```
vedaai/
├── apps/
│   ├── server/                       # Express backend
│   │   └── src/
│   │       ├── config/               # env, redis, db config
│   │       ├── controllers/          # assignment, group controllers
│   │       ├── middleware/           # error handler
│   │       ├── models/               # Assignment, QuestionPaper, Group
│   │       ├── queues/               # BullMQ queue + worker
│   │       │   ├── index.ts          # queue setup & addGenerationJob
│   │       │   └── generation.worker.ts
│   │       ├── routes/               # API route definitions
│   │       ├── services/
│   │       │   ├── ai.service.ts     # Groq API integration
│   │       │   ├── pdf.service.ts    # pdfkit PDF generation
│   │       │   └── prompt.service.ts # AI prompt builder
│   │       ├── socket/
│   │       │   └── index.ts          # Socket.IO server & emitToAssignment
│   │       └── utils/                # logger, helpers
│   │
│   └── web/                          # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── assignments/      # assignments list page
│           │   ├── create/           # create assignment form
│           │   ├── output/[id]/      # generated paper view
│           │   ├── groups/           # classroom management
│           │   ├── toolkit/          # AI tools selection
│           │   └── library/          # saved papers
│           ├── components/           # reusable UI components
│           ├── services/
│           │   ├── api.ts            # axios instance
│           │   └── socket.ts         # socket event helpers
│           ├── store/
│           │   └── useAssignmentStore.ts
│           └── styles/               # CSS modules
│
└── packages/
    └── shared/                       # shared TypeScript types & constants
        └── src/
            ├── types/                # Assignment, QuestionPaper, Group types
            └── constants/            # WS_EVENTS, enums
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 10
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/vishraj007/veda-ai.git
cd vedaai

# Install all dependencies (monorepo)
npm install
```

### Setup Environment Variables

```bash
cp apps/server/.env.example apps/server/.env
# Fill in your values (see Environment Variables section below)
```

### Run in Development

```bash
# Run both frontend and backend in parallel
npm run dev:all

# Or run separately
npm run dev:web       # Next.js on http://localhost:3000
npm run dev:server    # Express on http://localhost:5000
```

### Build for Production

```bash
npm run build
```

---

## Environment Variables

`apps/server/.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/vedaai

REDIS_URL=redis://localhost:6379

GROQ_API_KEY=your_groq_api_key_here

CORS_ORIGIN=http://localhost:3000
```

`apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## Deployment

### Frontend — Vercel

1. Connect your GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
   - `NEXT_PUBLIC_WS_URL` → your Render backend URL

### Backend — Render

1. Create a new Web Service on Render
2. Set root directory to `apps/server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/index.js`
5. Add all server environment variables

> Redis and MongoDB should be provisioned separately — MongoDB Atlas and Redis Cloud both have free tiers.

---

## License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">

Built by **Vishal Rawat**

[Live Demo](https://veda-ai-web-psi.vercel.app) · [Report Bug](https://github.com/vishraj007/veda-ai/issues) · [Request Feature](https://github.com/vishraj007/veda-ai/issues)

</div>
