import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Admin only
  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { paymentId, action } = req.body;

    if (!paymentId || !action) {
      return res.status(400).json({ error: 'paymentId and action required' });
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'action must be APPROVE or REJECT' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: { user: true, course: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (action === 'APPROVE') {
      // Update payment status to COMPLETED (gating string)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });

      // Create enrollment if course exists and no duplicate
      if (payment.courseId) {
        const existing = await prisma.enrollment.findFirst({
          where: { userId: payment.userId, courseId: payment.courseId },
        });

        if (!existing) {
          await prisma.enrollment.create({
            data: {
              userId: payment.userId,
              courseId: payment.courseId,
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Payment approved and enrollment created',
        payment: { id: payment.id, status: 'COMPLETED' },
      });
    } else {
      // REJECT
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      return res.status(200).json({
        success: true,
        message: 'Payment rejected',
        payment: { id: payment.id, status: 'FAILED' },
      });
    }
  } catch (err: any) {
    console.error('approve-payment error:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
