# Expense Tracker

> **Built by [Musab Projects](https://musab-007.netlify.app)** — a project group by Musab Dawood

A full-stack expense management application for tracking transactions, budgets, savings goals, shared expenses, and bill splitting. Built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Features

- Dashboard with cash-flow charts, category breakdowns, and financial insights
- Transaction creation, editing, searching, and filtering
- Category budget tracking with progress indicators
- Savings goals with deadlines and progress tracking
- Groups for shared-expense tracking
- Bill-splitting rooms with six-digit join codes
- Reports with pie and bar charts
- CSV and JSON data export
- Two-step email verification using OTP codes
- Multi-currency support for PKR, USD, AED, INR, and EUR
- Responsive mobile and desktop interface
- Dark and light themes

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.3.0 |
| Language | TypeScript 5 |
| UI | React 19.2.8 |
| Styling | Tailwind CSS 4 |
| Database | MongoDB with Mongoose 9.9.1 |
| Authentication | bcryptjs and email OTP |
| Charts | Recharts 3.10.1 |
| Icons | Lucide React |
| Animation | Framer Motion |
| Email | Nodemailer |
| Deployment | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB or MongoDB Atlas
- SMTP credentials for email verification

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Create a `.env.local` file and configure the variables used by the application, including your MongoDB connection string, authentication secret, and SMTP credentials. Never commit secrets to Git.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy to Vercel by importing this repository, configuring the required environment variables, and starting a production deployment.

## License

Built by [Musab Projects](https://musab-007.netlify.app) — a project group by Musab Dawood.
