# Project Submission Portal

A modern web application for teams to submit their project materials, built with Next.js, Tailwind CSS, and Supabase.

## Features

- Modern, responsive UI with dark theme
- Secure file uploads for BMC and presentations
- Figma URL submission
- Admin dashboard for HR team
- Countdown timer for submission deadline
- Authentication for admin access
- File download capabilities for administrators

## Prerequisites

- Node.js 16.x or later
- Supabase account and project
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a Supabase project at https://supabase.com

4. Copy the `.env.local.example` to `.env.local` and update with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the database migrations:

   - Copy the contents of `supabase/migrations/initial_schema.sql`
   - Run it in your Supabase project's SQL editor

6. Create an admin user:

   - Go to Authentication > Users in your Supabase dashboard
   - Invite a new user with the HR team's email
   - The user will receive an email to set their password

7. Start the development server:

```bash
npm run dev
```

## Development

The application will be available at `http://localhost:3000`

- Main submission form: `/`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`

## Deployment

1. Push your code to your preferred Git provider (GitHub, GitLab, etc.)
2. Deploy to Vercel:
   - Connect your Git repository
   - Add environment variables
   - Deploy

## File Structure

```
├── src/
│   ├── app/
│   │   ├── page.js              # Main submission form
│   │   ├── admin/
│   │   │   ├── page.js          # Admin dashboard
│   │   │   └── login/
│   │   │       └── page.js      # Admin login
│   │   └── layout.js
│   ├── components/
│   │   └── CountdownTimer.js
│   ├── lib/
│   │   └── supabase.js
│   └── middleware.js
├── public/
│   ├── logo_nit_.png
│   └── white_logo
├── supabase/
│   └── migrations/
│       └── initial_schema.sql
└── .env.local
```

## Security

- File uploads are restricted to specific file types
- Admin routes are protected by authentication
- Row Level Security (RLS) is enabled in Supabase
- Environment variables are used for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
