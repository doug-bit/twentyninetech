# Overview

This is a full-stack AI image generation application built with React frontend, Express backend, and PostgreSQL database. The app allows users to generate images using AI models through the Replicate API by providing text prompts. It features a modern UI built with shadcn/ui components and stores generated images both locally and in the database with metadata tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state and React Hook Form for form handling
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Follows atomic design with reusable UI components in `/components/ui/`

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for image generation and retrieval
- **Development Setup**: Hot reload with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured JSON responses
- **Request Logging**: Custom middleware for API request/response logging

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Connection**: Neon Database serverless PostgreSQL instance
- **Storage Strategy**: Dual storage approach - images saved locally in `generated_images/` directory and metadata stored in database
- **Fallback Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- **Current State**: Basic structure in place with user schema defined
- **Session Management**: PostgreSQL session store configured with `connect-pg-simple`
- **User Model**: Username/password based authentication schema ready for implementation

## External Service Integrations
- **AI Image Generation**: Replicate API integration using authentic "mayaman/maya-29" model with exact schema parameters
  - Model: dev (28 inference steps optimized)
  - Output format: png (for LED wall compatibility)
  - Aspect ratio: 3:4 (optimized for LED wall display)
  - Guidance scale: 3 (balanced realism)
  - File sizes: Larger PNG files for maximum LED wall compatibility
- **Image Processing**: Automatic download and local storage of generated images with PNG format for LED wall compatibility
- **File Management**: Structured filename generation with timestamps, sanitized prompts, and MM29- prefix for downloads

## Key Design Patterns
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories
- **Type Safety**: Shared TypeScript schemas between frontend and backend using Zod
- **Build Strategy**: Separate build processes for client (Vite) and server (esbuild)
- **Development Workflow**: Unified development server with Vite proxy and hot reload
- **Error Boundaries**: React error handling with custom error overlay for development

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod validation
- **Express.js**: Web server framework with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect, Neon Database serverless driver

## UI and Styling
- **Component Library**: Comprehensive shadcn/ui component suite built on Radix UI
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: Class variance authority for component variant management

## Development and Build Tools
- **Build Tools**: Vite for frontend bundling, esbuild for server bundling
- **TypeScript**: Full TypeScript support across the stack
- **Development**: TSX for running TypeScript in development, Replit-specific plugins

## Third-Party Services
- **AI Image Generation**: Replicate API for AI model inference
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **Session Storage**: PostgreSQL-based session management
- **Date Handling**: date-fns for date manipulation and formatting

## State Management and Data Fetching
- **Server State**: TanStack Query for API data fetching and caching
- **Form Management**: React Hook Form with Hookform resolvers for validation
- **Schema Validation**: Zod for runtime type checking and validation