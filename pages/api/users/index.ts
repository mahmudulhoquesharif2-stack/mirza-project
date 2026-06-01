import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password, country, background } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          country,
          background: background && background === 'MADRASAH' ? 'MADRASAH' : 'GENERAL',
        },
      });
      return res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (err:any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
