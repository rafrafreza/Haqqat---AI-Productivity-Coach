# Haqqat 🚀 | Align · Build · Evolve

[![Live in Production](https://img.shields.io/badge/Live_App-haqqat.netlify.app-2ea44f?style=for-the-badge&logo=netlify)](https://haqqat.netlify.app/)
[![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/Gemini%202.0-Flash%20Lite-FFCC00?style=for-the-badge&logo=google)](https://aistudio.google.com/)

> **Live Demo:** [https://haqqat.netlify.app/](https://haqqat.netlify.app/)

**Haqqat** is a production-grade, AI-native productivity ecosystem designed to move beyond traditional habit tracking. Operating flawlessly in production for months, it synthesizes user behavioral data—from task completion and focus sessions to energy mapping—and delivers hyper-personalized, context-aware coaching via Google's Gemini 2.0 LLM. 

Built with scalability, security, and user retention in mind, this application serves as a comprehensive case study in **Full-Stack Engineering**, **Generative AI Integration**, and **Serverless Architecture**.

---

## 🌟 Core Product Features

Haqqat is engineered as a holistic operating system for personal growth, blending behavioral psychology with gamification.

- **🤖 Context-Aware AI Coach:** An LLM-powered assistant that reads the user's live productivity state (tasks, focus minutes, routine streaks) to deliver non-generic, highly actionable insights.
- **🛡️ Enterprise-Grade Authentication:** Seamless Google OAuth and Email/Password flows managed via Supabase Auth, strictly enforced by PostgreSQL Row Level Security (RLS).
- **📊 Behavioral Analytics Engine:** Features like the **Decision Journal**, **Energy Map**, **Life Balance Radar**, and **Procrastination Autopsy** allow users to track cognitive patterns alongside traditional tasks.
- **🎮 Gamification & Retention:** A custom XP progression system dynamically rewards users for completing routines, achieving goals, and maintaining streaks—driving long-term engagement.
- **⏱️ Deep Work & Goal Tracking:** Integrated Pomodoro focus sessions (`/focus`), comprehensive weekly reviews (`/reviews`), and milestone-driven goal management (`/goals`).

---

## 🏗️ Architecture & Engineering Decisions

For technical leaders, CTOs, and peer engineers exploring this repository, Haqqat was architected to balance rapid feature delivery with long-term maintainability, strict cost control, and performance.

### 1. Serverless AI Inference at the Edge
Instead of exposing API keys on the client or building a heavyweight Node.js backend, all GenAI requests are routed through **Deno-based Supabase Edge Functions**. 
- **Zero Cold Starts:** Edge deployment ensures immediate AI responses.
- **Streaming UI:** Utilizes Server-Sent Events (SSE) to stream LLM tokens directly to the React frontend for a latency-free UX.
- **Context Injection:** The edge function dynamically builds the LLM prompt by querying the user's live database state *before* pinging the Gemini API, ensuring the AI has the exact context needed.

### 2. Cost Management & Rate Limiting
To prevent runaway LLM API costs in production, a custom rate-limiting architecture was engineered:
- Database triggers and Edge Function logic strictly monitor `ai_coach_usage`.
- Daily token/message limits are enforced at the backend level, bypassing client-side tampering.

### 3. Secure, Scalable Backend
- **PostgreSQL & RLS:** Every table is secured via strict Row Level Security policies. Users can strictly read/write only their own data.
- **BaaS Synergy:** Leveraging Supabase allows the application to scale effortlessly without DevOps overhead, handling auth, database scaling, and edge computing under one unified ecosystem.

### 4. Resilient Frontend Architecture
- **React 18 + Vite:** Blazing fast hot-module replacement during development and optimized, minified bundles in production.
- **State & Caching:** Heavy utilization of localized state management and efficient data fetching to ensure a snappy, offline-resilient user experience.
- **Modern UI/UX:** Built with Tailwind CSS, Shadcn UI, and Radix primitives for an accessible, responsive, and aesthetically premium interface.

---

## ⚙️ System Flow

```mermaid
graph TD;
    Client[React Frontend (Netlify)] -->|Google OAuth / JWT| Gateway(Supabase API Gateway);
    
    subgraph Supabase Ecosystem
        Gateway -->|Verify JWT| Edge[Deno Edge Function: AI Coach];
        Gateway -->|Enforce RLS| DB[(PostgreSQL Database)];
        Edge <-->|Fetch User Context| DB;
        Edge <-->|Log Usage/Rate Limit| DB;
    end
    
    Edge -->|RAG / Context Injected Prompt| LLM[Google Gemini 2.0 API];
    LLM -->|Streamed Response (SSE)| Client;
```

---

## 🚀 Getting Started (Local Development)

To run the application locally:

### 1. Prerequisites
- Node.js 18+ 
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/apikey) API key

### 2. Database Setup
Execute the SQL migrations found in `supabase/migrations/` in your Supabase SQL Editor to construct the schema and RLS policies.

### 3. Edge Function Deployment
Deploy the AI microservice via the Supabase CLI:
```bash
supabase functions deploy ai-coach
supabase secrets set --env-file ./supabase/.env
```
*(Ensure JWT verification is disabled for the `ai-coach` function in the Supabase UI, as it handles verification internally).*

### 4. Client Setup
Clone the repository, install dependencies, and populate your `.env`:
```bash
npm install
```
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```
Start the development server:
```bash
npm run dev
```

---

## 📜 License & Operations

Haqqat is currently operating in production at [haqqat.netlify.app](https://haqqat.netlify.app/). The CI/CD pipeline is fully automated via Netlify, seamlessly deploying optimized builds upon merges to the `main` branch. 

*Designed and engineered with a focus on modern web standards, scalable architecture, and applied artificial intelligence.*
