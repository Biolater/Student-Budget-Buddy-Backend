import { getConversionRate } from "../actions/budget.actions";
import prisma from "../prisma";

export class InsightService {
  static async getBudgetInsights(budgetId: string) {
    // Your logic here (fetch, calculate, return insights)
    try {
      const budget = await prisma.budget.findUnique({
        where: {
          id: budgetId,
        },
        include: {
          expenses: {
            include: {
              currency: true,
            },
          },
          category: true,
          currency: true,
          user: true,
        },
      });
      if (!budget) {
        throw new Error("Budget not found");
      }

      let totalSpent = 0;
      for (const expense of budget.expenses) {
        if (expense.currency.code === budget.currency.code) {
          totalSpent += expense.amount.toNumber();
        } else {
          const convertedAmount = await getConversionRate(
            expense.currency.code,
            budget.currency.code
          );
          totalSpent += convertedAmount;
        }
      }
      const remaining = budget.amount.toNumber() - totalSpent;
      const spendingPercentage = (totalSpent / budget.amount.toNumber()) * 100;
      const status: "safe" | "warning" | "danger" =
        spendingPercentage < 50
          ? "safe"
          : spendingPercentage < 75
          ? "warning"
          : "danger";
      let tip;

      if (status === "safe") {
        if (spendingPercentage < 50) {
          tip = "You're crushing it — well below your budget!";
        } else {
          tip = "You're on track. Keep it steady!";
        }
      } else if (status === "warning") {
        if (spendingPercentage < 90) {
          tip =
            "You're getting close to your budget limit. Keep an eye on your spending.";
        } else {
          tip = "Almost at the limit — time to slow down your expenses.";
        }
      } else {
        tip = "Budget exceeded. Try to cut back or adjust your spending.";
      }

      const data = {
        budgetId: budget.id,
        totalBudget: budget.amount.toNumber(),
        totalSpent,
        remaining,
        spendingPercentage,
        status,
        currency: budget.currency.code,
        user: budget.user,
        category: budget.category,
        tip,
      };

      return data;
    } catch (error) {
      throw error;
    }
  }
}
