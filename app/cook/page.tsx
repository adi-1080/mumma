'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { authClient } from '@/lib/auth-client';
import Card from '@/components/ui/Card';
import AppLogo from '@/components/ui/AppLogo';

const SUGGESTIONS = [
  'tomato', 'onion', 'paneer', 'potato', 'rice', 
  'dal', 'bread', 'milk', 'butter', 'garlic', 'coriander'
];

export default function IngredientPicker() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { data: session, isPending } = authClient.useSession();

  const addIngredient = (value: string) => {
    const trimmed = value.trim().replace(/,$/, '').trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const startCooking = async () => {
    if (!ingredients.length) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to start cooking session');
      }

      const data = await response.json();
      router.push(`/sessions/${data.session.id}`);
    } catch (error) {
      console.error('Error starting cooking session:', error);
      // Handle error - show toast or alert
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="main-container flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small"><AppLogo className="w-full h-full object-cover" /></div>
          <h2 className="font-lilita text-2xl text-dark mb-2">
            Just a sec, beta...
          </h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="main-container flex flex-col items-center justify-center min-h-[60vh] text-center fade-up px-4">
        <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small"><AppLogo className="w-full h-full object-cover" /></div>
        <h2 className="font-lilita text-3xl text-dark mb-4">Hold on beta!</h2>
        <p className="text-sm font-bold text-dark/60 mb-8 max-w-sm">
          You need to sign in first so Mumma can save your delicious recipes and score to your kitchen book!
        </p>
        <Link href="/login" className="w-full max-w-xs block mx-auto">
          <Button className="w-full">
            Log In or Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="main-container flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 bounce-slow border-[3px] border-dark overflow-hidden bg-white shadow-custom-small"><AppLogo className="w-full h-full object-cover" /></div>
          <h2 className="font-lilita text-2xl text-dark mb-2">
            Mumma's thinking<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
          </h2>
          <p className="text-sm font-bold text-dark/50">
            Finding the perfect recipe for what you have <span className="emoji-plate"></span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container fade-up container-mobile">
      <div className="flex items-center gap-2.5 mb-4.5">
        <Link href="/">
          <Button variant="secondary">{'<'} back</Button>
        </Link>
        <h2 className="font-lilita text-2xl text-dark heading-responsive">What's in your kitchen?</h2>
      </div>

      {/* Mom's Message */}
      <div className="flex gap-3 mb-4 gap-responsive">
        <div className="w-11 h-11 rounded-full border-[2.5px] border-dark flex items-center justify-center shadow-custom-small flex-shrink-0 overflow-hidden bg-white">
          <AppLogo className="w-full h-full object-cover" />
        </div>
        <div className="bg-yellow border-[2.5px] border-dark rounded-[14px] rounded-tl-[4px] p-3.5 text-sm font-bold text-dark leading-relaxed flex-1 card-mobile p-responsive">
          Beta, tell mumma what you have at home! Even just 2-3 things and she'll figure it out <span className="emoji-heart"></span>
        </div>
      </div>

      {/* Ingredient Input */}
      <Card className="mb-3 card-mobile">
        <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase mb-2.5">
          your ingredients
        </div>
        <div 
          className="min-h-[54px] border-[2.5px] border-dark rounded-[18px] p-2.5 flex flex-wrap gap-1.5 items-center bg-white cursor-text shadow-custom-small input-mobile"
          onClick={() => document.getElementById('ingredient-input')?.focus()}
        >
          {ingredients.map((ingredient, index) => (
            <span 
              key={index} 
              className="bg-dark text-white rounded-[20px] px-2 py-1 text-xs font-bold inline-flex items-center gap-1.5"
            >
              {ingredient}
              <button 
                className="bg-white/20 border-none w-[18px] h-[18px] rounded-full cursor-pointer text-xs font-extrabold text-dark p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeIngredient(index);
                }}
              >
                x
              </button>
            </span>
          ))}
          <input
            id="ingredient-input"
            type="text"
            className="border-none outline-none font-nunito text-sm font-bold text-dark bg-none min-w-[90px] flex-1 input-mobile"
            placeholder={ingredients.length ? 'add more...' : 'tomato, onion, paneer...'}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="text-xs font-bold text-dark/35 mt-1.5">
          [enter] or [,] comma after each ingredient
        </div>
      </Card>

      {/* Quick Add */}
      <Card className="mb-4.5 card-mobile">
        <div className="text-xs font-extrabold text-dark/45 tracking-wider uppercase mb-2.5">
          quick add
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addIngredient(suggestion)}
              className={`${
                ingredients.includes(suggestion) 
                  ? 'bg-dark text-yellow rounded-[20px] px-3.5 py-1.5 font-nunito text-xs font-bold cursor-pointer transition-all' 
                  : 'bg-cream text-dark rounded-[20px] px-3.5 py-1.5 font-nunito text-xs font-bold cursor-pointer transition-all'
              } touch-target`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </Card>

      {/* Start Cooking Button */}
      <Button 
        fullWidth 
        onClick={startCooking}
        disabled={!ingredients.length || isLoading}
      >
        <span dangerouslySetInnerHTML={{ __html: !ingredients.length ? 'add ingredients first [up]' : 'Let Mumma decide! [right]' }} />
      </Button>
    </div>
  );
}
