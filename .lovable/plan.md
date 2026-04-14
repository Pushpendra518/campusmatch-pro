
# Internship & Placement Management System

## Overview
A full-stack web application using React + Supabase that allows students, admins (placement cell), faculty/mentors, and recruiters to manage internships and placements with real authentication, real database, and role-based dashboards.

## Authentication & User System
- Email/password signup & login via Supabase Auth
- Role selection during registration (student, admin, faculty, recruiter)
- User roles stored in a `user_roles` table (secure, not on profiles)
- Profiles table with name, email, role-specific fields
- Protected routes — each role redirected to their own dashboard
- Real user data displayed everywhere (no hardcoded names)

## Database Design (Supabase/PostgreSQL)
1. **profiles** — user_id, full_name, email, phone, department, resume_url, avatar_url
2. **user_roles** — user_id, role (enum: student, admin, faculty, recruiter)
3. **internships** — id, title, company, description, location, stipend, deadline, type, posted_by, status, created_at
4. **applications** — id, student_id, internship_id, status (pending/approved/rejected/shortlisted), cover_letter, applied_at
5. Row-Level Security (RLS) on all tables with role-based policies

## Pages & Features

### Public
- **Landing page** — hero, features overview, login/signup buttons
- **Login / Register** — role selection, form validation

### Student Dashboard
- View profile & edit details (name, department, resume upload)
- Browse available internships with search & filters
- Apply to internships with cover letter
- Track application status (pending, shortlisted, accepted, rejected)
- View application history

### Admin (Placement Cell) Dashboard
- Overview stats (total students, internships, applications)
- Create/edit/delete internships
- View all applications across all internships
- Manage users (view student/faculty/recruiter lists)
- Approve/reject applications

### Faculty/Mentor Dashboard
- View assigned students' applications
- Approve or reject student applications with comments
- View internship listings

### Recruiter Dashboard
- Post new internships (title, description, requirements, stipend, deadline)
- View applicants for their posted internships
- Shortlist/reject candidates
- View candidate profiles & resumes

## Security
- JWT-based auth via Supabase
- RLS policies enforcing role-based access
- `has_role()` security definer function to prevent recursive RLS
- Password hashing handled by Supabase Auth (bcrypt under the hood)
- Protected frontend routes with auth guards

## UI/UX
- Clean, professional design with Tailwind CSS
- Responsive layout (mobile-friendly)
- Sidebar navigation per role
- Toast notifications for actions
- Loading states and error handling throughout
