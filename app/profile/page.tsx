'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { authClient } from '@/lib/auth-client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  image?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        setProfile(data.user);
        setEditForm({
          name: data.user.name || '',
          username: data.user.username || '',
          bio: data.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

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
        <div className="flex items-center gap-3">
          {/* Circular Profile Tab */}
          <div className="bg-yellow border-2 border-dark rounded-full px-4 py-2 shadow-custom-small">
            <span className="font-lilita text-sm font-bold text-dark">Profile</span>
          </div>
          <div>
            <h2 className="font-lilita text-2xl text-dark">Account Settings</h2>
            <p className="text-xs font-bold text-dark/50 mt-0.5">
              manage your account
            </p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button className="px-4.5 py-2.5 text-sm">
            view recipes →
          </Button>
        </Link>
      </div>

      {/* Profile Picture Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-4 p-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dark shadow-custom-small bg-white">
              {profile?.image ? (
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yellow flex items-center justify-center text-4xl">
                  👩‍🍳
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-yellow border-2 border-dark rounded-full w-8 h-8 flex items-center justify-center shadow-custom-small hover:bg-yellow/90 transition-colors"
              disabled={uploadingImage}
            >
              {uploadingImage ? '...' : '📷'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-lilita text-xl text-dark mb-1">Profile Picture</h3>
            <p className="text-sm font-bold text-dark/60">
              Click the camera to upload a new picture
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lilita text-xl text-dark">Account Information</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-yellow border-2 border-dark rounded-[8px] px-3 py-1 text-xs font-bold text-dark hover:bg-yellow/90 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-dark rounded-[10px] font-nunito font-bold text-sm focus:outline-none focus:border-yellow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-dark rounded-[10px] font-nunito font-bold text-sm focus:outline-none focus:border-yellow"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-dark rounded-[10px] font-nunito font-bold text-sm focus:outline-none focus:border-yellow resize-none"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-dark/60 mb-1">Name</div>
                <div className="font-nunito font-bold text-dark">{profile?.name}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-dark/60 mb-1">Username</div>
                <div className="font-nunito font-bold text-dark">
                  {profile?.username ? `@${profile.username}` : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-dark/60 mb-1">Bio</div>
                <div className="font-nunito font-bold text-dark">
                  {profile?.bio || 'No bio yet'}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-dark/60 mb-1">Email</div>
                <div className="font-nunito font-bold text-dark">{profile?.email}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-dark/60 mb-1">Member Since</div>
                <div className="font-nunito font-bold text-dark">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="font-lilita text-xl text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard">
              <Button className="w-full">View Recipes</Button>
            </Link>
            <Link href="/cook">
              <Button variant="secondary" className="w-full">Start Cooking</Button>
            </Link>
            <Link href="/community">
              <Button variant="secondary" className="w-full">Community</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={async () => {
                await authClient.signOut();
                window.location.pathname = '/';
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
