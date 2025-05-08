import { getConversionRate } from "../actions/budget.actions";
import prisma from "../prisma";
import { ApiError } from "../utils/ApiError";

export class InsightService {
  static async getBudgetInsights(budgetId: string, userId: string) {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId, userId },
      include: {
        expenses: { include: { currency: true } },
        category: true,
        currency: true,
        user: true,
      },
    });

    if (!budget) {
      throw new ApiError(404, "Budget not found");
    }

    let totalSpent = 0;
    for (const expense of budget.expenses) {
      const conversionRate =
        expense.currency.code === budget.currency.code
          ? 1
          : await getConversionRate(
              expense.currency.code,
              budget.currency.code
            );
      totalSpent += expense.amount.toNumber() * conversionRate;
    }

    const remaining = budget.amount.toNumber() - totalSpent;
    const spendingPercentage = (totalSpent / budget.amount.toNumber()) * 100;
    const status =
      spendingPercentage < 50
        ? "safe"
        : spendingPercentage < 75
        ? "warning"
        : "danger";

    const daysPassed = Math.max(
      1,
      Math.floor(
        (new Date().getTime() - new Date(budget.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const dailyAverage = totalSpent / daysPassed;
    const budgetDurationDays = Math.max(
      1,
      Math.floor(
        (new Date(budget.endDate).getTime() -
          new Date(budget.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const targetDailyAverage = budget.amount.toNumber() / budgetDurationDays;

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

    return {
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
      dailyAverage,
      targetDailyAverage,
    };
  }
}
