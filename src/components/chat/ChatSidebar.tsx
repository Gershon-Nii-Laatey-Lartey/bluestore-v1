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
import { useChatRooms } from "@/hooks/useChatRooms";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshTrigger } = useChatStore();
  const { chatRooms, isLoading, isFetching, refetch } = useChatRooms();
  const lastElementRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Refresh chat rooms when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);



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
    <div className="flex items-center p-3 border-b border-border animate-pulse">
      <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-12"></div>
        </div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border h-96">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Your Chats</h2>
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
    <div className="bg-card rounded-lg shadow-sm border border-border h-96 flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Your Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chatRooms.map((room, index) => (
              <div
                key={room.id}
                ref={index === chatRooms.length - 1 ? lastElementRef : null}
                onClick={() => handleRoomClick(room)}
                className={`flex items-center p-3 hover:bg-accent cursor-pointer border-b border-border transition-colors ${
                  currentRoomId === room.id ? 'bg-blue-50 dark:bg-accent border-blue-200 dark:border-primary' : ''
                }`}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage 
                    src={room.product_image || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} 
                    alt={room.product_title || room.other_user_name}
                  />
                  <AvatarFallback className="bg-blue-100 dark:bg-primary/10 text-blue-600 dark:text-primary text-xs">
                    {room.other_user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-card-foreground truncate">
                      {room.other_user_name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {room.unread_count > 0 && (
                        <span className="bg-blue-600 dark:bg-primary text-white dark:text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                          {room.unread_count > 9 ? '9+' : room.unread_count}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center">
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
                      <p className="text-xs text-muted-foreground truncate">
                        About: {room.product_title}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {room.last_message || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <div ref={loadingRef} className="flex items-center justify-center p-3">
                {/* <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> */}
                <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && chatRooms.length > 0 && (
              <div className="text-center py-3 text-xs text-muted-foreground">
                End of conversations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
