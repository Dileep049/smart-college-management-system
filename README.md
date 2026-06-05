# Smart College Management System (ERP)

A production-ready, feature-rich Enterprise ERP Dashboard designed for college administrations managing approximately 5,000 students. The application utilizes a highly responsive, modern SaaS dashboard design with a role-based authentication matrix supporting Student, Faculty, HOD, Admin, and Placement Officer profiles.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS (v4), Axios, TanStack React Query, React Hook Form, Zod, Recharts
- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL Client (`pg`), JWT Authentication (Access + Refresh tokens), Role-Based Access Control (RBAC)
- **Database / Storage**: PostgreSQL / Supabase, Supabase Storage
- **Helpers**: PDFKit (digital certificates & transcripts PDF rendering), QRCode (ID card verification)

---

## Directory Structure

```
/
├── database/
│   ├── schema.sql           # Database schema tables, relations, and indexes
│   └── seed.sql             # SQL seeding script with rich demo datasets
│
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database pool config
│   │   ├── controllers/     # API request handlers (Auth, Admin, Student, HOD, Faculty, Events)
│   │   ├── middleware/      # JWT protection, RBAC validation, error handler
│   │   ├── repositories/    # Repository Pattern database operations
│   │   ├── routes/          # Express API route mapping
│   │   ├── services/        # PDF generation, QR Code generation, email logging
│   │   ├── types/           # Custom Express typing overrides
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express instantiation
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router (Landing page, Auth, Dashboards, Verify-id)
    │   ├── components/      # Role-specific dashboard layouts and views
    │   ├── lib/             # HTTP Axios client with interceptors
    │   ├── types/           # Type declarations for API objects
    │   └── globals.css      # Tailwind v4 configuration, themes, and animations
    ├── package.json
    └── next.config.ts
```

---

## Environment Variables

### Backend Configuration
Create a `backend/.env` file with the following variables:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/college
JWT_SECRET=development_jwt_access_secret_key_extremely_long_random_string_12345
JWT_REFRESH_SECRET=development_jwt_refresh_secret_key_extremely_long_random_string_12345
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Frontend Configuration
Create a `frontend/.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Database Setup (PostgreSQL & Supabase)

### Option A: Supabase Setup (Recommended)
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the project dashboard, navigate to the **SQL Editor**.
3. Copy the contents of [database/schema.sql](file:///d:/smart%20college%20management%20system/database/schema.sql) and execute the query.
4. Copy the contents of [database/seed.sql](file:///d:/smart%20college%20management%20system/database/seed.sql) and execute the query to populate demo accounts.
5. In your project settings, copy the **Transaction Connection String** (URI format) and paste it into `backend/.env` as `DATABASE_URL`.

### Option B: Local PostgreSQL Setup
1. Create a database named `college` in PostgreSQL.
2. Run the migration script:
   ```bash
   psql -U postgres -d college -f database/schema.sql
   ```
3. Run the seeding script:
   ```bash
   psql -U postgres -d college -f database/seed.sql
   ```

---

## Launch Instructions

### 1. Run the Backend API
Navigate to the `backend/` directory:
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5000`. If the database is not connected, it will boot up in **fallback mock mode** so you can preview the frontend application immediately.

### 2. Run the Frontend Dashboard
Navigate to the `frontend/` directory in a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Next.js client will launch on `http://localhost:3000`.

---

## Demo Evaluation Accounts
All test accounts are configured with the password `password123`:

- **Admin Account**: `admin@college.edu` (Manages student, faculty, and department records)
- **Student Account**: `student1@college.edu` (Accesses gradebook, attendance sheets, apply leave, digital ID card)
- **Faculty Account**: `cse.faculty1@college.edu` (Marks subject attendance, uploads student grades, approves leaves)
- **HOD Account**: `cse.hod@college.edu` (Accesses department statistics and manages timetables)
- **Placement Officer**: `placement@college.edu` (Posts corporate job roles and reviews applicant shortlists)
