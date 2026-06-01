// file: C:/Users/msisl/Desktop/mirza.html/pages/api/visits.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

/**
 * POST /api/visits
 * Records a page visit. Expected payload:
 *   { path: string; ip?: string; country?: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { path, ip, country } = req.body as {
    path: string;
    ip?: string;
    country?: string;
  };

  if (!path) {
    return res.status(400).json({ error: 'Missing required field: path' });
  }

  try {
    const visit = await prisma.visit.create({
      data: { path, ip, country },
    });
    // Increment daily aggregate
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    await prisma.dailyVisitor.upsert({
      where: { date: startOfDay },
      update: { count: { increment: 1 } },
      create: { date: startOfDay, count: 1 },
    });
    return res.status(201).json(visit);
  } catch (error) {
    console.error('Visit logging error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
