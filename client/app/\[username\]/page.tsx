'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { profile, analytics } from '@/lib/api';

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  clicks: number;
}

interface ProfileData {
  username: string;
  name?: string;
  bio?: string;
  links: Link[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      const data = await profile.get(username);
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (link: Link) => {
    try {
      await analytics.track(link.id);
    } catch (error) {
      console.error('Failed to track click');
    }
    window.open(link.url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p>Profile not found</p>
          <a href="/" className="text-white underline mt-4 inline-block">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="text-center text-white mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            {profileData.name?.charAt(0) || profileData.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold">{profileData.name || profileData.username}</h1>
          <p className="text-white/80">@{profileData.username}</p>
          {profileData.bio && (
            <p className="mt-2 text-white/90">{profileData.bio}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {profileData.links.length === 0 ? (
            <div className="text-center text-white/70">No links yet</div>
          ) : (
            profileData.links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleClick(link)}
                className="w-full bg-white rounded-lg p-4 text-left hover:scale-105 transition transform shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {link.icon ? (
                    <span className="text-2xl">{link.icon}</span>
                  ) : (
                    <span className="text-2xl">🔗</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {link.title}
                    </div>
                    {link.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {link.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <a href="/" className="text-white/70 hover:text-white text-sm">
            Powered by GitoLink
          </a>
        </div>
      </div>
    </div>
  );
}