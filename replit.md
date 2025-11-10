# EnerJee - AI Energy Optimization Platform

## Overview

EnerJee is a fully functional, production-ready full-stack web application that provides AI-powered energy optimization and forecasting for 6 major Indian regions based on their renewable energy strengths: Jodhpur & Bangalore (solar leaders), Chennai & Kutch (wind leaders), Uttarakashi & Satara (hydro leaders). The platform predicts, optimizes, and explains the best mix of solar, wind, and hydro energy sources using simulated ML forecasting and linear programming optimization techniques.

The application enables authenticated users to configure regional parameters, select forecasting methods (Last Day Pattern, 24 Hour, 3 Month, 1 Year, Exponential Smoothing), and optimize energy distribution while visualizing cost savings, emission reductions, and renewable energy adoption through interactive dashboards and charts. An AI Energy Mentor powered by GPT-5 provides conversational explanations of optimization results.

**Status**: ✅ Complete - All core features implemented and tested
- Simple username/password authentication (demo credentials: demo1234/123456)
- Energy forecasting for 6 Indian regions (Jodhpur, Bangalore, Chennai, Kutch, Uttarakashi, Satara) with 5 forecast methods
- Linear programming optimization minimizing weighted cost + emissions
- Interactive dashboard with 2 charts (energy mix, price analysis)
- Renewable energy breakdown displaying percentage distribution (solar, wind, hydro)
- CSV export functionality with complete optimization data and time-series analysis
- AI chat assistant with GPT-5 integration
- PostgreSQL database storing user data and optimization results
- Multi-select energy focus (users can prioritize multiple energy sources)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- TailwindCSS for styling with a custom design system
- Wouter for lightweight client-side routing
- TanStack React Query for server state management

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York variant) with custom theming
- Recharts for data visualization (energy mix, price analysis, emission charts)

