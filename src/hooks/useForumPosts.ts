import { useEffect, useCallback } from 'react';
import { useForumStore } from './useForumStore';
import { transformBackendToForumDiscussion } from '../utils/forumUtils';
import { ForumDiscussion, ForumReply } from '../types/forum';

// Backend types (matching your API response from http://localhost:3000/api/forum-posts)
interface BackendForumPost {
  id: number;
  userEmail: string;
  businessUen: string | null;
  title: string | null;
  body: string;
  likeCount: number;
  createdAt: string;
  replies: Array<{
    id: number;
    postId: number;
    userEmail: string;
    body: string;
    likeCount: number | null;
    createdAt: string | null;
  }>;
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useForumPosts = () => {
  const discussions = useForumStore((state) => state.discussions);
  const isLoading = useForumStore((state) => state.isLoading);
  const error = useForumStore((state) => state.error);

  const setDiscussions = useForumStore((state) => state.setDiscussions);
  const setLoading = useForumStore((state) => state.setLoading);
  const setError = useForumStore((state) => state.setError);

  // Fetch all forum posts
  const fetchForumPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forum-posts`);
      if (!response.ok) throw new Error('Failed to fetch forum posts');

      const rawData: BackendForumPost[] = await response.json();
      const transformedDiscussions = rawData.map(transformBackendToForumDiscussion);

      setDiscussions(transformedDiscussions);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [setDiscussions, setLoading, setError]);

  // Create new discussion
  const createDiscussion = useCallback(async (discussion: ForumDiscussion) => {
    try {
      const postData = {
        userEmail: 'user1@example.com', // Use a valid user email from database
        businessUen: null, // Always null for now - user input is free text, not actual business UENs
        title: discussion.title,
        body: discussion.content,
      };

      console.log('Creating discussion with data:', postData);

      const response = await fetch(`${API_BASE_URL}/forum-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error('Failed to create discussion');
      }

      // Refetch all discussions to get the new one with proper ID from database
      await fetchForumPosts();
    } catch (error: any) {
      console.error('Create discussion error:', error);
      setError(error.message || 'Failed to create discussion');
      throw error;
    }
  }, [fetchForumPosts, setError]);

  // Create new reply
  const createReply = useCallback(async (discussionId: string, reply: ForumReply) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forum-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: parseInt(discussionId),
          userEmail: 'user1@example.com', // Use a valid user email from database
          body: reply.content,
        }),
      });

      if (!response.ok) throw new Error('Failed to create reply');

      // Refetch all discussions to get the new reply
      await fetchForumPosts();
    } catch (error: any) {
      setError(error.message || 'Failed to create reply');
      throw error;
    }
  }, [fetchForumPosts, setError]);

  // Like a discussion
  const likeDiscussion = useCallback(async (discussionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/forum-posts/likes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: parseInt(discussionId),
          clicked: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to update likes');

      // Refetch to get updated like count
      await fetchForumPosts();
    } catch (error: any) {
      setError(error.message || 'Failed to update likes');
      throw error;
    }
  }, [fetchForumPosts, setError]);

  // Initial fetch on mount
  useEffect(() => {
    if (discussions.length === 0) {
      fetchForumPosts();
    }
  }, [discussions.length, fetchForumPosts]);

  return {
    discussions,
    isLoading,
    error,
    createDiscussion,
    createReply,
    likeDiscussion,
    refreshDiscussions: fetchForumPosts,
  };
};
