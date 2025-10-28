import { create } from 'zustand';
import { ForumDiscussion, ForumReply } from '../types/forum';
import { mockDiscussions } from '../data/mockForumData';

interface ForumState {
  discussions: ForumDiscussion[];
  addDiscussion: (discussion: ForumDiscussion) => void;
  likeDiscussion: (id: string) => void;
  addReply: (discussionId: string, reply: ForumReply) => void;
}

export const useForumStore = create<ForumState>((set) => ({
  discussions: mockDiscussions,
  addDiscussion: (discussion) =>
    set((state) => ({ discussions: [discussion, ...state.discussions] })),
  likeDiscussion: (id) =>
    set((state) => ({
      discussions: state.discussions.map((d) =>
        d.id === id ? { ...d, likes: d.likes + 1 } : d
      ),
    })),
  addReply: (discussionId, reply) =>
    set((state) => ({
      discussions: state.discussions.map((d) =>
        d.id === discussionId
          ? { ...d, replies: [...d.replies, reply] }
          : d
      ),
    })),
}));
