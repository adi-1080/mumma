import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CommunityPost {
  id: string;
  caption: string;
  createdAt: string;
  user: { name: string } | null;
  result: {
    score: number;
    recipeName: string;
    foodPhotoUrl?: string;
    selfieUrl?: string;
  };
}

async function getCommunityPosts(): Promise<{ posts: CommunityPost[] }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/community`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch community posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching community posts:', error);
    // Return sample data for demo
    return {
      posts: [
        {
          id: '2',
          caption: "Mumma's tips were 🔥",
          createdAt: new Date().toISOString(),
          user: { name: 'Arjun M.' },
          result: {
            score: 8,
            recipeName: 'Dal Tadka',
          },
        },
        {
          id: '3',
          caption: 'PERFECT SCORE!! 🎉',
          createdAt: new Date().toISOString(),
          user: { name: 'Sneha K.' },
          result: {
            score: 10,
            recipeName: 'Aloo Paratha',
          },
        },
        {
          id: '4',
          caption: 'Still learning haha',
          createdAt: new Date().toISOString(),
          user: { name: 'Dev P.' },
          result: {
            score: 7,
            recipeName: 'Maggi Masala',
          },
        },
        {
          id: '5',
          caption: 'Asked mumma everything lol',
          createdAt: new Date().toISOString(),
          user: { name: 'Ananya T.' },
          result: {
            score: 9,
            recipeName: 'Paneer Bhurji',
          },
        },
        {
          id: '6',
          caption: 'Southern style done right!',
          createdAt: new Date().toISOString(),
          user: { name: 'Karthik R.' },
          result: {
            score: 8,
            recipeName: 'Tomato Rice',
          },
        },
      ],
    };
  }
}

const getEmojiForRecipe = (recipeName: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Dal Tadka': '🥘',
    'Aloo Paratha': '🫓',
    'Maggi Masala': '🍜',
    'Paneer Bhurji': '🧀',
    'Tomato Rice': '🍚',
  };
  return emojiMap[recipeName] || '🍽️';
};

const getBgColorForRecipe = (recipeName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Dal Tadka': 'bg-blue',
    'Aloo Paratha': 'bg-green',
    'Maggi Masala': 'bg-orange',
    'Paneer Bhurji': 'bg-orange',
    'Tomato Rice': 'bg-blue',
  };
  return colorMap[recipeName] || 'bg-yellow';
};

export default async function CommunityPage() {
  const { posts } = await getCommunityPosts();

  return (
    <div className="main-container fade-up">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div>
          <h2 className="font-lilita text-2xl text-dark">Community <span className="emoji-cheese"></span></h2>
          <p className="text-xs font-bold text-dark/50 mt-0.5">
            see what everyone's making! <span className="emoji-sparkle"></span>
          </p>
        </div>
        <Link href="/cook">
          <Button className="px-4.5 py-2.5 text-sm">
            cook now →
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <Card 
            key={post.id}
            className="overflow-hidden cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-custom-hover transition-all"
          >
            <div className={`${getBgColorForRecipe(post.result.recipeName)} h-[90px] flex items-center justify-center text-[42px] border-b-2 border-dark`}>
              {getEmojiForRecipe(post.result.recipeName)}
            </div>
            <div className="p-3">
              <h3 className="font-lilita text-sm text-dark mb-0.75">
                {post.result.recipeName}
              </h3>
              <p className="text-xs font-bold text-dark/50 mb-2">
                by {post.user?.name || 'Anonymous'}
              </p>
              {post.caption && (
                <p className="text-xs font-bold text-dark/60 mb-2 italic">
                  "{post.caption}"
                </p>
              )}
              <span className="bg-yellow border-2 border-dark rounded-[20px] px-3 py-1 text-xs font-extrabold text-dark inline-block">
                {post.result.score}/10
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
