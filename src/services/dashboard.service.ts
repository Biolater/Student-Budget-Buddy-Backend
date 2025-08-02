import { getConversionRate } from "../actions/budget.actions";
import prisma from "../prisma";
import type {
  GetDashboardSummaryParams,
  GetSpendingByCategoryParams,
  GetSpendingTrendsParams,
GetUpcomingFinancialEventsParams,
} from "../types/dashboard.types";
import { ApiError } from "../utils/ApiError";
import { DateTime } from "luxon"; // Ensure luxon is installed and imported

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
        const conversionRate = await getConversionRate(budget.currency.code, defaultCurrency);
        totalBudget += budget.amount.toNumber() * conversionRate;
      }
    }

    for (const expense of expenses) {
      if (expense.currency.code === defaultCurrency) {
        totalExpenses += expense.amount.toNumber();
      } else {
        const conversionRate = await getConversionRate(expense.currency.code, defaultCurrency);
        totalExpenses += expense.amount.toNumber() * conversionRate;
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
  static getSpendingTrends = async (params: GetSpendingTrendsParams) => {
    const { timePeriod, userId } = params;
    let startDate = undefined;
    let endDate = undefined;

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

    if (timePeriod === "last6Months") {
      startDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 6,
        1
      );
      endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (timePeriod === "currentYear") {
      startDate = new Date(new Date().getFullYear(), 0, 1);
      endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }

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

    const transformedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        let amount = expense.amount.toNumber();
        if (expense.currency.code !== defaultCurrency) {
          const conversionRate = await getConversionRate(
            expense.currency.code,
            defaultCurrency
          );
          amount *= conversionRate;
        }
        return {
          ...expense,
          amount,
        };
      })
    );

    interface trendLine {
      month: string;
      totalSpending: number;
    }

    const groupedExpenses = transformedExpenses.reduce((acc, expense) => {
      const month = expense.date.getMonth() + 1;
      const year = expense.date.getFullYear();
      const key = `${year}-${month}`;
      const existingMonth = acc.find((line) => line.month === key);
      if (existingMonth) {
        existingMonth.totalSpending += expense.amount;
      } else {
        acc.push({ month: key, totalSpending: expense.amount });
      }
      return acc;
    }, [] as trendLine[]);

    return groupedExpenses;
  };
  static getSpendingByCategory = async (
    params: GetSpendingByCategoryParams
  ) => {
    const { userId, timePeriod } = params;
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
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

    let startDate = undefined;
    let endDate = undefined;

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

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        userId,
      },
      include: {
        category: true,
        currency: true,
      },
    });

    const transformedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        let amount = expense.amount.toNumber();
        if (expense.currency.code !== defaultCurrency) {
          const conversionRate = await getConversionRate(
            expense.currency.code,
            defaultCurrency
          );
          amount *= conversionRate;
        }
        return {
          ...expense,
          amount,
        };
      })
    );

    const groupedExpenses = transformedExpenses.reduce((acc, expense) => {
      const existingCategory = acc.find(
        (line) => line.category === expense.category.name
      );
      if (existingCategory) {
        existingCategory.totalSpending += expense.amount;
      } else {
        acc.push({
          category: expense.category.name,
          totalSpending: expense.amount,
        });
      }
      return acc;
    }, [] as { category: string; totalSpending: number }[]);

    return groupedExpenses;
  };
  static getUpcomingFinancialEvents = async (
    params: GetUpcomingFinancialEventsParams
  ) => {
    const { userId, limit, daysAhead, isActive } = params;

    const now = DateTime.now().toUTC(); // Current UTC date and time
    const futureDate = now.plus({ days: daysAhead }).toUTC(); // Date 'daysAhead' from now

    try {
      const events = await prisma.financialEvent.findMany({
        where: {
          userId: userId,
          nextDueDate: {
            gte: now.startOf("day").toISO(), // Start of today (UTC)
            lte: futureDate.endOf("day").toISO(), // End of the target future date (UTC)
          },
          isActive: isActive, // Use the validated boolean directly
        },
        include: {
          currency: {
            select: {
              code: true,
              symbol: true,
            },
          },
          budgetCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          nextDueDate: "asc", // Order by the nearest upcoming date first
        },
        take: limit, // Apply the limit
      });

      const formattedEvents = events.map((event) => ({
        ...event,
        amount: event.amount.toNumber(),
      }));

      return formattedEvents;
    } catch (error: any) {
      console.error(
        `Error in DashboardService.getUpcomingFinancialEvents:`,
        error
      );
      throw new ApiError(
        500,
        `Failed to fetch upcoming financial events: ${
          error.message || "Unknown error"
        }`
      );
    }
  };
}
