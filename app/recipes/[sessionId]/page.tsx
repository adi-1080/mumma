'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
}

interface Recipe {
  id: string;
  recipeName: string;
  recipeDesc: string;
  totalSteps: number;
  createdAt: string;
  steps: RecipeStep[];
  result: {
    score: number;
    recipeName: string;
    foodPhotoUrl?: string;
    selfieUrl?: string;
    isPublished: boolean;
    createdAt: string;
  };
  user: {
    name: string;
    image?: string;
  };
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSteps, setShowAllSteps] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchRecipe();
    }
  }, [sessionId]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipes/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data.recipe);
      } else if (response.status === 404) {
        router.push('/community');
      } else if (response.status === 403) {
        router.push('/community');
      }
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      router.push('/community');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small">
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🍳
            </div>
          </div>
          <h2 className="font-lilita text-2xl text-dark mb-4">Loading Recipe...</h2>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="main-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 border-[3px] border-dark overflow-hidden bg-white shadow-custom-small">
            <div className="w-full h-full flex items-center justify-center text-2xl">
              😕
            </div>
          </div>
          <h2 className="font-lilita text-2xl text-dark mb-4">Recipe Not Found</h2>
          <Link href="/community">
            <Button>Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stepsToShow = showAllSteps ? recipe.steps : recipe.steps.slice(0, 3);

  return (
    <div className="main-container fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div>
          <Link href="/community" className="text-sm font-bold text-dark/60 hover:text-dark transition-colors mb-2 inline-block">
            ← Back to Community
          </Link>
          <h2 className="font-lilita text-2xl text-dark">{recipe.recipeName}</h2>
          <p className="text-xs font-bold text-dark/50 mt-0.5">
            by {recipe.user ? recipe.user.name : "Anonymous"} • {new Date(recipe.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {recipe.result && (
            <div className="bg-pink border-2 border-dark rounded-full w-12 h-12 flex items-center justify-center shadow-custom-small">
              <span className="font-lilita text-xs font-bold text-white">
                {recipe.result.score}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Description */}
      <Card className="mb-6">
        <h3 className="font-lilita text-lg text-dark mb-3">About This Recipe</h3>
        <p className="font-nunito text-sm text-dark/80 leading-relaxed">
          {recipe.recipeDesc}
        </p>
        
        {/* Recipe Photo */}
        {recipe.result?.foodPhotoUrl && (
          <div className="mt-4">
            <img 
              src={recipe.result.foodPhotoUrl} 
              alt={recipe.recipeName}
              className="w-full h-[200px] object-cover rounded-[10px] border-2 border-dark"
            />
          </div>
        )}
      </Card>

      {/* Recipe Steps */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-lilita text-lg text-dark">Recipe Steps</h3>
          <span className="text-sm font-bold text-dark/60">
            {recipe.totalSteps} steps total
          </span>
        </div>

        <div className="space-y-4">
          {stepsToShow.map((step) => (
            <div key={step.stepNumber} className="border-2 border-dark rounded-[10px] p-4">
              <div className="flex items-start gap-3">
                <div className="bg-yellow border-2 border-dark rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-nunito font-bold text-sm">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h4 className="font-nunito font-bold text-dark mb-2">{step.title}</h4>
                  <p className="font-nunito text-sm text-dark/80 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show All Steps Button */}
        {recipe.steps.length > 3 && (
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAllSteps(!showAllSteps)}
              variant="secondary"
              className="px-6"
            >
              {showAllSteps ? 'Show Less' : `View All ${recipe.steps.length} Steps`}
            </Button>
          </div>
        )}
      </Card>

      {/* Cook This Recipe Button */}
      <div className="text-center">
        <Link href="/cook">
          <Button className="px-8">
            Cook This Recipe →
          </Button>
        </Link>
      </div>
    </div>
  );
}
