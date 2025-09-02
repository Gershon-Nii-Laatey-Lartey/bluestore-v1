
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Search, 
  Edit3, 
  Phone, 
  Video, 
  Info,
  Mic,
  Smile,
  Paperclip,
  MapPin,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { adAnalyticsService } from "@/services/adAnalyticsService";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { useChatStore } from "@/utils/chatUtils";

const Chat = () => {
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const roomId = searchParams.get('roomId');
  const createOnMessage = searchParams.get('createOnMessage');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { triggerRefresh } = useChatStore();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [sellerName, setSellerName] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productImage, setProductImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);
  const subscriptionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up subscription on unmount');
        if (subscriptionRef.current.type === 'polling') {
          clearInterval(subscriptionRef.current.interval);
        } else {
          supabase.removeChannel(subscriptionRef.current);
        }
      }
    };
  }, []);



  const ChatSkeleton = () => (
    <div className="h-screen flex flex-col">
      {/* Mobile Header Skeleton */}
      {isMobile && (
        <div className="bg-white border-b p-4">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-500'} rounded-lg p-3`}>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input Skeleton */}
      <div className="border-t p-4">
        <div className="animate-pulse flex space-x-2">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (user && sellerId) {
      initializeChat();
    }
  }, [user, sellerId]);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom]);

  // Handle desktop chat room selection
  useEffect(() => {
    if (selectedChatRoom && isDesktop) {
      fetchMessages(selectedChatRoom.id);
      // Mark messages as read when selecting a chat room
      markMessagesAsRead(selectedChatRoom.id);
    }
  }, [selectedChatRoom, isDesktop]);

  const findOrCreateChatRoom = async () => {
    if (!user || !sellerId) return null;

    try {
      console.log('Finding or creating chat room for user:', user.id, 'seller:', sellerId);
      let existingRoom = null;

      // If roomId is provided, use that room
      if (roomId) {
        console.log('Using provided roomId:', roomId);
        const { data: room } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (room) {
          console.log('Found room by roomId:', room.id);
          return room;
        }
      }

      // Look for existing room between these users for this product
      console.log('Looking for existing room between users');
      const { data: roomsByParticipants } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`)
        .eq('product_id', productId || '');

      if (roomsByParticipants && roomsByParticipants.length > 0) {
        existingRoom = roomsByParticipants[0];
        console.log('Found existing room:', existingRoom.id);
        return existingRoom;
      }

      // If no existing room found, create new one
      console.log('Creating new chat room');
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId || '',
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Created new room:', newRoom.id);
      return newRoom;
    } catch (error) {
      console.error('Error finding/creating chat room:', error);
      return null;
    }
  };

  const markMessagesAsRead = async (roomId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('room_id', roomId)
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        console.log('Messages marked as read for room:', roomId);
        // Trigger refresh of chat rooms to update unread counts
        triggerRefresh();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setMessagesLoading(true);
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('id, message_text, sender_id, receiver_id, sent_at, read')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
      
      // Mark messages as read after fetching them
      await markMessagesAsRead(roomId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    console.log('Setting up subscription for room:', roomId);
    
    // Clean up existing subscription/interval
    if (subscriptionRef.current) {
      console.log('Removing existing subscription');
      if (subscriptionRef.current.type === 'polling') {
        clearInterval(subscriptionRef.current.interval);
      } else {
        supabase.removeChannel(subscriptionRef.current);
      }
    }

    // Since real-time is not working due to table setup, use efficient polling
    console.log('Using efficient polling instead of real-time');
    startPolling(roomId);
  };

  const startPolling = (roomId: string) => {
    console.log('Starting efficient polling for room:', roomId);
    
    // Store the last message timestamp to only fetch newer messages
    let lastMessageTime = new Date().toISOString();
    
    const pollInterval = setInterval(async () => {
      try {
        const { data: newMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .gt('sent_at', lastMessageTime)
          .order('sent_at', { ascending: true });

        if (error) throw error;

        if (newMessages && newMessages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
            if (uniqueNewMessages.length > 0) {
              console.log('Polling found new messages:', uniqueNewMessages.length);
              // Update the last message time to the newest message
              lastMessageTime = uniqueNewMessages[uniqueNewMessages.length - 1].sent_at;
              return [...prev, ...uniqueNewMessages];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000); // Poll every 1 second for more responsive experience

    // Store the interval ID for cleanup
    subscriptionRef.current = { type: 'polling', interval: pollInterval };
    
    return () => {
      if (subscriptionRef.current && subscriptionRef.current.type === 'polling') {
        clearInterval(subscriptionRef.current.interval);
      }
    };
  };

  const initializeChat = async () => {
    if (!user || !sellerId) return;

    try {
      setLoading(true);

      // Find or create chat room
      const room = await findOrCreateChatRoom();
      if (!room) {
        toast({
          title: "Error",
          description: "Failed to initialize chat",
          variant: "destructive"
        });
        return;
      }

      setChatRoom(room);

      // Set up real-time subscription for messages
      console.log('Setting up subscription for room:', room.id);
      subscribeToMessages(room.id);
      console.log('Subscription setup completed for room:', room.id);

      // Fetch seller and product details
      if (productId) {
        const { data: productData } = await supabase
          .from('product_submissions')
          .select('title, images, main_image_index')
          .eq('id', productId)
          .single();

        if (productData) {
          setProductTitle(productData.title);
          setProductImage(getMainImageWithFallback(productData.images || [], productData.main_image_index));
        }
      }

      // Fetch seller name
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sellerId)
        .single();

      if (sellerData) {
        setSellerName(sellerData.full_name);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    // Determine which chat room to use based on mode
    const activeRoom = isDesktop ? selectedChatRoom : chatRoom;
    if (!message.trim() || !activeRoom || !user) return;

    console.log('Sending message:', message.trim());
    console.log('Chat room:', activeRoom.id);
    console.log('User:', user.id);

    try {
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: activeRoom.id,
          sender_id: user.id,
          receiver_id: isDesktop ? 
            (activeRoom.buyer_id === user.id ? activeRoom.seller_id : activeRoom.buyer_id) : 
            sellerId,
          message_text: message.trim()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Message sent successfully:', newMessage);

      // Add the new message to local state immediately
      setMessages(prev => {
        console.log('Adding message to local state, prev count:', prev.length);
        return [...prev, newMessage];
      });

      // Track message for analytics if productId is available
      if (productId) {
        adAnalyticsService.trackMessage(productId).catch(error => {
          console.error('Error tracking message:', error);
        });
      }

      setMessage("");
      
      // Force scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading || messagesLoading) {
    return <ChatSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in to chat</h2>
          <p className="text-gray-600">You need to be logged in to start a conversation.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile Header - Chat Description Card */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {productImage && (
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={productImage} 
                  alt={productTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {sellerName || 'Seller'}
              </h3>
              {productTitle && (
                <p className="text-sm text-gray-500 truncate">
                  {productTitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages - with bottom padding to account for fixed input bar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === user.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message_text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.sent_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Fixed Message Input Bar at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t p-4 bg-white shadow-lg">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Chat Interface Components
  const DesktopChatList = () => (
    <div className="w-80 border-r bg-white flex flex-col">
      {/* Chat List Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="flex-1 overflow-y-auto">
        <ChatSidebar 
          currentRoomId={selectedChatRoom?.id} 
          onRoomSelect={setSelectedChatRoom}
          isDesktop={true}
        />
      </div>
    </div>
  );

  const DesktopChatConversation = () => (
    <div className="flex-1 flex flex-col bg-white">
      {selectedChatRoom ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChatRoom.product_image} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                    {selectedChatRoom.other_user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChatRoom.other_user_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChatRoom.product_title || 'Product'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Send a message to begin chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Date Separator */}
                <div className="text-center">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                    Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
                
                {/* Messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 ${msg.sender_id === user.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {msg.sender_id !== user.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedChatRoom.product_image} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                            {selectedChatRoom.other_user_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === user.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.message_text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.sent_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Mic className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="p-2">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        // No Chat Selected State
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      {/* Desktop Chat Interface */}
      {!isMobile ? (
        <div className="flex h-screen">
          <DesktopChatList />
          <DesktopChatConversation />
        </div>
      ) : (
        /* Mobile Chat Interface - Keep existing mobile layout */
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50">
            <ChatSidebar currentRoomId={chatRoom?.id} />
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b p-4 bg-white">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {productImage && (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={productImage} 
                      alt={productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {sellerName || 'Seller'}
                  </h3>
                  {productTitle && (
                    <p className="text-sm text-gray-500 truncate">
                      {productTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-500">Send a message to begin chatting</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.sent_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="border-t p-4 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Chat;
