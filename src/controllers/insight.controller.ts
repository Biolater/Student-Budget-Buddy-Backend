import { Request, Response } from "express";
import { InsightService } from "../services/insightService";

// Controller function to fetch insights for a budget
export const getInsights = async (req: Request, res: Response) => {
  try {
    const { budgetId } = req.params;``
    const insights = await InsightService.getBudgetInsights(budgetId);
    res.json(insights);
  } catch (error) {
    console.error("Error fetching budget insights:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
