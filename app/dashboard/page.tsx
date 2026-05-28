'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authClient } from '@/lib/auth-client';

interface UserSession {
  id: string; // resultId
  sessionId: string;
  recipeName: string;
  status: string;
  totalSteps: number;
  createdAt: string;
  score?: number | null;
  isPublished: boolean;
}

interface UserStats {
  sessionsStarted: number;
  sessionsCompleted: number;
  avgScore: number;
  postsPublished: number;
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserSessions(data.sessions || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (resultId: string, currentVisibility: boolean) => {
    if (!resultId) return;
    try {
      const response = await fetch(`/api/result/${resultId}/toggle-visibility`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setUserSessions(prev => 
          prev.map(s => 
            s.id === resultId 
              ? { ...s, isPublished: !currentVisibility }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const inProgressSessions = userSessions.filter(s => s.status === 'IN_PROGRESS');
  const completedSessions = userSessions.filter(s => s.status === 'COMPLETED');

  if (!session) {
    return (
      <div className="main-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small">
            <div className="w-full h-full flex items-center justify-center text-2xl">
              👩‍🍳
            </div>
          </div>
          <h2 className="font-lilita text-2xl text-dark mb-4">Please sign in</h2>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container fade-up">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div>
          <h2 className="font-lilita text-2xl text-dark">Your Recipes</h2>
          <p className="text-xs font-bold text-dark/50 mt-0.5">
            manage your cooking journey! <span className="emoji-sparkle"></span>
          </p>
        </div>
        <Link href="/cook">
          <Button className="px-4.5 py-2.5 text-sm">
            cook now →
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <Card className="mb-6">
          <h3 className="font-lilita text-lg text-dark mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{stats.sessionsStarted}</div>
              <div className="text-xs font-bold text-dark/60">Sessions Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{stats.sessionsCompleted}</div>
              <div className="text-xs font-bold text-dark/60">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{stats.avgScore}/10</div>
              <div className="text-xs font-bold text-dark/60">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{stats.postsPublished}</div>
              <div className="text-xs font-bold text-dark/60">Posts Published</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recipe Sessions */}
      <Card>
        <h3 className="font-lilita text-lg text-dark mb-3">Your Recipes</h3>
        
        {/* In Progress */}
        {inProgressSessions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-nunito font-bold text-dark mb-3">In Progress</h4>
            <div className="space-y-2">
              {inProgressSessions.map((session) => (
                <Link key={session.sessionId} href={`/sessions/${session.sessionId}`}>
                  <div className="flex items-center justify-between p-3 border-2 border-dark rounded-[10px] hover:bg-yellow/50 transition-colors cursor-pointer">
                    <div>
                      <div className="font-nunito font-bold text-dark">{session.recipeName}</div>
                      <div className="text-xs font-bold text-dark/60">
                        {session.totalSteps} steps • Started {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-blue text-white text-xs font-bold px-2 py-1 rounded-[6px]">
                      {session.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedSessions.length > 0 && (
          <div>
            <h4 className="font-nunito font-bold text-dark mb-3">Completed</h4>
            <div className="space-y-2">
              {completedSessions.map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 border-2 border-dark rounded-[10px]">
                  <div className="flex-1">
                    <Link href={`/sessions/${session.sessionId}`} className="block">
                      <div className="font-nunito font-bold text-dark hover:text-yellow transition-colors">
                        {session.recipeName}
                      </div>
                      <div className="text-xs font-bold text-dark/60">
                        {session.score ? `Score: ${session.score}/10 • ` : ''}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                  </div>
                  {session.score && (
                    <div className="flex items-center gap-2">
                      <div className="bg-green text-white text-xs font-bold px-2 py-1 rounded-[6px]">
                        {session.isPublished ? 'Public' : 'Private'}
                      </div>
                      <button
                        onClick={() => handleToggleVisibility(session.id, session.isPublished)}
                        className={`border-2 border-dark rounded-[6px] px-2 py-1 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                          session.isPublished 
                            ? 'bg-pink text-white hover:bg-[#D94A84]' 
                            : 'bg-yellow text-dark hover:bg-yellow/90'
                        }`}
                      >
                        {session.isPublished ? 'Make Private' : 'Make Public'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}