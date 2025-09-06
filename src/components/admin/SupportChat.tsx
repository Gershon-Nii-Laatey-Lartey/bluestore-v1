import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, User, Shield, CheckCircle, RotateCcw, Trash2, ArrowLeft, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SupportSession {
  id: string;
  user_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  assigned_worker_id: string | null;
  status: 'pending' | 'active' | 'resolved' | 'transferred';
  case_number: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
  unread_count?: number;
  display_name?: string;
}

interface SupportMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'visitor' | 'worker' | 'admin';
  message_text: string;
  sent_at: string;
}

export const SupportChat = () => {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [showSessionsList, setShowSessionsList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
      subscribeToMessages(selectedSession.id);
    }
    
    return () => {
      if (subscriptionRef.current) {
        console.log('Cleaning up admin subscription on unmount');
        if (subscriptionRef.current.type === 'polling') {
          clearInterval(subscriptionRef.current.interval);
        } else {
          supabase.removeChannel(subscriptionRef.current);
        }
      }
    };
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      const { data: sessionsData, error } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const enrichedSessions = await Promise.all(
        sessionsData.map(async (session) => {
          const { data: lastMessage } = await supabase
            .from('support_chat_messages')
            .select('message_text')
            .eq('session_id', session.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from('support_chat_messages')
            .select('*', { count: 'exact' })
            .eq('session_id', session.id)
            .eq('sender_id', '!=', session.user_id)
            .eq('read', false);

          // Get user information if user_id exists
          let userName = session.visitor_name || session.visitor_email || 'Anonymous';
          if (session.user_id) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', session.user_id)
              .single();
            
            if (userProfile) {
              userName = userProfile.full_name || userProfile.email || userName;
            }
          }

          return {
            ...session,
            last_message: lastMessage?.message_text || 'No messages yet',
            unread_count: unreadCount || 0,
            display_name: userName
          };
        })
      );

      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load support sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (sessionId: string) => {
    console.log('Setting up admin subscription for session:', sessionId);
    
    // Clean up existing subscription/interval
    if (subscriptionRef.current) {
      console.log('Removing existing admin subscription');
      if (subscriptionRef.current.type === 'polling') {
        clearInterval(subscriptionRef.current.interval);
      } else {
        supabase.removeChannel(subscriptionRef.current);
      }
    }

    // Since real-time might not work due to table setup, use efficient polling
    console.log('Using efficient polling for admin support chat');
    startPolling(sessionId);
  };

  const startPolling = (sessionId: string) => {
    console.log('Starting efficient polling for admin session:', sessionId);
    
    // Store the last message timestamp to only fetch newer messages
    let lastMessageTime = new Date().toISOString();
    
    const pollInterval = setInterval(async () => {
      try {
        const { data: newMessages, error } = await supabase
          .from('support_chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .gt('sent_at', lastMessageTime)
          .order('sent_at', { ascending: true });

        if (error) throw error;

        if (newMessages && newMessages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id));
            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
            if (uniqueNewMessages.length > 0) {
              console.log('Admin polling found new support messages:', uniqueNewMessages.length);
              // Update the last message time to the newest message
              lastMessageTime = uniqueNewMessages[uniqueNewMessages.length - 1].sent_at;
              return [...prev, ...uniqueNewMessages];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Admin support chat polling error:', error);
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

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedSession) return;

    try {
      setSending(true);
      
      const { data: newMessage, error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: selectedSession.id,
          sender_id: user?.id,
          sender_type: 'admin',
          message_text: messageText.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new message to local state immediately
      setMessages(prev => [...prev, newMessage]);

      setMessageText("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: 'active' | 'resolved') => {
    try {
      setUpdatingStatus(sessionId);
      
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: newStatus } : s
      ));

      if (selectedSession?.id === sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: "Status Updated",
        description: `Chat marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'transferred': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 2: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const activeSessions = sessions.filter(s => s.status !== 'resolved');
  const resolvedSessions = sessions.filter(s => s.status === 'resolved');

  const renderSessionList = (sessionList: SupportSession[]) => (
    <div className={cn(
      "overflow-y-auto overscroll-contain",
      isMobile ? "h-[calc(100vh-200px)]" : "h-[calc(100vh-280px)]"
    )}>
      {sessionList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No {activeTab === 'active' ? 'active' : 'resolved'} chats</p>
        </div>
      ) : (
        sessionList.map((session) => (
          <div
            key={session.id}
            className={cn(
              "p-3 cursor-pointer hover:bg-accent border-b border-border transition-colors",
              isMobile && "py-4 active:bg-accent/80", // Larger touch target and active state on mobile
              selectedSession?.id === session.id && "bg-primary/10 border-primary/20",
              session.status === 'resolved' && "opacity-60 bg-muted/50"
            )}
            onClick={() => handleSessionSelect(session)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {session.display_name ? session.display_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">
                      {session.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm text-muted-foreground truncate mb-2",
                  isMobile && "text-xs leading-relaxed"
                )}>
                  {session.last_message}
                </p>
                <div className={cn(
                  "flex items-center space-x-2",
                  isMobile && "flex-wrap gap-1"
                )}>
                  <Badge className={cn(
                    getStatusColor(session.status), 
                    "variant-secondary",
                    isMobile && "text-xs px-2 py-1"
                  )}>
                    {session.status}
                  </Badge>
                  <Badge className={cn(
                    getPriorityColor(session.priority), 
                    "variant-secondary",
                    isMobile && "text-xs px-2 py-1"
                  )}>
                    P{session.priority}
                  </Badge>
                  {session.unread_count > 0 && (
                    <Badge variant="destructive" className={cn(
                      "ml-auto",
                      isMobile && "text-xs px-2 py-1"
                    )}>
                      {session.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Mobile-specific functions
  const handleSessionSelect = (session: SupportSession) => {
    setSelectedSession(session);
    if (isMobile) {
      setShowSessionsList(false);
    }
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    if (isMobile) {
      setShowSessionsList(true);
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        isMobile ? "h-[calc(100vh-200px)]" : "h-64"
      )}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading support chats...</p>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-200px)] bg-background">
        {/* Mobile Sessions List View */}
        {!selectedSession && (
          <div className="h-full bg-background">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Support Chats</h2>
                    <p className="text-xs text-muted-foreground">Manage customer support conversations</p>
                  </div>
                </div>
                <Badge variant="secondary">{sessions.length}</Badge>
              </div>
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">No support chats available at the moment.</p>
              )}
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active" className={cn("text-xs", isMobile && "py-3 text-sm")}>
                    Active ({activeSessions.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className={cn("text-xs", isMobile && "py-3 text-sm")}>
                    Resolved ({resolvedSessions.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-4">
                  {renderSessionList(activeSessions)}
                </TabsContent>
                
                <TabsContent value="resolved" className="mt-4">
                  {renderSessionList(resolvedSessions)}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Mobile Chat View */}
        {selectedSession && (
          <div className="h-full flex flex-col bg-white">
            {/* Mobile Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToSessions}
                  className="p-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedSession.display_name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(selectedSession.status)} variant="secondary">
                      {selectedSession.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedSession.priority)} variant="secondary">
                      P{selectedSession.priority}
                    </Badge>
                  </div>
                  {selectedSession.case_number && (
                    <p className="text-xs text-gray-500 mt-1">Case: {selectedSession.case_number}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSession.status === 'resolved' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSessionStatus(selectedSession.id, 'active')}
                      disabled={updatingStatus === selectedSession.id}
                      className="text-xs px-2 py-1"
                    >
                      {updatingStatus === selectedSession.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reopen
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSessionStatus(selectedSession.id, 'resolved')}
                      disabled={updatingStatus === selectedSession.id}
                      className="text-xs px-2 py-1"
                    >
                      {updatingStatus === selectedSession.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' || message.sender_type === 'visitor' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-[85%]">
                      {message.sender_type === 'user' || message.sender_type === 'visitor' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {selectedSession.display_name ? selectedSession.display_name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.sender_type === 'user' || message.sender_type === 'visitor'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className={cn(
                          "text-sm break-words",
                          isMobile && "text-base leading-relaxed"
                        )}>{message.message_text}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isMobile && "text-sm",
                          message.sender_type === 'user' || message.sender_type === 'visitor'
                            ? 'text-gray-500'
                            : 'text-blue-100'
                        )}>
                          {formatTime(message.sent_at)}
                        </p>
                      </div>
                      {message.sender_type !== 'user' && message.sender_type !== 'visitor' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            A
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Message Input */}
            <div className="border-t border-gray-200 p-4 safe-area-bottom">
              <div className="flex space-x-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!messageText.trim() || sending}
                  size="sm"
                  className="min-w-[44px] min-h-[44px]" // Ensure touch target size
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout (existing code)
  return (
    <div className="flex h-[calc(100vh-200px)] bg-background">
      {/* Sessions List */}
      <div className="w-1/3 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Support Chats</h2>
            <Badge variant="secondary">{sessions.length}</Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="text-xs">
                Active ({activeSessions.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">
                Resolved ({resolvedSessions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {renderSessionList(activeSessions)}
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-4">
              {renderSessionList(resolvedSessions)}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedSession.display_name ? selectedSession.display_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedSession.display_name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(selectedSession.status)} variant="secondary">
                        {selectedSession.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedSession.priority)} variant="secondary">
                        Priority {selectedSession.priority}
                      </Badge>
                      {selectedSession.case_number && (
                        <Badge variant="outline">{selectedSession.case_number}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSession.status === 'resolved' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSessionStatus(selectedSession.id, 'active')}
                      disabled={updatingStatus === selectedSession.id}
                    >
                      {updatingStatus === selectedSession.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reopen
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSessionStatus(selectedSession.id, 'resolved')}
                      disabled={updatingStatus === selectedSession.id}
                    >
                      {updatingStatus === selectedSession.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' || message.sender_type === 'visitor' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-md">
                      {message.sender_type === 'user' || message.sender_type === 'visitor' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300 text-xs">
                            {selectedSession.display_name ? selectedSession.display_name.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.sender_type === 'user' || message.sender_type === 'visitor'
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.message_text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'user' || message.sender_type === 'visitor'
                            ? 'text-muted-foreground'
                            : 'text-primary-foreground/70'
                        }`}>
                          {formatTime(message.sent_at)}
                        </p>
                      </div>
                      {message.sender_type !== 'user' && message.sender_type !== 'visitor' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            A
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4 safe-area-bottom">
              <div className="flex space-x-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!messageText.trim() || sending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 