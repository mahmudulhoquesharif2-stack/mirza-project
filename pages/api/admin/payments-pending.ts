import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Admin only
  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true, phone: true, country: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: payments });
  } catch (err: any) {
    console.error('payments-pending error:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
