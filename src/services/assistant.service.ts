import prisma from "../prisma";
import openai from "../openai";
import { DashboardService } from "./dashboard.service";

export class AssistantService {
  static async generateResponse(userId: string, message: string) {
    const [budgets, expenses, summary] = await Promise.all([
      prisma.budget.findMany({
        where: { userId },
        include: { category: true, currency: true },
      }),
      prisma.expense.findMany({
        where: { userId },
        include: { category: true, currency: true },
      }),
      DashboardService.getSummary({ userId, timePeriod: "allTime" }),
    ]);

    const systemPrompt = `You are a helpful assistant that provides financial advice to students based on their budgets and expenses. Here is the user\'s data: Budgets: ${JSON.stringify(budgets)}, Expenses: ${JSON.stringify(expenses)}, Dashboard Summary: ${JSON.stringify(summary)}. Use this information to answer the user\'s questions.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  }
}
