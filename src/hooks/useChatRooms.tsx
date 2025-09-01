import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import { getMainImageWithFallback } from "@/utils/imageUtils";

interface ChatRoom {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  last_message: string | null;
  last_updated: string;
  created_at: string;
  unread_count: number;
  other_user_name: string;
  product_title: string | null;
  product_image: string | null;
}

export const useChatRooms = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchChatRooms = useCallback(async (): Promise<ChatRoom[]> => {
    if (!user) return [];

    // Fetch basic chat room data
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        buyer_id,
        seller_id,
        product_id,
        last_message,
        last_updated,
        created_at
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_updated', { ascending: false })
      .limit(50); // Increased limit for better UX

    if (error) throw error;

    if (!rooms || rooms.length === 0) {
      return [];
    }

    // Enrich chat rooms with additional data in parallel
    const enrichedRooms = await Promise.all(
      rooms.map(async (room) => {
        const otherUserId = room.buyer_id === user.id ? room.seller_id : room.buyer_id;
        
        // Get other user's name
        const { data: otherUser } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherUserId)
          .single();

        // Get product details
        const { data: product } = await supabase
          .from('product_submissions')
          .select('title, images, main_image_index')
          .eq('id', room.product_id)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact' })
          .eq('room_id', room.id)
          .eq('receiver_id', user.id)
          .eq('read', false);

        return {
          ...room,
          other_user_name: otherUser?.full_name || 'Unknown User',
          product_title: product?.title || null,
          product_image: product?.images ? getMainImageWithFallback(product.images, product.main_image_index) : null,
          unread_count: unreadCount || 0,
        };
      })
    );

    return enrichedRooms;
  }, [user]);

  const {
    data: chatRooms = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['chat-rooms', user?.id],
    queryFn: fetchChatRooms,
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch when component mounts (use cached data)
  });

  // Function to manually refresh data
  const refreshChatRooms = useCallback(() => {
    queryClient.invalidateQueries(['chat-rooms', user?.id]);
  }, [queryClient, user?.id]);

  return {
    chatRooms,
    isLoading,
    error,
    isFetching, // True when background refetch is happening
    refetch: refreshChatRooms,
  };
};