**Design System:**
- Color palette: Primary blue (#007BFF), orange accent (#FF7B00), white base
- Typography: Inter font family from Google Fonts
- Spacing: Tailwind's 4px-based spacing scale
- Custom CSS variables for theme consistency

**Component Organization:**
- `components/` - Reusable UI components (ConfigSidebar, Dashboard, Charts, EnergyBreakdown, ChatAssistant)
- `components/ui/` - shadcn/ui primitive components
- `pages/` - Route-level components (login, dashboard, not-found)
- `hooks/` - Custom React hooks (useAuth, use-toast, use-mobile)
- `lib/` - Utility functions and query client configuration

**State Management Strategy:**
- React Query for server state (user authentication, optimization results)
- Local component state for UI interactions
- Session-based authentication state managed through HTTP-only cookies

### Backend Architecture

**Technology Stack:**
- Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- Node.js runtime environment

**API Design:**
- RESTful endpoints under `/api` namespace
- Endpoints: `/api/login`, `/api/logout`, `/api/auth/user`, `/api/optimize`, `/api/chat`
- Request/response validation using Zod schemas
- Shared type definitions in `shared/api-types.ts` for frontend-backend contract

**Core Business Logic Modules:**

1. **Forecasting Engine** (`server/forecasting.ts`):
   - Simulates renewable energy generation for 6 Indian regions
   - Region-specific characteristics based on renewable energy strengths:
     * Jodhpur (2.2x solar), Bangalore (2.0x solar) - solar leaders, solar dominates graphs
     * Chennai (2.2x wind), Kutch (2.5x wind) - wind leaders, wind dominates graphs
     * Uttarakashi (2.3x hydro), Satara (2.0x hydro) - hydro leaders, hydro dominates graphs
   - Multiple forecasting methods: Last Day Pattern, 24 Hour, 3 Month, 1 Year, Exponential Smoothing
   - Generates time-series data for solar, wind, hydro generation and demand

2. **Optimization Engine** (`server/optimizer.ts`):
   - Linear programming-style optimization (PuLP-like logic in TypeScript)
   - Minimizes cost and emissions while meeting demand constraints
   - Configurable cost/emission weighting
   - Compares optimized solution against greedy baseline
   - Returns energy mix data, price analysis, and emission breakdowns

3. **AI Assistant** (`server/openai.ts`):
   - OpenAI API integration (GPT-4/5) through Replit AI Integrations
   - Context-aware responses using optimization results
   - Explains energy optimization in simple, non-technical language
   - Provides insights on renewable energy for Indian regions

**Error Handling:**
- Centralized error handling middleware
- HTTP status codes for different error types
- Unauthorized (401) errors trigger frontend redirect to login

### Authentication and Authorization

**Authentication Strategy:**
- Simple username/password authentication for demo purposes
- Demo credentials: username=`demo1234`, password=`123456`
- Session-based authentication with HTTP-only cookies
- Implementation in `server/testAuth.ts`

**Session Management:**
- PostgreSQL-backed session store using `connect-pg-simple`
- 1-week session TTL (time-to-live)
- Sessions stored in `sessions` table
- Session cleared on logout

**User Management:**
- Single demo user account created on login
- User profile includes: id, email, firstName, lastName, profileImageUrl
- User-scoped optimization results stored with userId foreign key

**Security Measures:**
- Secure session cookies (httpOnly, secure flags)
- CSRF protection through session secret
- Authentication middleware (`isAuthenticated`) guards protected routes
- Frontend unauthorized error detection triggers redirect to login page (`/`)

**Login Flow:**
1. User enters credentials on login page (`/`)
2. POST `/api/login` validates credentials against hardcoded values
3. Creates session and stores demo user in database
4. Redirects to `/dashboard`
5. Unauthorized errors redirect back to `/` login page

### Data Storage

**Database Technology:**
- PostgreSQL via Neon Database (serverless)
- Drizzle ORM for type-safe database queries
- WebSocket connection pooling for serverless compatibility

**Database Schema:**

1. **sessions** - Session storage for authentication
   - sid (primary key), sess (JSONB), expire (timestamp)

2. **users** - User profiles
   - id (UUID primary key), email (unique), firstName, lastName, profileImageUrl
   - createdAt, updatedAt timestamps

3. **optimizationResults** - Historical optimization runs
   - id (UUID primary key), userId (foreign key)
   - Configuration: region, forecastMethod, energyFocus (text[] array), costWeight
   - Results: optimizedCost, baselineCost, optimizedEmissions, baselineEmissions
   - Metrics: optimizedReliability, baselineReliability, renewableShare
   - JSONB fields: energyMixData, priceData, emissionData
   - createdAt timestamp
   - Note: energyFocus is multi-select (solar, wind, hydro) stored as text array

**Data Access Layer:**
- Storage abstraction interface (`IStorage`) for testability
- DatabaseStorage implementation using Drizzle ORM
- Transactional operations with proper error handling
- Query optimization through indexed foreign keys

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files in `migrations/` directory
- Schema definition in `shared/schema.ts`
- Push-based deployment with `db:push` command

## External Dependencies

### Third-Party Services

1. **Replit AI Integrations**
   - OpenAI-compatible API access for GPT-4/5
   - Environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
   - Used for the Energy Mentor chat assistant feature

2. **Neon Database (PostgreSQL)**
   - Serverless PostgreSQL hosting
   - Environment variable: `DATABASE_URL`
   - WebSocket-based connection for serverless compatibility

### Key NPM Packages

**Frontend Libraries:**
- `@tanstack/react-query` - Server state management and caching
- `@radix-ui/*` - Accessible UI component primitives (20+ packages)
- `recharts` - Chart visualization library
- `wouter` - Lightweight routing
- `react-hook-form` + `@hookform/resolvers` - Form management
- `zod` - Schema validation
- `class-variance-authority` - Component variant styling
- `date-fns` - Date manipulation

**Backend Libraries:**
- `express` - HTTP server framework
- `@neondatabase/serverless` - Neon database client with WebSocket support
- `drizzle-orm` - Type-safe ORM
- `drizzle-zod` - Zod schema generation from database schema
- `express-session` - Session management
- `connect-pg-simple` - PostgreSQL session store
- `openai` - OpenAI API client

**Development Tools:**
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundling
- `tailwindcss` + `autoprefixer` - CSS processing
- `@replit/vite-plugin-*` - Replit development environment integration

### API Integrations

**OpenAI Chat Completion API:**
- Model: GPT-4 or GPT-5
- Purpose: Energy Mentor conversational assistant
- Context injection: Optimization results, regional data
- System prompt: Expert renewable energy advisor for Indian regions

### Build and Deployment

**Development Workflow:**
- `npm run dev` - Starts Vite dev server with HMR and Express backend
- TypeScript compilation via `tsx` for server-side code
- Vite middleware mode for unified development experience

**Production Build:**
- `npm run build` - Builds frontend (Vite) and backend (esbuild)
- Frontend output: `dist/public/`
- Backend output: `dist/index.js` (ESM bundle)
- Static asset serving in production mode

**Environment Configuration:**
- Required: `DATABASE_URL`, `SESSION_SECRET`
- Optional: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
- Node environment: `NODE_ENV` (development/production)

## Recent Changes (November 10, 2025)

**Authentication System Replacement:**
- Removed Replit Auth (OIDC) integration completely
- Implemented simple username/password login with hardcoded demo credentials
- Demo username: `demo1234`, password: `123456`
- Updated all unauthorized redirects to point to `/` instead of `/api/login`
- Removed legacy `server/replitAuth.ts` file

**UI Improvements:**
- Removed feature showcase boxes from login page for cleaner design
- Login page now shows only branding, credentials info, and login form

**Energy Focus Enhancement:**
- Converted from single-select radio to multi-select checkboxes
- Users can now prioritize multiple energy sources simultaneously
- Database schema migrated from varchar to text[] for energyFocus
- Selected energy sources receive 1.3x multiplier in optimization

**Renewable Energy Breakdown & Export:**
- Added percentage breakdown section showing distribution of solar, wind, and hydro
- Percentages calculated from actual time-series data (total energy by source / total renewable)
- Visual cards with color-coded icons (amber for solar, blue for wind, teal for hydro)
- CSV export button generates comprehensive report including:
  * Renewable energy percentages
  * Optimization results comparison
  * Complete energy mix time-series
  * Price analysis data
- Export filename format: `enerjee-optimization-{region}-{date}.csv`

**Cost vs Emissions Priority Slider:**
- Interactive slider allowing users to adjust optimization objectives
- Cost Priority (≥70%): Optimizer shifts 10-20% from expensive renewables to cheaper grid power
  * Result: Lower cost, but higher emissions
- Emissions Priority (≤30%): Optimizer replaces 40-70% of grid usage with renewable sources
  * Result: Lower emissions, but higher cost  
- Balanced (30-70%): Standard weighted optimization without strategic adjustments
- Trade-off is visible in optimization results (5-15% difference in cost/emissions between extremes)