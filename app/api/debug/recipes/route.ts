import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check all cooking sessions
    const sessions = await prisma.cookingSession.findMany({
      select: {
        id: true,
        recipeName: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            steps: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Check all results
    const results = await prisma.cookResult.findMany({
      select: {
        id: true,
        sessionId: true,
        score: true,
        recipeName: true,
        isPublished: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Check all community posts
    const communityPosts = await prisma.communityPost.findMany({
      select: {
        id: true,
        resultId: true,
        caption: true,
        createdAt: true,
        result: {
          select: {
            isPublished: true,
            score: true,
            recipeName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      sessions,
      results,
      communityPosts,
      summary: {
        totalSessions: sessions.length,
        totalResults: results.length,
        totalCommunityPosts: communityPosts.length,
        publishedResults: results.filter(r => r.isPublished).length,
        unpublishedResults: results.filter(r => !r.isPublished).length
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
