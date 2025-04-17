/* import { Request, Response } from 'express';
import { getBudgetInsights } from '../services/insightsService';

// Controller function to fetch insights for a budget
export const getInsights = async (req: Request, res: Response) => {
    try {
        const { budgetId } = req.params;
        const insights = await getBudgetInsights(budgetId);
        return res.json(insights);
    } catch (error) {
        console.error('Error fetching budget insights:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
 */