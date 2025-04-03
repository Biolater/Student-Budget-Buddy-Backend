// src/server.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import openai from './openai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
