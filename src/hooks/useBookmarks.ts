// hooks/useBookmarks.ts
import { useMemo, useCallback } from 'react';
import { useBusinessStore } from '../store/businessStore';
import { toast } from 'sonner';

export const useBookmarks = () => {
  const store = useBusinessStore();

  // Get bookmarked businesses
  const bookmarkedBusinesses = useMemo(() => {
    const bookmarkedIds = store.bookmarkedBusinesses.map((b) => b.businessId);
    return store.businesses.filter((business) =>
      bookmarkedIds.includes(business.id)
    );
  }, [store.businesses, store.bookmarkedBusinesses]);

  // Toggle bookmark with feedback
  const toggleBookmark = useCallback(
    (businessId: string) => {
      const wasBookmarked = store.isBookmarked(businessId);
      store.toggleBookmark(businessId);
      
      // Show user feedback
      toast.success(
        wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'
      );
    },
    [store]
  );

  return {
    bookmarkedBusinesses,
    bookmarkCount: store.bookmarkedBusinesses.length,
    toggleBookmark,
    isBookmarked: store.isBookmarked,
  };
};