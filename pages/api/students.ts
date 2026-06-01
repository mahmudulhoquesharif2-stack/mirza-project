// file: C:/Users/msisl/Desktop/mirza.html/pages/api/students.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

/**
 * /api/students
 *   GET   - list all students or a single student via ?id=
 *   POST  - create a new student (registration)
 *   PUT   - update existing student profile (requires id query param)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;

  // Helper to parse numeric id
  const id = query.id ? Number(query.id) : undefined;

  switch (method) {
    case 'GET': {
      try {
        if (id) {
          const student = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, phone: true, country: true, image: true, background: true, createdAt: true },
          });
          if (!student) return res.status(404).json({ error: 'Student not found' });
          return res.status(200).json(student);
        }
        const students = await prisma.user.findMany({
          select: { id: true, name: true, email: true, phone: true, country: true, background: true, createdAt: true },
        });
        return res.status(200).json(students);
      } catch (error) {
        console.error('Fetch students error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    case 'POST': {
      const { name, email, password, phone, country, background, image } = body as {
        name?: string;
        email: string;
        password: string;
        phone?: string;
        country?: string;
        background?: string;
        image?: string;
      };
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields: email, password' });
      }
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            phone,
            country,
            background: background === 'MADRASAH' ? 'MADRASAH' : 'GENERAL',
            image,
          },
          select: { id: true, email: true, createdAt: true },
        });
        return res.status(201).json(newStudent);
      } catch (error: any) {
        console.error('Create student error:', error);
        if (error.code === 'P2002') {
          // Unique constraint failed
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    case 'PUT':
    case 'PATCH': {
      if (!id) {
        return res.status(400).json({ error: 'Missing student id in query' });
      }
      const { name, phone, country, background, image } = body as {
        name?: string;
        phone?: string;
        country?: string;
        background?: string;
        image?: string;
      };
      try {
        const updated = await prisma.user.update({
          where: { id },
          data: { name, phone, country, background, image },
          select: { id: true, email: true, createdAt: true },
        });
        return res.status(200).json(updated);
      } catch (error) {
        console.error('Update student error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
}
