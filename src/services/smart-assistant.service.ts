import prisma from "../prisma";
import openai from "../openai";
import { DashboardService } from "./dashboard.service";
import { ContextUtils } from "../utils/context.utils";

export class SmartAssistantService {
  static async generateResponse(userId: string, message: string) {
    // Analyze the user's query to determine what data we need
    const queryAnalysis = ContextUtils.analyzeQuery(message);
    
    // Build dynamic queries based on the analysis
    const dataPromises: any[] = [
      DashboardService.getSummary({ userId, timePeriod: "allTime" })
    ];

    if (queryAnalysis.needsBudgets || queryAnalysis.isAdviceRequest) {
      dataPromises.push(
        prisma.budget.findMany({
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
        })
      );
    }

    if (queryAnalysis.needsExpenses || queryAnalysis.isAdviceRequest) {
      const limit = queryAnalysis.needsTimeframe ? 15 : 8;
      dataPromises.push(
        prisma.expense.findMany({
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
        })
      );
    }

    if (queryAnalysis.needsRecurring || queryAnalysis.isAdviceRequest) {
      dataPromises.push(
        prisma.financialEvent.findMany({
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
          take: 6
        })
      );
    }

    const results = await Promise.all(dataPromises);
    
    // Map results to data object
    const data: any = { summary: results[0] };
    let resultIndex = 1;
    
    if (queryAnalysis.needsBudgets || queryAnalysis.isAdviceRequest) {
      data.budgets = results[resultIndex++];
    }
    if (queryAnalysis.needsExpenses || queryAnalysis.isAdviceRequest) {
      data.expenses = results[resultIndex++];
    }
    if (queryAnalysis.needsRecurring || queryAnalysis.isAdviceRequest) {
      data.financialEvents = results[resultIndex++];
    }

    // Format context based on what's needed
    const contextData = ContextUtils.formatContextData(data, queryAnalysis);

    const systemPrompt = `You are a helpful financial assistant for students. Based on the user's question and their financial data below, provide personalized advice:

${contextData}

Keep responses concise and actionable. Focus on the specific question asked.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  }
}