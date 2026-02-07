'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, links } from '@/lib/api';

interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  active: boolean;
  clicks: number;
  order: number;
}

interface User {
  username: string;
  email: string;
  name?: string;
  bio?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userLinks, setUserLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await auth.me();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      loadLinks();
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const loadLinks = async () => {
    try {
      const data = await links.getAll();
      setUserLinks(data);
    } catch (error) {
      console.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLink) {
        await links.update(editingLink.id, formData);
      } else {
        await links.create(formData);
      }
      setShowForm(false);
      setEditingLink(null);
      setFormData({ title: '', url: '', description: '', icon: '' });
      loadLinks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      icon: link.icon || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    try {
      await links.delete(id);
      loadLinks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const toggleActive = async (link: Link) => {
    try {
      await links.update(link.id, { active: !link.active });
      loadLinks();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= userLinks.length) return;

    const newLinks = [...userLinks];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    
    setUserLinks(newLinks);
    
    try {
      await links.reorder(newLinks.map(l => l.id));
    } catch (error) {
      loadLinks();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Your profile:{' '}
              <a href={`/${user?.username}`} className="text-purple-600 hover:underline">
                /{user?.username}
              </a>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Link Button */}
        {!showForm && (
          <button
            onClick={() => {
              setEditingLink(null);
              setFormData({ title: '', url: '', description: '', icon: '' });
              setShowForm(true);
            }}
            className="w-full mb-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition"
          >
            + Add New Link
          </button>
        )}

        {/* Link Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingLink ? 'Edit Link' : 'Add New Link'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="🔗"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                {editingLink ? 'Update' : 'Add Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Links List */}
        <div className="space-y-3">
          {userLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No links yet. Add your first link above!
            </div>
          ) : (
            userLinks.map((link, index) => (
              <div
                key={link.id}
                className={`bg-white rounded-lg shadow p-4 flex items-center gap-4 ${
                  !link.active ? 'opacity-60' : ''
                }`}
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === userLinks.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>

                {/* Link content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {link.icon && <span className="text-xl">{link.icon}</span>}
                    <span className="font-medium truncate">{link.title}</span>
                    {!link.active && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{link.url}</p>
                  {link.description && (
                    <p className="text-sm text-gray-400 truncate">{link.description}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-center px-3">
                  <div className="text-lg font-semibold">{link.clicks}</div>
                  <div className="text-xs text-gray-500">clicks</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(link)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    {link.active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => handleEdit(link)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}