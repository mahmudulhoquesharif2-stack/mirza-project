import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

const session: any = await getServerSession(req, res, authOptions as any);
  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const totalStudents = await prisma.user.count();
    const totalCourses = await prisma.course.count();
    const totalPayments = await prisma.payment.count();

    res.status(200).json({ totalStudents, totalCourses, totalPayments });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
}
