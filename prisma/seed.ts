import prisma from "../src/prisma";

async function main() {
  const currencies = [
    { id: "usd-id", name: "US Dollar", symbol: "$", code: "USD" },
    { id: "eur-id", name: "Euro", symbol: "€", code: "EUR" },
    { id: "gbp-id", name: "British Pound", symbol: "£", code: "GBP" },
    { id: "azn-id", name: "Azerbaijani Manat", symbol: "₼", code: "AZN" },
    { id: "cad-id", name: "Canadian Dollar", symbol: "$", code: "CAD" },
    { id: "aud-id", name: "Australian Dollar", symbol: "$", code: "AUD" },
    { id: "jpy-id", name: "Japanese Yen", symbol: "¥", code: "JPY" },
    { id: "inr-id", name: "Indian Rupee", symbol: "₹", code: "INR" },
    { id: "cny-id", name: "Chinese Yuan", symbol: "¥", code: "CNY" },
    { id: "try-id", name: "Turkish Lira", symbol: "₺", code: "TRY" },
  ];

  const categories = [
    { id: "food-id", name: "Food", icon: "🍔" },
    { id: "transport-id", name: "Transport", icon: "🚗" },
    { id: "rent-id", name: "Rent", icon: "🏠" },
    { id: "entertainment-id", name: "Entertainment", icon: "🎮" },
    { id: "utilities-id", name: "Utilities", icon: "💡" },
    { id: "education-id", name: "Education", icon: "🎓" },
    { id: "subscriptions-id", name: "Subscriptions", icon: "📺" },
    { id: "shopping-id", name: "Shopping", icon: "🛍️" },
    { id: "health-id", name: "Health", icon: "🏥" },
    { id: "personal-care-id", name: "Personal Care", icon: "🧴" },
    { id: "income-id", name: "Income", icon: "💰" },
    { id: "savings-id", name: "Savings", icon: "🏦" },
    { id: "travel-id", name: "Travel", icon: "✈️" },
    { id: "gifts-id", name: "Gifts & Donations", icon: "🎁" },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { id: currency.id },
      update: {},
      create: currency,
    });
  }

  for (const category of categories) {
    await prisma.expenseCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });

    await prisma.budgetCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });