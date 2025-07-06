import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const existingAdmin = await prisma.adminUser.findFirst();
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    const { username, password } = await request.json();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      }
    });
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}