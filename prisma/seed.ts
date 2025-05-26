/* import { add, eachDayOfInterval } from "date-fns";
import prisma from "../src/prisma";
import { Prisma } from "@prisma/client";

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────
const USER_ID = "user_2xXI5qscsOKywHrlmid2yU32VmW";
const CURRENCY_ID = "usd-id"; // must exist in your `Currency` table
const TODAY = new Date("2025-05-26"); // keep expenses ≤ today
const START_MONTH = new Date("2024-01-01"); // first budget month

// Expense & Budget categories share the *exact* same IDs now
const CATEGORIES = [
  { id: "education-id", name: "Education", icon: "📚" },
  { id: "entertainment-id", name: "Entertainment", icon: "🎮" },
  { id: "food-id", name: "Food", icon: "🍔" },
  { id: "gifts-id", name: "Gifts & Donations", icon: "🎁" },
  { id: "health-id", name: "Health", icon: "⚕️" },
  { id: "income-id", name: "Income", icon: "💰" },
  { id: "personal-care-id", name: "Personal Care", icon: "🧴" },
  { id: "rent-id", name: "Rent", icon: "🏠" },
  { id: "savings-id", name: "Savings", icon: "💾" },
  { id: "shopping-id", name: "Shopping", icon: "🛍️" },
  { id: "subscriptions-id", name: "Subscriptions", icon: "📺" },
  { id: "transport-id", name: "Transport", icon: "🚌" },
  { id: "travel-id", name: "Travel", icon: "✈️" },
];

// convenience maps
const EXP_CAT = CATEGORIES;
const BUD_CAT = CATEGORIES;

// Recurring financial events (examples)
const RECURRING = [
  { name: "Monthly Rent", amount: 500, cat: "bud_rent", freq: "MONTHLY" },
  {
    name: "Mobile & Internet Bill",
    amount: 45,
    cat: "bud_utilities",
    freq: "MONTHLY",
  },
  {
    name: "Semester Tuition",
    amount: 800,
    cat: "bud_education",
    freq: "SEMESTERLY",
  },
  { name: "Gym Membership", amount: 25, cat: "bud_health", freq: "MONTHLY" },
  {
    name: "Weekly Public Transport",
    amount: 15,
    cat: "bud_transport",
    freq: "WEEKLY",
  },
];

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────
const dec = (n: number) => new Prisma.Decimal(n.toFixed(2));
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// ────────────────────────────────────────────────────────────
// 2) BUDGETS (MONTHLY + QUARTERLY + YEARLY)
// ────────────────────────────────────────────────────────────
async function seedBudgets() {
  const budgets: {
    id: string;
    budgetCategoryId: string;
    startDate: Date;
    endDate: Date;
  }[] = [];

  // Monthly budgets Jan-24 → May-25
  let pointer = new Date(START_MONTH);
  while (pointer <= TODAY) {
    const monthStart = new Date(pointer);
    const monthEnd = add(monthStart, { months: 1, days: -1 });

    for (const bc of BUD_CAT) {
      const id = crypto.randomUUID();
      await prisma.budget.upsert({
        where: { id }, // id doesn't exist yet – acts as create
        update: {},
        create: {
          id,
          userId: USER_ID,
          budgetCategoryId: bc.id,
          currencyId: CURRENCY_ID,
          amount: dec(rand(100, 800)),
          periodType: "MONTHLY",
          description: `Monthly ${bc.name} budget`,
          startDate: monthStart,
          endDate: monthEnd,
        },
      });
      budgets.push({
        id,
        budgetCategoryId: bc.id,
        startDate: monthStart,
        endDate: monthEnd,
      });
    }
    pointer = add(pointer, { months: 1 });
  }

  // Year-2024 & Year-2025 overall budgets (one per cat)
  for (const year of [2024, 2025]) {
    const yStart = new Date(`${year}-01-01`);
    const yEnd = new Date(`${year}-12-31`);
    for (const bc of BUD_CAT) {
      const id = `${year}-${bc.id}`;
      await prisma.budget.upsert({
        where: { id },
        update: {},
        create: {
          id,
          userId: USER_ID,
          budgetCategoryId: bc.id,
          currencyId: CURRENCY_ID,
          amount: dec(rand(1200, 8000)),
          periodType: "YEARLY",
          description: `${year} overall ${bc.name} budget`,
          startDate: yStart,
          endDate: yEnd,
        },
      });
    }
  }

  return budgets;
}

// ────────────────────────────────────────────────────────────
// 3) EXPENSES  (10-30 / month / category ≈ 12k rows)
// ────────────────────────────────────────────────────────────
async function seedExpenses(budgets: Awaited<ReturnType<typeof seedBudgets>>) {
  for (const b of budgets) {
    const days = eachDayOfInterval({
      start: b.startDate,
      end: b.endDate,
    }).filter((d) => d <= TODAY); // never future
    const expenseCount = Math.floor(rand(10, 30));

    for (let i = 0; i < expenseCount; i++) {
      const when = days[Math.floor(rand(0, days.length))];
      const expCat =
        EXP_CAT.find(
          (c) => c.id.replace("cat_", "bud_") === b.budgetCategoryId
        ) ?? EXP_CAT[Math.floor(rand(0, EXP_CAT.length))];

      await prisma.expense.create({
        data: {
          userId: USER_ID,
          date: when,
          amount: dec(rand(3, 120)),
          currencyId: CURRENCY_ID,
          budgetId: b.id,
          expenseCategoryId: expCat!.id,
          description: `${expCat!.name} spend`,
        },
      });
    }
  }
}

// ────────────────────────────────────────────────────────────
// 4) FINANCIAL EVENTS  (recurring)
// ────────────────────────────────────────────────────────────
async function seedEvents() {
  for (const ev of RECURRING) {
    const existing = await prisma.financialEvent.findFirst({
      where: { userId: USER_ID, name: ev.name },
    });
    if (existing) continue; // already seeded

    await prisma.financialEvent.create({
      data: {
        userId: USER_ID,
        name: ev.name,
        nextDueDate: TODAY,
        amount: dec(ev.amount),
        description: ev.name,
        currencyId: CURRENCY_ID,
        budgetCategoryId: ev.cat,
        frequency: ev.freq as any,
      },
    });
  }
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
async function main() {
  console.time("💾  Seeding big data");
  const budgets = await seedBudgets();
  await seedExpenses(budgets);
  await seedEvents();
  console.timeEnd("💾  Seeding big data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
 */
