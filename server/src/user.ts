import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
  res.json();
});
