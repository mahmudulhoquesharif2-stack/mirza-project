import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

type DayCount = { date: string; count: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Only admin users
  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const days = Math.max(1, Number(req.query.days || 30));

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    // Fetch visits in range
    const visits = await prisma.visit.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    });

    // Aggregate by date (YYYY-MM-DD)
    const map = new Map<string, number>();
    for (const v of visits) {
      const d = v.createdAt.toISOString().slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    }

    // Build list from start -> end
    const result: DayCount[] = [];
    for (let i = 0; i < days; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const key = cur.toISOString().slice(0, 10);
      result.push({ date: key, count: map.get(key) || 0 });
    }

    return res.status(200).json({ data: result });
  } catch (err: any) {
    console.error('daily-visitors error:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
