import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  MessageCircle, 
  MoreVertical, 
  Filter,
  Calendar,
  MapPin,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { useChatStore } from "@/utils/chatUtils";

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

interface ChatSidebarProps {
  currentRoomId?: string;
  onRefresh?: () => void;
  onRoomChange?: (roomId: string, productId: string, sellerId: string) => void;
}

export const ChatSidebar = ({ currentRoomId, onRefresh, onRoomChange }: ChatSidebarProps) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const { refreshTrigger } = useChatStore();

  // Refresh chat rooms when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchChatRooms(true);
    }
  }, [refreshTrigger]);



  const ITEMS_PER_PAGE = 8;

  const fetchChatRooms = async (isInitial = false) => {
    if (!user) return;

    try {
      if (isInitial) {
        setLoading(true);
        setPage(0);
        setLastTimestamp(null);
      } else {
        setLoadingMore(true);
      }

      let query = supabase
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
        .limit(ITEMS_PER_PAGE);

      // Add pagination filter if not initial load
      if (!isInitial && lastTimestamp) {
        query = query.lt('last_updated', lastTimestamp);
      }

      const { data: rooms, error } = await query;

      if (error) throw error;

      if (!rooms || rooms.length === 0) {
        if (isInitial) {
          setChatRooms([]);
        }
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Check if we have more data
      if (rooms.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      // Update last timestamp for next page
      if (rooms.length > 0) {
        setLastTimestamp(rooms[rooms.length - 1].last_updated);
      }

      // Get additional data for each room in parallel
      const enrichedRooms = await Promise.all(
        rooms.map(async (room) => {
          const otherUserId = room.buyer_id === user.id ? room.seller_id : room.buyer_id;
          
          // Get other user's name and unread count in parallel
          const [vendorProfile, userProfile, unreadCount, productData] = await Promise.all([
            supabase
              .from('vendor_profiles')
              .select('business_name')
              .eq('user_id', otherUserId)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', otherUserId)
              .maybeSingle(),
            supabase
              .from('chat_messages')
              .select('*', { count: 'exact' })
              .eq('room_id', room.id)
              .eq('receiver_id', user.id)
              .eq('read', false),
            room.product_id ? supabase
              .from('product_submissions')
              .select('title, images, main_image_index')
              .eq('id', room.product_id)
              .maybeSingle() : Promise.resolve({ data: null })
          ]);

          // Prioritize business name from vendor profile, fallback to full name from profiles
          let otherUserName = "Unknown User";
          if (vendorProfile.data?.business_name) {
            otherUserName = vendorProfile.data.business_name;
          } else if (userProfile.data?.full_name) {
            otherUserName = userProfile.data.full_name;
          }

          // Get product title and image if available
          let productTitle = null;
          let productImage = null;
          if (productData.data) {
            productTitle = productData.data.title;
            // Get the main image from the array
            if (productData.data.images && productData.data.images.length > 0) {
              productImage = getMainImageWithFallback(productData.data.images, productData.data.main_image_index);
            }
          }

          return {
            ...room,
            other_user_name: otherUserName,
            product_title: productTitle,
            product_image: productImage,
            unread_count: unreadCount.count || 0
          };
        })
      );

      if (isInitial) {
        setChatRooms(enrichedRooms);
      } else {
        setChatRooms(prev => [...prev, ...enrichedRooms]);
      }
      
      setPage(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchChatRooms(false);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore]);

  useEffect(() => {
    fetchChatRooms(true);

    if (!user) return;

    // Set up real-time subscription for chat room updates
    const channel = supabase
      .channel('chat-sidebar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          fetchChatRooms(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchChatRooms(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_submissions'
        },
        () => {
          fetchChatRooms(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRoomClick = (room: ChatRoom) => {
    const otherUserId = room.buyer_id === user?.id ? room.seller_id : room.buyer_id;
    
    if (onRoomChange) {
      // Desktop mode: use callback to change room without page refresh
      onRoomChange(room.id, room.product_id, otherUserId);
    } else {
      // Mobile mode: navigate to chat page
      navigate(`/chat/${otherUserId}?productId=${room.product_id}&roomId=${room.id}`);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const ChatRoomSkeleton = () => (
    <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Chats</h2>
        </div>
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <ChatRoomSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chatRooms.map((room, index) => (
              <div
                key={room.id}
                ref={index === chatRooms.length - 1 ? lastElementRef : null}
                onClick={() => handleRoomClick(room)}
                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  currentRoomId === room.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700' : ''
                }`}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage 
                    src={room.product_image || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} 
                    alt={room.product_title || room.other_user_name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {room.other_user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {room.other_user_name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {room.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                          {room.unread_count > 9 ? '9+' : room.unread_count}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        {/* <Clock className="h-3 w-3 mr-1" /> */}
                        {formatTime(room.last_updated)}
                      </span>
                    </div>
                  </div>
                  
                  {room.product_title && (
                    <div className="flex items-center gap-2 mt-1">
                      {room.product_image && (
                        <img 
                          src={room.product_image} 
                          alt={room.product_title}
                          className="w-3 h-3 object-cover rounded"
                        />
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        About: {room.product_title}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                    {room.last_message || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <div ref={loadingRef} className="flex items-center justify-center p-3">
                {/* <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> */}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && chatRooms.length > 0 && (
              <div className="text-center py-3 text-xs text-gray-500 dark:text-gray-400">
                End of conversations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
