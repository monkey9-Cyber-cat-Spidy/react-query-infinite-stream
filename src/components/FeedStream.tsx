'use client';
import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Send, RefreshCw, Heart, MessageSquare, Sparkles, Filter } from 'lucide-react';

interface FeedPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  tag: string;
  likes: number;
  timestamp: string;
}

export default function FeedStream() {
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState('All');
  const [newContent, setNewContent] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: ['feedStream', selectedTag],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/feed?cursor=${pageParam}&limit=12&tag=${encodeURIComponent(selectedTag)}`);
      if (!res.ok) throw new Error('Failed to fetch stream');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tag: selectedTag === 'All' ? 'Architecture' : selectedTag }),
      });
      return res.json();
    },
    onMutate: async (newPostText) => {
      await queryClient.cancelQueries({ queryKey: ['feedStream', selectedTag] });
      const previousData = queryClient.getQueryData(['feedStream', selectedTag]);

      queryClient.setQueryData(['feedStream', selectedTag], (old: any) => {
        if (!old) return old;
        const optimisticPost: FeedPost = {
          id: 'temp_' + Date.now(),
          author: 'You (Satya)',
          handle: '@kvsmanikanta',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          content: newPostText,
          tag: selectedTag === 'All' ? 'Architecture' : selectedTag,
          likes: 0,
          timestamp: new Date().toISOString(),
        };

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              items: [optimisticPost, ...old.pages[0].items],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousData };
    },
    onError: (err, newPost, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['feedStream', selectedTag], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedStream', selectedTag] });
    },
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    mutation.mutate(newContent);
    setNewContent('');
  };

  const tags = ['All', 'PostgreSQL', 'Architecture', 'Next.js', 'Distributed'];
  const allPosts = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">TanStack Infinite Stream</h1>
          </div>
          <p className="text-sm text-slate-400">
            Cursor-paginated infinite feed with optimistic cache mutations and windowing.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-indigo-400' : ''}`} />
          Sync Feed
        </button>
      </header>

      {/* Post Creator */}
      <form onSubmit={handlePostSubmit} className="mb-8 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Publish an engineering insight or architectural pattern..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Optimistic UI update active
          </span>
          <button
            type="submit"
            disabled={!newContent.trim() || mutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-400 mr-1" />
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedTag === tag
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Stream List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading initial stream batch...</div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No stream items found for {selectedTag}.</div>
        ) : (
          allPosts.map((post: FeedPost) => (
            <div
              key={post.id}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                    {post.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{post.author}</h3>
                    <p className="text-xs text-slate-500">{post.handle}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                  {post.tag}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-pointer">
                  <Heart className="h-3.5 w-3.5" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1.5 hover:text-indigo-400 transition cursor-pointer">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </span>
                <span className="ml-auto text-[11px] text-slate-600">
                  {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite Scroll Trigger Button */}
      {hasNextPage && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition shadow"
          >
            {isFetchingNextPage ? 'Loading more feed items...' : 'Load Older Insights'}
          </button>
        </div>
      )}
    </div>
  );
}
