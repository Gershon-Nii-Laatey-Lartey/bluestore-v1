
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

import { adAnalyticsService } from "@/services/adAnalyticsService";
import { getMainImageWithFallback } from "@/utils/imageUtils";
import { useChatStore } from "@/utils/chatUtils";

const Chat = () => {
  const { sellerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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



  const MobileChatSkeleton = () => (
    <div className="h-screen flex flex-col">
      {/* Mobile Header Skeleton */}
      <div className="bg-background border-b border-border p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4 bg-background">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs ${index % 2 === 0 ? 'bg-muted' : 'bg-primary'} rounded-lg p-3`}>
              <div className="h-4 bg-muted-foreground/20 rounded w-32"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-16 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input Skeleton */}
      <div className="border-t border-border p-4 bg-background">
        <div className="animate-pulse flex space-x-2">
          <div className="flex-1 h-10 bg-muted rounded"></div>
          <div className="w-10 h-10 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );

  const DesktopChatSkeleton = () => (
    <div className="flex h-screen">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r border-border bg-muted/20">
        <div className="p-4 border-b border-border">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-border p-4 bg-background">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4 bg-background">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs ${index % 2 === 0 ? 'bg-muted' : 'bg-primary'} rounded-lg p-3`}>
                <div className="h-4 bg-muted-foreground/20 rounded w-32"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-16 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Skeleton */}
        <div className="border-t border-border p-4 bg-background">
          <div className="animate-pulse flex space-x-2">
            <div className="flex-1 h-10 bg-muted rounded"></div>
            <div className="w-10 h-10 bg-muted rounded"></div>
          </div>
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

  const handleRoomChange = async (newRoomId: string, newProductId: string, newSellerId: string) => {
    // Update URL params without full page refresh
    setSearchParams({
      productId: newProductId,
      roomId: newRoomId
    });
    
    // Update local state
    setChatRoom(null);
    setMessages([]);
    setSellerName('');
    setProductTitle('');
    setProductImage('');
    
    // Fetch new room data
    try {
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', newRoomId)
        .single();
      
      if (room) {
        setChatRoom(room);
        
        // Get seller and product info
        if (newProductId) {
          const { data: product } = await supabase
            .from('product_submissions')
            .select('title, images, main_image_index')
            .eq('id', newProductId)
            .single();
          
          if (product) {
            setProductTitle(product.title);
            if (product.images && product.images.length > 0) {
              setProductImage(getMainImageWithFallback(product.images, product.main_image_index));
            }
          }
        }
        
        // Get seller name
        const { data: sellerProfile } = await supabase
          .from('vendor_profiles')
          .select('business_name')
          .eq('user_id', newSellerId)
          .maybeSingle();
        
        if (sellerProfile?.business_name) {
          setSellerName(sellerProfile.business_name);
        } else {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newSellerId)
            .maybeSingle();
          
          if (userProfile?.full_name) {
            setSellerName(userProfile.full_name);
          }
        }
      }
    } catch (error) {
      console.error('Error changing room:', error);
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
    if (!message.trim() || !chatRoom || !user) return;

    console.log('Sending message:', message.trim());
    console.log('Chat room:', chatRoom.id);
    console.log('User:', user.id);

    try {
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: user.id,
          receiver_id: sellerId,
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
    if (isMobile) {
      return <MobileChatSkeleton />;
    } else {
      return (
        <Layout>
          <DesktopChatSkeleton />
        </Layout>
      );
    }
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
      <div className="h-screen flex flex-col bg-muted">
        {/* Mobile Header - Chat Description Card */}
        <div className="bg-background border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {productImage && (
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={productImage} 
                  alt={productTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {sellerName || 'Seller'}
              </h3>
              {productTitle && (
                <p className="text-sm text-muted-foreground truncate">
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
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
                <p className="text-muted-foreground">Send a message to begin chatting</p>
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
                      : 'bg-background text-foreground shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message_text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === user.id ? 'text-blue-100' : 'text-muted-foreground'
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
        <div className="fixed bottom-0 left-0 right-0 border-t p-4 bg-background shadow-lg">
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

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="flex h-screen">
                 {/* Sidebar */}
         {!isMobile && (
           <div className="w-80 border-r bg-muted">
             <ChatSidebar 
               currentRoomId={chatRoom?.id} 
               onRoomChange={handleRoomChange}
             />
           </div>
         )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 bg-background">
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
                <h3 className="font-semibold text-foreground truncate">
                  {sellerName || 'Seller'}
                </h3>
                {productTitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {productTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">Send a message to begin chatting</p>
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
                        : 'bg-background text-foreground shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.message_text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === user.id ? 'text-blue-100' : 'text-muted-foreground'
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
          <div className="border-t p-4 bg-background">
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
    </Layout>
  );
};

export default Chat;
