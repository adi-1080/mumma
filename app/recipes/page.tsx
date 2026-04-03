'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authClient } from '@/lib/auth-client';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

interface CookingSession {
  id: string;
  recipeName: string;
  recipeDesc: string;
  status: string;
  totalSteps: number;
  createdAt: string;
  result?: {
    id: string;
    score: number;
    isPublished: boolean;
    foodPhotoUrl?: string;
    recipeName: string;
    createdAt: string;
  };
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sessions, setSessions] = useState<CookingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recipes' | 'sessions'>('sessions');
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's recipes
      const recipesResponse = await fetch('/api/user/recipes');
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData.recipes || []);
      }

      // Fetch user's cooking sessions
      const sessionsResponse = await fetch('/api/user/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching recipes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const response = await fetch(`/api/internal-recipes/${recipeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
      } else {
        alert('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this cooking session?')) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        alert('Failed to delete cooking session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete cooking session');
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="main-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="font-lilita text-2xl text-dark mb-2">Sign In Required</h2>
          <p className="text-sm font-bold text-dark/60 mb-4">
            Please sign in to view and manage your recipes.
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-dark border-t-yellow animate-spin mx-auto mb-4"></div>
          <h2 className="font-lilita text-2xl text-dark mb-2">Loading Recipes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-lilita text-3xl text-dark mb-2">My Kitchen</h1>
          <p className="text-sm font-bold text-dark/60">
            Manage your recipes and cooking sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cook">
            <Button className="px-4.5 py-2.5 text-sm">
              Cook Now →
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 rounded-[12px] p-1">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 px-4 py-2 rounded-[8px] font-nunito font-bold text-sm transition-colors ${
            activeTab === 'sessions'
              ? 'bg-white text-dark border-2 border-dark shadow-custom-small'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          Cooking Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 px-4 py-2 rounded-[8px] font-nunito font-bold text-sm transition-colors ${
            activeTab === 'recipes'
              ? 'bg-white text-dark border-2 border-dark shadow-custom-small'
              : 'text-dark/60 hover:text-dark'
          }`}
        >
          Saved Recipes ({recipes.length})
        </button>
      </div>

      {/* Cooking Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="font-lilita text-xl text-dark mb-2">No Cooking Sessions Yet</h3>
              <p className="text-sm font-bold text-dark/60 mb-4">
                Start cooking to see your sessions here!
              </p>
              <Link href="/cook">
                <Button>Start Cooking</Button>
              </Link>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-lilita text-lg text-dark mb-2">
                        {session.recipeName}
                      </h3>
                      <p className="text-sm text-dark/70 mb-3 line-clamp-2">
                        {session.recipeDesc}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-dark/60">
                        <span className="flex items-center gap-1">
                          📝 {session.totalSteps} steps
                        </span>
                        <span className={`px-2 py-1 rounded-[6px] ${
                          session.status === 'COMPLETED' 
                            ? 'bg-green text-white' 
                            : 'bg-orange text-white'
                        }`}>
                          {session.status}
                        </span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {session.result && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="bg-pink border-2 border-dark rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="font-lilita text-xs font-bold text-white">
                              {session.result.score}/10
                            </span>
                          </div>
                          <span className="text-xs font-bold text-dark/60">
                            {session.result.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/recipes/${session.id}`}>
                        <Button variant="secondary" className="px-3 py-2 text-xs">
                          View
                        </Button>
                      </Link>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="px-3 py-2 text-xs bg-red text-white rounded-[8px] hover:bg-red/90 transition-colors border-none cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Saved Recipes Tab */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          {recipes.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="font-lilita text-xl text-dark mb-2">No Saved Recipes Yet</h3>
              <p className="text-sm font-bold text-dark/60 mb-4">
                Save your favorite recipes to see them here!
              </p>
              <Link href="/cook">
                <Button>Start Cooking</Button>
              </Link>
            </Card>
          ) : (
            recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-lilita text-lg text-dark mb-2">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-dark/70 mb-3 line-clamp-3">
                        {recipe.instructions}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-dark/60">
                        <span>
                          Created: {new Date(recipe.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Updated: {new Date(recipe.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/recipes/edit/${recipe.id}`}>
                        <Button variant="secondary" className="px-3 py-2 text-xs">
                          Edit
                        </Button>
                      </Link>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="px-3 py-2 text-xs bg-red text-white rounded-[8px] hover:bg-red/90 transition-colors border-none cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
