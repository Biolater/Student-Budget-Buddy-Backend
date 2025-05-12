<h1 align="center">🧠 Student Budget Buddy Backend (API & Logic)</h1>
<p align="center">
    <i>The engine powering intelligent financial management for students.</i>
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
    <img src="https://img.shields.io/badge/Status-In%20Progress-yellow?style=flat-square" />
</p>

---

## ⚙️ Purpose

This repository houses the backend API and the core business logic for the Student Budget Buddy application. While the frontend (built with Next.js) handles user interface and basic data operations, this backend is responsible for:

- **Complex Data Processing:** Aggregating, calculating, and transforming data to generate meaningful financial insights.
- **Business Logic Implementation:** Enforcing the rules and functionalities of the application, such as budget calculations and future goal tracking.
- **Advanced Database Interactions:** Performing intricate queries and data manipulations using Prisma.
- **Integration with External Services:** Communicating with currency exchange rate APIs and future AI-powered services.
- **Ensuring Scalability and Performance:** Providing a robust and scalable foundation for the application.
- **Security:** Implementing secure authentication and data handling practices.

---

## 🚀 Key Features (Backend)

- **Multi-Currency Support:** Provides API endpoints and logic to handle expenses and budgets in various currencies, ensuring accurate conversions and reporting.
- **Budget Management APIs:** Offers comprehensive API endpoints for creating, reading, updating, and deleting budgets, with logic for handling different budget periods.
- **Dashboard Summary API:** Powers the top-level overview on the user dashboard, providing aggregated data on total budget, spending, and remaining funds.
- **Future AI Integration:** Designed with extensibility in mind to seamlessly integrate AI-powered features for savings suggestions and budget insights.
- **Secure Authentication:** Leverages Clerk for secure user authentication and authorization.

---

## 🛠️ Tech Stack

| Backend             | Language   | ORM     | Database    | Auth    |
|----------------------|------------|---------|-------------|---------|
| Node.js, Express.js | TypeScript | Prisma  | PostgreSQL  | Clerk   |

---

## 📌 Project Status

🚧 The Student Budget Buddy backend is under **active development**, focused on building robust and efficient APIs to power the frontend experience. Current efforts are centered around providing core budgeting functionalities and laying the groundwork for future intelligent features.

---

## ⚙️ Getting Started

**Prerequisites:**

- Node.js (>= 18)
- npm (>= 9)
- PostgreSQL installed and running
- Prisma CLI installed (`npm install -g prisma`)
- Clerk account and API keys

**Setup:**

```bash
# 1. Clone the repository
git clone [https://github.com/muradyusubov/student-budget-buddy.git](https://github.com/muradyusubov/student-budget-buddy.git)
cd student-budget-buddy/backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Fill in your PostgreSQL connection string, Clerk API keys, etc. in the .env file

# 4. Push the Prisma schema to your database
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. Build the project
npm run build

# 7. Run the development server
npm run dev
