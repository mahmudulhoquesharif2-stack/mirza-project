import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// POST /api/stats/track-visit
// Body: { path?: string }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { path } = req.body || {};

    // Get client IP (works behind proxies if X-Forwarded-For is set)
    const xff = req.headers['x-forwarded-for'] as string | undefined;
    const ip = (xff ? xff.split(',')[0].trim() : req.socket.remoteAddress) || undefined;

    const visit = await prisma.visit.create({
      data: {
        path: (path as string) || req.url || '/',
        ip: ip as string | undefined,
      },
    });

    return res.status(201).json({ success: true, id: visit.id });
  } catch (err: any) {
    console.error('track-visit error:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
