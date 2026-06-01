// file: C:/Users/msisl/Desktop/mirza.html/pages/api/stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

/**
 * GET /api/stats
 * Returns aggregated statistics for the admin command‑center dashboard.
 *   - totalVisits: number of raw visit records
 *   - totalStudents: number of registered users with role "student"
 *   - totalPayments: total number of payment records
 *   - approvedRevenue: sum of amounts for payments with status "APPROVED"
 *   - pendingPayments: count of payments with status "PENDING"
 */
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const [visitCount, studentCount, paymentAgg] = await Promise.all([
      prisma.visit.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.payment.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: { in: ['APPROVED', 'PENDING'] } },
      }),
    ]);

    // Separate pending vs approved counts
    const [approvedAgg, pendingAgg] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'APPROVED' },
      }),
      prisma.payment.aggregate({
        _count: { id: true },
        where: { status: 'PENDING' },
      }),
    ]);

    const response = {
      totalVisits: visitCount,
      totalStudents: studentCount,
      totalPayments: paymentAgg._count.id ?? 0,
      approvedRevenue: approvedAgg._sum.amount ?? 0,
      pendingPayments: pendingAgg._count.id ?? 0,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error('Stats aggregation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
