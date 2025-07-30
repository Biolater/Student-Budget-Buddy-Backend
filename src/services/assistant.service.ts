import prisma from "../prisma";
import openai from "../openai";
import { DashboardService } from "./dashboard.service";

interface FinancialSummary {
  totalBudget: number;
  totalExpenses: number;
  remainingFunds: number;
  savings: number;
}

interface BudgetInsight {
  category: string;
  type: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  utilizationRate: number;
  period: string;
  currency: string;
  status: 'healthy' | 'warning' | 'overspent';
}

interface ExpenseInsight {
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  isRecent: boolean;
}

interface FinancialEventInsight {
  name: string;
  amount: number;
  type: string;
  frequency: string;
  nextDue: string;
  category: string;
  currency: string;
  daysUntilDue: number;
}

interface FinancialContext {
  summary: FinancialSummary;
  budgets: BudgetInsight[];
  recentExpenses: ExpenseInsight[];
  upcomingEvents: FinancialEventInsight[];
  spendingPatterns: Record<string, number>;
  insights: string[];
}

export class AssistantService {
  static async generateResponse(userId: string, message: string) {
    const context = await this.buildFinancialContext(userId);
    const systemPrompt = this.buildSystemPrompt(context);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  }

  static async generateStreamResponse(userId: string, message: string) {
    const context = await this.buildFinancialContext(userId);
    const systemPrompt = this.buildSystemPrompt(context);

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: true
    });

    return stream;
  }

  private static async buildFinancialContext(userId: string): Promise<FinancialContext> {
    const [budgetData, expenseData, summary, financialEvents] = await Promise.all([
      prisma.budget.findMany({
        where: { userId },
        select: {
          amount: true,
          periodType: true,
          startDate: true,
          endDate: true,
          category: { select: { name: true, type: true } },
          currency: { select: { code: true, symbol: true } },
          expenses: {
            select: { amount: true },
            where: { 
              date: { 
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
              } 
            }
          }
        }
      }),
      prisma.expense.findMany({
        where: { userId },
        select: {
          amount: true,
          date: true,
          description: true,
          category: { select: { name: true } },
          currency: { select: { code: true, symbol: true } }
        },
        orderBy: { date: 'desc' },
        take: 20
      }),
      DashboardService.getSummary({ userId, timePeriod: "allTime" }),
      prisma.financialEvent.findMany({
        where: { userId, isActive: true },
        select: {
          name: true,
          amount: true,
          frequency: true,
          type: true,
          nextDueDate: true,
          budgetCategory: { select: { name: true } },
          currency: { select: { code: true, symbol: true } }
        },
        take: 10
      })
    ]);

    // Process budgets with insights
    const budgets: BudgetInsight[] = budgetData.map(budget => {
      const monthlySpent = budget.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const budgetAmount = Number(budget.amount);
      const remaining = budgetAmount - monthlySpent;
      const utilizationRate = budgetAmount > 0 ? (monthlySpent / budgetAmount) * 100 : 0;
      
      let status: 'healthy' | 'warning' | 'overspent' = 'healthy';
      if (utilizationRate > 100) status = 'overspent';
      else if (utilizationRate > 80) status = 'warning';

      return {
        category: budget.category.name,
        type: budget.category.type,
        budgetAmount,
        spent: monthlySpent,
        remaining,
        utilizationRate,
        period: budget.periodType,
        currency: budget.currency.code,
        status
      };
    });

    // Process expenses with recency
    const now = new Date();
    const recentExpenses: ExpenseInsight[] = expenseData.map(expense => ({
      amount: Number(expense.amount),
      category: expense.category.name,
      description: expense.description?.substring(0, 50) || '',
      date: expense.date.toISOString().split('T')[0],
      currency: expense.currency.code,
      isRecent: (now.getTime() - expense.date.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
    }));

    // Process upcoming events with urgency
    const upcomingEvents: FinancialEventInsight[] = financialEvents.map(event => {
      const daysUntilDue = Math.ceil((event.nextDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      return {
        name: event.name,
        amount: Number(event.amount),
        type: event.type,
        frequency: event.frequency,
        nextDue: event.nextDueDate.toISOString().split('T')[0],
        category: event.budgetCategory?.name || 'Uncategorized',
        currency: event.currency.code,
        daysUntilDue
      };
    });

    // Calculate spending patterns
    const spendingPatterns = recentExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Generate insights
    const insights = this.generateInsights(budgets, recentExpenses, upcomingEvents, summary);

    return {
      summary,
      budgets,
      recentExpenses,
      upcomingEvents,
      spendingPatterns,
      insights
    };
  }

  private static generateInsights(
    budgets: BudgetInsight[], 
    expenses: ExpenseInsight[], 
    events: FinancialEventInsight[], 
    summary: FinancialSummary
  ): string[] {
    const insights: string[] = [];

    // Budget insights
    const overspentBudgets = budgets.filter(b => b.status === 'overspent');
    const warningBudgets = budgets.filter(b => b.status === 'warning');
    
    if (overspentBudgets.length > 0) {
      insights.push(`⚠️ ${overspentBudgets.length} budget(s) are overspent: ${overspentBudgets.map(b => b.category).join(', ')}`);
    }
    
    if (warningBudgets.length > 0) {
      insights.push(`⚡ ${warningBudgets.length} budget(s) are near limit: ${warningBudgets.map(b => b.category).join(', ')}`);
    }

    // Upcoming events
    const urgentEvents = events.filter(e => e.daysUntilDue <= 7 && e.daysUntilDue >= 0);
    if (urgentEvents.length > 0) {
      insights.push(`📅 ${urgentEvents.length} financial event(s) due within 7 days`);
    }

    // Recent spending
    const recentExpenses = expenses.filter(e => e.isRecent);
    if (recentExpenses.length > 0) {
      const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
      insights.push(`💸 ${recentTotal.toFixed(2)} spent in the last 7 days across ${recentExpenses.length} transactions`);
    }

    // Savings insight
    if (summary.savings > 0) {
      insights.push(`💰 Current savings: ${summary.savings.toFixed(2)}`);
    } else if (summary.savings < 0) {
      insights.push(`🔴 Budget deficit: ${Math.abs(summary.savings).toFixed(2)}`);
    }

    return insights;
  }

  private static buildSystemPrompt(context: FinancialContext): string {
    return `You are an intelligent financial assistant for students. Provide personalized, actionable advice based on the user's financial data.

📊 FINANCIAL OVERVIEW:
• Total Budget: ${context.summary.totalBudget.toFixed(2)}
• Total Expenses: ${context.summary.totalExpenses.toFixed(2)}
• Remaining Funds: ${context.summary.remainingFunds.toFixed(2)}
• Savings: ${context.summary.savings.toFixed(2)}

💡 KEY INSIGHTS:
${context.insights.map(insight => `• ${insight}`).join('\n')}

📋 BUDGET STATUS:
${context.budgets.map(b => `• ${b.category}: ${b.budgetAmount} ${b.currency} (${b.utilizationRate.toFixed(1)}% used) - ${b.status.toUpperCase()}`).join('\n')}

💳 RECENT SPENDING PATTERNS:
${Object.entries(context.spendingPatterns).slice(0, 5).map(([cat, amount]) => `• ${cat}: ${amount.toFixed(2)}`).join('\n')}

📅 UPCOMING EVENTS (Next 5):
${context.upcomingEvents.slice(0, 5).map(e => `• ${e.name}: ${e.amount} ${e.currency} in ${e.daysUntilDue} days (${e.frequency})`).join('\n')}

🔍 RECENT TRANSACTIONS (Last 5):
${context.recentExpenses.slice(0, 5).map(e => `• ${e.date}: ${e.amount} ${e.currency} - ${e.category} ${e.description ? `(${e.description})` : ''}`).join('\n')}

Guidelines:
- Be conversational and supportive
- Provide specific, actionable advice
- Use emojis to make responses engaging
- Focus on the user's question while considering their financial context
- Suggest practical money-saving tips for students
- Alert about overspending or upcoming due dates when relevant`;
  }
}
