import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    });
    
    return NextResponse.json({ 
      exists: !!user 
    });
    
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json({ 
      error: 'Failed to check user existence' 
    }, { status: 500 });
  }
}
