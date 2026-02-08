AI Business Intelligence Workspace

A Next.js–based Generative AI Business Intelligence platform that transforms natural language prompts into live, interactive analytics components such as metrics, charts, comparisons, alerts, and insights.

This project demonstrates how conversational AI can dynamically generate frontend UI components for business analytics workflows.

Overview

The AI Business Intelligence Workspace allows users to interact with data using plain English. Instead of manually building dashboards, users simply ask questions like:

“Show revenue metrics”

“Compare Q1 vs Q4”

“Generate business alerts”

The system responds by rendering structured UI components in real time.

This project uses Tambo AI to interpret tool-based responses and map them directly to React components.

Key Features

Conversational analytics interface

Dynamic UI generation from AI responses

Metric cards, graphs, comparison views, alerts, insights, and tables

Workspace system for managing generated components

Sidebar for past chats

Fully responsive layout

Tailwind-based design system

Modular component architecture

Mock AI backend (easy to replace with real LLMs)

Architecture
High-Level Flow
User Prompt
   ↓
Next.js API Route (/api/tambo/message)
   ↓
AI-style Tool JSON Response
   ↓
Tambo Provider
   ↓
Workspace Store
   ↓
React Components Rendered in UI

Component Generation

The backend returns structured messages such as:

{
  "type": "tool",
  "name": "show_component_MetricCard",
  "args": {
    "title": "Monthly Revenue",
    "value": "$245,000"
  }
}


These tool messages are intercepted by Tambo and automatically mapped to registered React components.

Project Structure
API
src/app/api/tambo/message/route.ts


Acts as a mock AI backend:

Reads user input

Detects intent (revenue, comparison, alerts, etc.)

Returns simulated AI responses

Emits tool-based JSON for UI generation

This can later be replaced with OpenAI, Claude, Gemini, or any custom LLM.

Chat System
src/components/chat/ChatInterface.tsx


Handles:

Message input

Chat rendering

File uploads

Component workspace

Quick prompts

Integration with Tambo

AI Components
src/components/tambo/


Includes:

MetricCard

GraphCard

ComparisonCard

InsightCard

AlertList

BusinessSummaryTable

StatusBadge

Each component:

Uses Zod schemas

Supports dynamic props

Provides intelligent defaults

Is fully responsive

Designed for real-time generation

These are the building blocks of the AI workspace.

Styling
src/app/globals.css


Defines:

Tailwind theme variables

Light/Dark modes

Card system

Grid layouts

Animations

Scroll behavior

Chat layout fixes

Workspace responsiveness

Tambo Provider
src/components/providers/TamboProviderWrapper.tsx


Responsible for:

Initializing Tambo

Registering AI components

Injecting API key

Wrapping the application

Without this provider, AI rendering will not function.

Tech Stack

Next.js (App Router)

React

Tailwind CSS

Tambo AI

Zustand (workspace state)

Zod (schema validation)

TypeScript

Getting Started
1. Install Dependencies
npm install

2. Environment Variables

Create a .env.local file:

NEXT_PUBLIC_TAMBO_API_KEY=your_api_key_here

3. Run Development Server
npm run dev


Open:

http://localhost:3000

Example Prompts

Show revenue metrics

Compare quarters

Business alerts

Create sales trend

Each prompt dynamically generates UI components.

Current Implementation

The AI responses are currently mocked in:

src/app/api/tambo/message/route.ts


This allows rapid prototyping without an external LLM.

You can replace this with a real AI backend by returning Tambo-compatible tool JSON.

Potential Extensions

Persistent chat history

Real LLM integration

CSV ingestion

Authentication

Dashboard export

Drag-and-drop workspace

Database-backed analytics

SaaS deployment

Author

Kaushalendra