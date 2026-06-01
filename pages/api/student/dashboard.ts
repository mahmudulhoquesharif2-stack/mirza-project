import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const userId = parseInt(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        background: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch enrollments with course -> modules -> lessons and payment status
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        // include payments related to this course and user
        // find latest payment for this course by this user
      },
      orderBy: { createdAt: 'desc' },
    });

    // For each enrollment, determine payment status
    const results = [] as any[];
    for (const en of enrollments) {
      const latestPayment = await prisma.payment.findFirst({
        where: { userId: userId, courseId: en.courseId },
        orderBy: { createdAt: 'desc' },
      });

      const paymentStatus = latestPayment?.status || 'PENDING';

      // Mask contentUrl if payment not completed
      const modules = en.course.modules.map((m: any) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        lessons: m.lessons.map((ls: any) => ({
          id: ls.id,
          title: ls.title,
          order: ls.order,
          contentUrl: paymentStatus === 'PAID' || paymentStatus === 'COMPLETED' ? ls.contentUrl : null,
        })),
      }));

      results.push({
        enrollmentId: en.id,
        course: {
          id: en.course.id,
          title: en.course.title,
          description: en.course.description,
          priceMadrasah: en.course.priceMadrasah,
          priceGeneral: en.course.priceGeneral,
        },
        paymentStatus,
        modules,
      });
    }

    return res.status(200).json({ user, courses: results });
  } catch (err: any) {
    console.error('student dashboard error:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
