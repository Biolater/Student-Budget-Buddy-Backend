export class ContextUtils {
  static analyzeQuery(message: string) {
    const lowerMessage = message.toLowerCase();
    
    return {
      needsBudgets: /budget|spending limit|allocation|allowance/i.test(message),
      needsExpenses: /expense|spent|spending|cost|purchase|buy|bought/i.test(message),
      needsRecurring: /recurring|subscription|monthly|weekly|automatic|regular/i.test(message),
      needsCategories: /category|categories|type|kind/i.test(message),
      needsTimeframe: /month|week|year|period|time|recent|last|this/i.test(message),
      isAdviceRequest: /advice|help|suggest|recommend|should|what|how/i.test(message),
      isSummaryRequest: /summary|overview|total|balance|status/i.test(message)
    };
  }

  static getOptimizedQueries(userId: string, analysis: ReturnType<typeof ContextUtils.analyzeQuery>) {
    const queries: any = {};

    // Always include basic summary
    queries.summary = true;

    if (analysis.needsBudgets || analysis.isAdviceRequest) {
      queries.budgets = {
        where: { userId },
        select: {
          amount: true,
          periodType: true,
          category: { select: { name: true, type: true } },
          currency: { select: { code: true } },
          expenses: {
            select: { amount: true },
            where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
          }
        }
      };
    }

    if (analysis.needsExpenses || analysis.isAdviceRequest) {
      const limit = analysis.needsTimeframe ? 20 : 10;
      queries.expenses = {
        where: { userId },
        select: {
          amount: true,
          date: true,
          description: true,
          category: { select: { name: true } },
          currency: { select: { code: true } }
        },
        orderBy: { date: 'desc' },
        take: limit
      };
    }

    if (analysis.needsRecurring || analysis.isAdviceRequest) {
      queries.financialEvents = {
        where: { userId, isActive: true },
        select: {
          name: true,
          amount: true,
          frequency: true,
          type: true,
          nextDueDate: true,
          budgetCategory: { select: { name: true } },
          currency: { select: { code: true } }
        },
        take: 8
      };
    }

    return queries;
  }

  static formatContextData(data: any, analysis: ReturnType<typeof ContextUtils.analyzeQuery>) {
    let context = '';

    if (data.budgets && analysis.needsBudgets) {
      const budgetSummary = data.budgets.map((budget: any) => {
        const spent = budget.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0;
        return `• ${budget.category.name}: ${budget.amount} ${budget.currency.code} (${spent} spent, ${Number(budget.amount) - spent} remaining)`;
      }).join('\n');
      
      context += `BUDGETS:\n${budgetSummary}\n\n`;
    }

    if (data.expenses && analysis.needsExpenses) {
      const expenseList = data.expenses.slice(0, 5).map((exp: any) => 
        `• ${exp.date.toISOString().split('T')[0]}: ${exp.amount} ${exp.currency.code} - ${exp.category.name}`
      ).join('\n');
      
      context += `RECENT EXPENSES:\n${expenseList}\n\n`;
    }

    if (data.financialEvents && analysis.needsRecurring) {
      const eventList = data.financialEvents.map((event: any) => 
        `• ${event.name}: ${event.amount} ${event.currency.code} - ${event.frequency}`
      ).join('\n');
      
      context += `RECURRING EVENTS:\n${eventList}\n\n`;
    }

    if (data.summary) {
      context += `SUMMARY: Income: ${data.summary.totalIncome}, Expenses: ${data.summary.totalExpenses}, Balance: ${data.summary.balance}\n\n`;
    }

    return context;
  }
}