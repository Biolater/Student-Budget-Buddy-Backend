import { getConversionRate } from "../actions/budget.actions";
import prisma from "../prisma";
import { GetDashboardSummaryParams } from "../types/dashboard.types";
import { ApiError } from "../utils/ApiError";

export class DashboardService {
  static getSummary = async (params: GetDashboardSummaryParams) => {
    const { userId, timePeriod } = params;

    let startDate = undefined;
    let endDate = undefined;
    let totalBudget = 0;
    let totalExpenses = 0;

    if (timePeriod === "currentMonth") {
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      endDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      );
    } else if (timePeriod === "previousMonth") {
      startDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        1
      );
      endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (timePeriod === "allTime") {
      startDate = undefined;
      endDate = undefined;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        baseCurrency: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const defaultCurrency = user.baseCurrency.code || "USD";

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        startDate: startDate ? { lte: endDate } : undefined, // Budget starts before or during the period end
        endDate: endDate ? { gte: startDate } : undefined, // Budget ends after or during the period start
      },
      include: {
        user: true,
        currency: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        userId,
      },
      include: {
        currency: true,
      },
    });

    for (const budget of budgets) {
      if (budget.currency.code === defaultCurrency) {
        totalBudget += budget.amount.toNumber();
      } else {
        totalBudget +=
          budget.amount.toNumber() *
          (await getConversionRate(budget.currency.code, defaultCurrency));
      }
    }

    for (const expense of expenses) {
      if (expense.currency.code === defaultCurrency) {
        totalExpenses += expense.amount.toNumber();
      } else {
        totalExpenses +=
          expense.amount.toNumber() *
          (await getConversionRate(expense.currency.code, defaultCurrency));
      }
    }

    const remainingFunds = totalBudget - totalExpenses;
    const savings = totalBudget - totalExpenses;

    return {
      totalBudget,
      totalExpenses,
      remainingFunds,
      savings,
    };
  };
}
