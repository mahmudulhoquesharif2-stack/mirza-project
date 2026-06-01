// file: C:/Users/msisl/Desktop/mirza.html/pages/api/payments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

/**
 * /api/payments
 *   POST   - Create a new payment record (bKash/Nagad manual verification flow)
 *   GET    - Retrieve payment details by id (query param ?id=)
 *   PATCH  - Update payment status after verification (admin workflow)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const id = query.id ? Number(query.id) : undefined;

  switch (method) {
    case 'POST': {
      const {
        userId,
        courseId,
        amount,
        currency = 'BDT',
        method: paymentMethod,
        stripeSessionId,
        transactionId,
      } = body as {
        userId: number;
        courseId?: number;
        amount: number; // cents (or paisa for BDT)
        currency?: string;
        method: string; // e.g., 'bKash', 'Nagad', 'Stripe'
        stripeSessionId?: string;
        transactionId?: string;
      };

      if (!userId || !amount || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required payment fields' });
      }

      try {
        const payment = await prisma.payment.create({
          data: {
            user: { connect: { id: userId } },
            course: courseId ? { connect: { id: courseId } } : undefined,
            amount,
            currency,
            method: paymentMethod,
            stripeSessionId,
            transactionId,
            status: 'PENDING', // initial status
          },
        });
        return res.status(201).json(payment);
      } catch (error) {
        console.error('Create payment error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    case 'GET': {
      const userIdParam = query.userId ? Number(query.userId) : undefined;
      const statusFilter = typeof query.status === 'string' ? query.status : undefined;
      try {
        // Return pending payments list when no specific id/userId provided
        if (!id && !userIdParam && statusFilter) {
          const payments = await prisma.payment.findMany({
            where: { status: statusFilter },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
          });
          return res.status(200).json(payments);
        }

        if (userIdParam) {
          const payment = await prisma.payment.findFirst({
            where: { userId: userIdParam },
            orderBy: { createdAt: 'desc' },
            include: { user: true },
          });
          return res.status(200).json(payment || null);
        }

        if (id) {
          const payment = await prisma.payment.findUnique({
            where: { id },
            include: { user: true },
          });
          if (!payment) return res.status(404).json({ error: 'Payment not found' });
          return res.status(200).json(payment);
        }

        return res.status(400).json({ error: 'Missing required query parameters' });
      } catch (error) {
        console.error('Fetch payment error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    case 'PATCH': {
      if (!id) {
        return res.status(400).json({ error: 'Missing payment id' });
      }
      const { status } = body as { status: string };
      if (!status) {
        return res.status(400).json({ error: 'Missing status field' });
      }
      try {
        // Update the payment status first
        const updated = await prisma.payment.update({
          where: { id },
          data: { status },
        });

        // If approved, create an enrollment record automatically
        if (status === 'APPROVED') {
          const payment = await prisma.payment.findUnique({
            where: { id },
            include: { user: true, course: true },
          });
          if (payment?.userId && payment?.courseId) {
            // Ensure enrollment does not already exist
            const existing = await prisma.enrollment.findFirst({
              where: { userId: payment.userId, courseId: payment.courseId },
            });
            if (!existing) {
              await prisma.enrollment.create({
                data: {
                  user: { connect: { id: payment.userId } },
                  course: { connect: { id: payment.courseId } },
                },
              });
            }
          }
        }
        return res.status(200).json(updated);
      } catch (error) {
        console.error('Update payment error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    default: {
      res.setHeader('Allow', ['POST', 'GET', 'PATCH']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
}
