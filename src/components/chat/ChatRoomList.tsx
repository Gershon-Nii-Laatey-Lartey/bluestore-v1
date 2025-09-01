import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, Loader2 } from "lucide-react";
import { useChatRooms } from "@/hooks/useChatRooms";
import { Card, CardContent } from "@/components/ui/card";

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

export const ChatRoomList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatRooms, isLoading, isFetching, error } = useChatRooms();
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleRoomClick = (room: ChatRoom) => {
    const otherUserId = room.buyer_id === user?.id ? room.seller_id : room.buyer_id;
    navigate(`/chat/${otherUserId}?productId=${room.product_id}&roomId=${room.id}`);
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
    <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please sign in to view your chats.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <ChatRoomSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading chat rooms. Please try again.</p>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No conversations yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start chatting with sellers by visiting product pages and clicking "Chat with Seller"
        </p>
        <Button onClick={() => navigate('/')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chatRooms.map((room, index) => (
        <div
          key={room.id}
          onClick={() => handleRoomClick(room)}
          className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors"
        >
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage 
              src={room.product_image || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} 
              alt={room.product_title || room.other_user_name}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {room.other_user_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {room.other_user_name}
              </h3>
              <div className="flex items-center space-x-2">
                {room.unread_count > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {room.unread_count > 9 ? '9+' : room.unread_count}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
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
                    className="w-4 h-4 object-cover rounded"
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
      
      {/* Background loading indicator */}
      {isFetching && (
        <div ref={loadingRef} className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Updating...</span>
        </div>
      )}
    </div>
  );
};
