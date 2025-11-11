# EnerJee - AI Energy Optimization Platform

## Overview

EnerJee is a production-ready full-stack web application for AI-powered energy optimization and forecasting across 6 major Indian regions, leveraging their specific renewable energy strengths (solar, wind, hydro). The platform features 5 main sections: Home, Forecasting Dashboard, Smart City Energy Optimizer, EnerJeePT (AI Energy Advisor), and Contact. It includes user authentication, interactive dashboards for forecasting and optimization, a simulator for city-level renewable investment, and a conversational AI assistant named EnerJeePT for guidance. The goal is to minimize weighted cost and emissions while visualizing savings, emission reductions, and renewable energy adoption.

### Design System
- **Color Palette**: Cream background (#edeae1), Teal green primary (#167a5f), Sage green accent (#9bb89f)
- **Typography**: Times New Roman MT Condensed italic for EnerJee logo branding (125px on home page, 110px bold on login page, text-xl on navigation)
- **Layout Consistency**: All pages use unified headers (w-8 h-8 icons, text-4xl font-bold titles, mb-8 spacing), standardized containers (px-4 py-8, max-w-7xl), and grid-based layouts (xl:grid-cols-3 for dashboards)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend uses React with TypeScript, Vite, TailwindCSS, Wouter for routing, and TanStack React Query for server state. UI components are built with Radix UI primitives and shadcn/ui (New York variant) with custom theming, and Recharts for data visualization. A custom design system defines color palettes, typography, and spacing. Component organization follows a modular structure for reusable UI, route-level pages, custom hooks, and utility functions. Navigation is handled by an `AppNav` component, which is responsive and authentication-aware. State management combines React Query for server state, local component state for UI, and session-based authentication via HTTP-only cookies.

### Backend Architecture

The backend is built with Express.js and TypeScript. It exposes RESTful APIs under `/api` for login, logout, user authentication, optimization, and AI chat, with request/response validation using Zod schemas. Core business logic is encapsulated in modules for a Forecasting Engine (simulating renewable generation for 6 Indian regions with various methods), an Optimization Engine (linear programming-style optimization minimizing cost and emissions, comparing against a baseline), and EnerJeePT AI Assistant (integrating OpenAI API for educational guidance on renewable energy concepts, sustainability, and optimization strategies). Error handling is centralized, using appropriate HTTP status codes.

### Authentication and Authorization

A simple username/password authentication system is implemented for demo purposes (demo1234/123456), utilizing session-based authentication with HTTP-only cookies and a PostgreSQL-backed session store. A single demo user account is created upon successful login, and user-scoped optimization results are stored. Security measures include secure session cookies, CSRF protection, and authentication middleware.

### Data Storage

PostgreSQL via Neon Database (serverless) is used with Drizzle ORM for type-safe queries. The database schema includes tables for `sessions`, `users`, and `optimizationResults`. The `optimizationResults` table stores historical runs, including configuration (region, forecast method, multi-select `energyFocus`, cost weight), results (optimized/baseline cost and emissions, reliability, renewable share), and JSONB fields for detailed data. A data access layer abstracts database interactions, and Drizzle Kit is used for schema migrations.

## External Dependencies

### Third-Party Services

1.  **Replit AI Integrations**: Provides OpenAI-compatible API access for GPT-4o, used for EnerJeePT (AI Energy Advisor) chat assistant.
2.  **Neon Database (PostgreSQL)**: Serverless PostgreSQL hosting, utilized for the project's database.

### Key NPM Packages

*   **Frontend**: `@tanstack/react-query`, `@radix-ui/*`, `recharts`, `wouter`, `react-hook-form`, `zod`, `class-variance-authority`, `date-fns`.
*   **Backend**: `express`, `@neondatabase/serverless`, `drizzle-orm`, `drizzle-zod`, `express-session`, `connect-pg-simple`, `openai`.
*   **Development**: `vite`, `tsx`, `esbuild`, `tailwindcss`, `@replit/vite-plugin-*`.

### API Integrations

*   **OpenAI Chat Completion API**: Integrates GPT-4o for EnerJeePT, an energy advisor and educator that helps users understand renewable energy concepts, optimization strategies, and sustainability. EnerJeePT provides approachable, conversational guidance focusing on education and simplification rather than fabricating data or giving investment advice.