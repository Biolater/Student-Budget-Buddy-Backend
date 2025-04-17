// src/server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import openai from './openai';
import prisma from './prisma';
import insightRouter from './routes/insight.route';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/insights', insightRouter);
app.get('/', async (req: Request, res: Response) => {
    const budgets = await prisma.budget.findMany();
    res.status(200).json({
        data: budgets
    })
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
