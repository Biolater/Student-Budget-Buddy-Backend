import { FinancialEventFrequency } from "@prisma/client";
import prisma from "../src/prisma";
import { DateTime } from "luxon";

async function main() {
  const userId = "user_2tzGgKSTIna3divyi5T4ny0OOoW";

  console.log("Fetching existing Currency and BudgetCategory records...");

  // --- Fetch existing Currency records by their IDs ---
  const usdCurrency = await prisma.currency.findFirst({
    where: { name: "United States Dollar" },
  }); // Assuming no explicit ID was provided for USD
  const eurCurrency = await prisma.currency.findUnique({
    where: { id: "eur-id" },
  });
  const gbpCurrency = await prisma.currency.findUnique({
    where: { id: "gbp-id" },
  });
  const tryCurrency = await prisma.currency.findUnique({
    where: { id: "try-id" },
  });
  const aznCurrency = await prisma.currency.findUnique({
    where: { id: "azn-id" },
  });

  const currencies = {
    USD: usdCurrency,
    EUR: eurCurrency,
    GBP: gbpCurrency,
    TRY: tryCurrency,
    AZN: aznCurrency,
  };

  for (const [code, currency] of Object.entries(currencies)) {
    if (!currency) {
      console.error(
        `ERROR: Required Currency record not found: ${code}. Please ensure it exists with the correct ID/name.`
      );
      process.exit(1);
    }
  }

  // --- Fetch existing BudgetCategory records by their IDs ---
  const foodCategory = await prisma.budgetCategory.findUnique({
    where: { id: "food-id" },
  });
  const entertainmentCategory = await prisma.budgetCategory.findUnique({
    where: { id: "entertainment-id" },
  });
  const transportCategory = await prisma.budgetCategory.findUnique({
    where: { id: "transport-id" },
  });
  const healthCategory = await prisma.budgetCategory.findUnique({
    where: { id: "health-id" },
  });
  const educationCategory = await prisma.budgetCategory.findUnique({
    where: { id: "education-id" },
  });
  const clothingCategory = await prisma.budgetCategory.findUnique({
    where: { id: "clothing-id" },
  });
  const petsCategory = await prisma.budgetCategory.findUnique({
    where: { id: "pets-id" },
  });
  const travelCategory = await prisma.budgetCategory.findUnique({
    where: { id: "travel-id" },
  });
  const otherCategory = await prisma.budgetCategory.findUnique({
    where: { id: "other-id" },
  });

  const categories = {
    FOOD: foodCategory,
    ENTERTAINMENT: entertainmentCategory,
    TRANSPORT: transportCategory,
    HEALTH: healthCategory,
    EDUCATION: educationCategory,
    CLOTHING: clothingCategory,
    PETS: petsCategory,
    TRAVEL: travelCategory,
    OTHER: otherCategory,
  };

  for (const [name, category] of Object.entries(categories)) {
    if (!category) {
      console.error(
        `ERROR: Required BudgetCategory record not found: ${name}. Please ensure it exists with the correct ID.`
      );
      process.exit(1);
    }
  }

  console.log("Existing Currencies and Categories fetched successfully.");
  console.log("Seeding FinancialEvents for user:", userId);

  // Helper to get random amount
  const getRandomAmount = (min: number, max: number) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(2));

  // --- Financial Events Test Data ---
  const financialEvents = [
    // --- MONTHLY EVENTS ---
    {
      userId,
      name: "Rent Payment",
      nextDueDate: DateTime.local(2025, 5, 28, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due in 6 days
      amount: 1200.0,
      description: "Monthly apartment rent",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Student Loan",
      nextDueDate: DateTime.local(2025, 6, 5, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due in ~2 weeks
      amount: getRandomAmount(200, 400),
      description: "Monthly student loan payment",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.EDUCATION!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Internet Bill",
      nextDueDate: DateTime.local(2025, 6, 15, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due in ~3 weeks
      amount: getRandomAmount(50, 80),
      description: "Fiber internet bill",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Mobile Phone Bill",
      nextDueDate: DateTime.local(2025, 6, 22, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due in 1 month
      amount: getRandomAmount(30, 60),
      description: "Monthly phone subscription",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Spotify Subscription",
      nextDueDate: DateTime.local(2025, 5, 22, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due TODAY!
      amount: 10.99,
      description: "Premium music streaming",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.ENTERTAINMENT!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Electricity Bill",
      nextDueDate: DateTime.local(2025, 7, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due in >1 month
      amount: getRandomAmount(80, 150),
      description: "Utility payment",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },
    {
      userId,
      name: "Netflix Subscription",
      nextDueDate: DateTime.local(2025, 6, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(),
      amount: 15.99,
      description: "Video streaming service",
      currencyId: currencies.EUR!.id, // EUR
      budgetCategoryId: categories.ENTERTAINMENT!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: true,
    },

    // --- WEEKLY EVENTS ---
    {
      userId,
      name: "Weekly Allowance",
      nextDueDate: DateTime.local(2025, 5, 29, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Next Thursday
      amount: getRandomAmount(40, 70),
      description: "Pocket money",
      currencyId: currencies.USD!.id,
      budgetCategoryId: undefined, // No category
      frequency: FinancialEventFrequency.WEEKLY,
      isActive: true,
    },
    {
      userId,
      name: "Grocery Trip",
      nextDueDate: DateTime.local(2025, 5, 23, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Tomorrow
      amount: getRandomAmount(80, 120),
      description: "Weekly food shopping",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.FOOD!.id,
      frequency: FinancialEventFrequency.WEEKLY,
      isActive: true,
    },
    {
      userId,
      name: "Part-time Job Earnings",
      nextDueDate: DateTime.local(2025, 5, 24, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Saturday
      amount: getRandomAmount(150, 250),
      description: "Weekly income from tutoring",
      currencyId: currencies.USD!.id,
      budgetCategoryId: undefined,
      frequency: FinancialEventFrequency.WEEKLY,
      isActive: true,
    },

    // --- DAILY EVENTS ---
    {
      userId,
      name: "Daily Coffee",
      nextDueDate: DateTime.local(2025, 5, 22, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Due TODAY!
      amount: getRandomAmount(3, 7),
      description: "Morning coffee fix",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.FOOD!.id,
      frequency: FinancialEventFrequency.DAILY,
      isActive: true,
    },
    {
      userId,
      name: "Lunch Money",
      nextDueDate: DateTime.local(2025, 5, 23, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Tomorrow
      amount: getRandomAmount(10, 15),
      description: "Daily lunch budget",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.FOOD!.id,
      frequency: FinancialEventFrequency.DAILY,
      isActive: true,
    },

    // --- QUARTERLY EVENTS ---
    {
      userId,
      name: "Car Insurance",
      nextDueDate: DateTime.local(2025, 8, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Q3 payment
      amount: getRandomAmount(250, 400),
      description: "Quarterly car insurance premium",
      currencyId: currencies.GBP!.id, // GBP
      budgetCategoryId: categories.TRANSPORT!.id,
      frequency: FinancialEventFrequency.QUARTERLY,
      isActive: true,
    },
    {
      userId,
      name: "Property Tax",
      nextDueDate: DateTime.local(2025, 9, 30, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Q4 payment
      amount: getRandomAmount(100, 200),
      description: "Quarterly property tax installment",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.QUARTERLY,
      isActive: true,
    },

    // --- SEMESTERLY EVENTS ---
    {
      userId,
      name: "Fall Tuition Fee",
      nextDueDate: DateTime.local(2025, 9, 15, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Fall semester
      amount: getRandomAmount(4000, 6000),
      description: "University tuition for Fall semester",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.EDUCATION!.id,
      frequency: FinancialEventFrequency.SEMESTERLY,
      isActive: true,
    },
    {
      userId,
      name: "Spring Tuition Fee",
      nextDueDate: DateTime.local(2026, 2, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Next year's Spring semester
      amount: getRandomAmount(4000, 6000),
      description: "University tuition for Spring semester",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.EDUCATION!.id,
      frequency: FinancialEventFrequency.SEMESTERLY,
      isActive: true,
    },

    // --- YEARLY EVENTS ---
    {
      userId,
      name: "Annual Software License",
      nextDueDate: DateTime.local(2026, 1, 10, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Next year
      amount: getRandomAmount(80, 150),
      description: "Adobe Creative Cloud annual fee",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.YEARLY,
      isActive: true,
    },
    {
      userId,
      name: "Travel Insurance",
      nextDueDate: DateTime.local(2025, 7, 20, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Upcoming travel
      amount: getRandomAmount(50, 100),
      description: "Annual travel insurance policy",
      currencyId: currencies.EUR!.id, // EUR
      budgetCategoryId: categories.TRAVEL!.id,
      frequency: FinancialEventFrequency.YEARLY,
      isActive: true,
    },
    {
      userId,
      name: "Pet Vaccination",
      nextDueDate: DateTime.local(2025, 11, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Late in year
      amount: getRandomAmount(70, 120),
      description: "Annual vet visit for vaccines",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.PETS!.id,
      frequency: FinancialEventFrequency.YEARLY,
      isActive: true,
    },

    // --- CUSTOM / ONE-TIME EVENTS ---
    {
      userId,
      name: "Concert Tickets",
      nextDueDate: DateTime.local(2025, 6, 12, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // One-time event
      amount: getRandomAmount(80, 150),
      description: "Tickets for favorite band concert",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.ENTERTAINMENT!.id,
      frequency: FinancialEventFrequency.CUSTOM,
      isActive: true,
    },
    {
      userId,
      name: "New Laptop Fund",
      nextDueDate: DateTime.local(2025, 10, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Saving goal
      amount: 700.0,
      description: "Target date to buy a new laptop",
      currencyId: currencies.TRY!.id, // TRY
      budgetCategoryId: undefined,
      frequency: FinancialEventFrequency.CUSTOM,
      isActive: true,
    },
    {
      userId,
      name: "Birthday Gift for Friend",
      nextDueDate: DateTime.local(2025, 7, 5, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(),
      amount: getRandomAmount(20, 50),
      description: "Gift for friend's birthday",
      currencyId: currencies.AZN!.id, // AZN
      budgetCategoryId: categories.OTHER!.id,
      frequency: FinancialEventFrequency.CUSTOM,
      isActive: true,
    },

    // --- INACTIVE EVENTS (should not show by default) ---
    {
      userId,
      name: "Past Due Inactive Subscription",
      nextDueDate: DateTime.local(2025, 4, 15, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Past date
      amount: 25.0,
      description: "Subscription that was cancelled",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.ENTERTAINMENT!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: false,
    },
    {
      userId,
      name: "Future Inactive Loan",
      nextDueDate: DateTime.local(2025, 12, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(), // Future date, but inactive
      amount: 100.0,
      description: "Loan payment, but account is closed",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.EDUCATION!.id,
      frequency: FinancialEventFrequency.MONTHLY,
      isActive: false,
    },
    {
      userId,
      name: "Inactive Food Budget Item",
      nextDueDate: DateTime.local(2025, 6, 1, 0, 0, 0, {
        zone: "utc",
      }).toJSDate(),
      amount: getRandomAmount(5, 15),
      description: "Daily snack budget - discontinued",
      currencyId: currencies.USD!.id,
      budgetCategoryId: categories.FOOD!.id,
      frequency: FinancialEventFrequency.DAILY,
      isActive: false,
    },
  ];

  for (const eventData of financialEvents) {
    // Only create if it doesn't already exist to prevent duplicates if you run seed multiple times
    const existingEvent = await prisma.financialEvent.findFirst({
      where: {
        userId: eventData.userId,
        name: eventData.name,
        // Match on a few key fields to determine uniqueness for seeding
        nextDueDate: eventData.nextDueDate,
        amount: eventData.amount,
        frequency: eventData.frequency,
      },
    });

    if (!existingEvent) {
      await prisma.financialEvent.create({ data: eventData });
      console.log(`Created FinancialEvent: ${eventData.name}`);
    } else {
      console.log(`Skipping existing FinancialEvent: ${eventData.name}`);
    }
  }

  console.log(`Seeding finished for user ${userId}.`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
