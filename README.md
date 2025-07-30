<h1 align="center">🧠 Student Budget Buddy Backend (API & Intelligence Core)</h1>
<p align="center">
    <i>The intelligent engine behind personalized budgeting and financial insight for students and beyond.</i>
</p>

<p align="center">
    <img src="../frontend/banner.png" alt="Student Budget Buddy Banner" width="600" />
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/Clerk-Auth-orange?style=flat-square&logo=clerk" />
    <img src="https://img.shields.io/badge/AI%20Integration-OpenAI-blueviolet?style=flat-square&logo=openai" />
    <img src="https://img.shields.io/badge/Status-In%20Progress-yellow?style=flat-square" />
</p>

---

## ⚙️ Purpose

This repository powers the backend services and financial intelligence for **Student Budget Buddy**, a modern personal finance platform. Unlike typical budgeting tools, this backend is purpose-built for:

- 🚀 Performing **advanced financial analytics** and delivering **personalized insights**
- 💡 Powering **AI-driven budget recommendations** using OpenAI
- 💱 Handling **multi-currency expenses and budgeting** with real-time exchange logic
- 📊 Delivering intelligent **dashboard summaries**, forecasts, and spending insights
- 🔐 Securing all operations with **Clerk-authenticated** APIs

---

## 🧩 Core Backend Responsibilities

- **AI-Driven Insights:** Seamlessly integrated with OpenAI to provide contextual budgeting advice and financial summaries.
- **Currency Intelligence:** Dynamic multi-currency handling for budgets, transactions, and analytics.
- **Dashboard Aggregation:** Real-time computation of user financial health, trends, savings rates, and top categories.
- **Insight APIs:** Fine-grained spending analysis including overspending warnings and category breakdowns.
- **Advanced Budgeting:** Support for varied budget periods (monthly, semesterly, custom) with automated tracking and projections.
- **Recurring Events & Forecasting:** Logic to handle recurring income/expenses and predict future financial outlook.
- **Clerk-Integrated Authentication:** Secure identity management on every API interaction.

---

## 🔑 Key Features (Backend)

| Feature                        | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **✅ AI-Powered Budget Insights** | Uses OpenAI API to analyze patterns and provide contextual budget suggestions. |
| **💵 Multi-Currency Support**      | Exchange-aware budget and expense logic, aligned to user's base currency.       |
| **📊 Dashboard Summary API**      | Aggregates income, expenses, trends, savings rate, upcoming events.            |
| **📈 Trend Analysis API**         | Visualizable trends in monthly/yearly spending.                                |
| **📂 Category Breakdown API**     | Tracks where money goes — food, housing, transport, etc.                        |
| **🔁 Recurring Financial Events** | Handles logic for auto-repeating expenses (rent, subscriptions, salary).       |
| **🔐 Clerk-Based Auth**           | Auth required for every route via secure session token.                        |

---

## 📦 Tech Stack

| Runtime       | Language   | ORM     | Database    | Auth    | AI |
|---------------|------------|---------|-------------|---------|----|
| Node.js + Express | TypeScript | Prisma  | PostgreSQL  | Clerk   | OpenAI |

---

## 📌 Project Status

> 🛠️ **Actively Developed**  
The backend is now fully functional for most use cases: budget tracking, dashboard summaries, multi-currency conversion, and AI integration. Current efforts focus on refining financial forecasts, edge-case coverage, and resilience under scale.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18  
- npm ≥ 9  
- PostgreSQL running locally or via cloud (e.g., Supabase, Railway)  
- Prisma CLI (`npm install -g prisma`)  
- Clerk account & API keys  
- OpenAI API key (for intelligent insights)

### Setup Instructions

```bash
# 1. Clone the repo
git clone https://github.com/muradyusubov/student-budget-buddy.git
cd student-budget-buddy/backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Add PostgreSQL URI, Clerk API keys, OpenAI keys, etc.

# 4. Push the schema to your database
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the dev server
npm run dev
