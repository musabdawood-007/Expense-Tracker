# Expense Tracker

A full-stack expense tracking application with bill splitting, budgets, goals, and 2-step email authentication.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Recharts
- **Backend:** Next.js API Routes, Mongoose 9
- **Database:** MongoDB Atlas
- **Auth:** bcrypt passwords + 6-digit OTP via Gmail SMTP
- **Deployment:** Vercel

## Features

- Dashboard with cash flow charts, category breakdowns, and insights
- Transaction CRUD with search and filtering
- Budget tracking with progress bars per category
- Savings goals with deadlines and progress
- Groups for tracking shared expenses
- Rooms for bill splitting with 6-digit join codes
- Reports with pie and bar charts
- CSV and JSON data export
- 2-step email verification (OTP)
- Multi-currency support (PKR, USD, AED, INR, EUR)
- Responsive design (mobile + desktop)
- Dark/light theme toggle

## Environment Variables

Set these in your Vercel dashboard under **Settings > Environment Variables**:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://musabprojectsotpservice_db_user:Wb9CLENlQy0JZAkJ@expensedata.myfkyzz.mongodb.net` |
| `SMTP_EMAIL` | `musab.projects.otp.service@gmail.com` |
| `SMTP_PASS` | `zptj xodf exre peyq` |

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repo
4. Add the environment variables above
5. Deploy

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Account

- **Email:** demo@musab.dev
- **Password:** 123

Seed data is available at `POST /api/seed` with `userId` of the demo account.
