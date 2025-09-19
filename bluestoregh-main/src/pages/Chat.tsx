
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { MessageCircle, MoreVertical, Send, Phone, Video, ChevronLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  id: number;
  message: string;
  sent: boolean;
  time: string;
  isBot?: boolean;
  isAgent?: boolean;
}

const conversations = [
  {
    id: 1,
    vendor: "TechStore",
    lastMessage: "Your Xbox Series X is ready for pickup!",
    time: "2m ago",
    unread: 2,
    avatar: "TS"
  },
  {
    id: 2,
    vendor: "MobileHub",
    lastMessage: "Thank you for your purchase",
    time: "1h ago", 
    unread: 0,
    avatar: "MH"
  },
  {
    id: 3,
    vendor: "GamingWorld",
    lastMessage: "Is the controller still available?",
    time: "3h ago",
    unread: 1,
    avatar: "GW"
  }
];

const messagesByConversation: Record<number | string, Message[]> = {
  1: [
    {
      id: 1,
      message: "Hi! I'm interested in the Xbox Series X",
      sent: true,
      time: "10:30 AM"
    },
    {
      id: 2,
      message: "Hello! Yes, it's available. Would you like to know more about it?",
      sent: false,
      time: "10:32 AM"
    },
    {
      id: 3,
      message: "Yes, what's the condition and does it come with warranty?",
      sent: true,
      time: "10:35 AM"
    },
    {
      id: 4,
      message: "It's brand new, sealed box with 1 year manufacturer warranty. We also provide 30-day return policy.",
      sent: false,
      time: "10:37 AM"
    }
  ],
  2: [
    {
      id: 1,
      message: "Hi, I've received my order but I have a question about the accessories",
      sent: true,
      time: "9:15 AM"
    },
    {
      id: 2,
      message: "Hello! What would you like to know about the accessories?",
      sent: false,
      time: "9:20 AM"
    }
  ],
  3: [
    {
      id: 1,
      message: "Is the PS5 controller still available?",
      sent: true,
      time: "Yesterday"
    },
    {
      id: 2,
      message: "Yes, we have both black and white colors in stock",
      sent: false,
      time: "Yesterday"
    },
    {
      id: 3,
      message: "Great! How much is it and do you offer delivery?",
      sent: true,
      time: "Yesterday"
    }
  ],
  support: [
    {
      id: 1,
      message: "Hello! I'm here to help you. What can I assist you with today?",
      sent: false,
      time: "Just now",
      isBot: true
    }
  ]
};

const supportQuickOptions = [
  "I need help with my account",
  "I have a question about an order",
  "I want to report a problem",
  "I need help with payment",
  "Speak to an agent"
];

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<number | string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [messageInput, setMessageInput] = useState("");
  const [supportMessages, setSupportMessages] = useState<Message[]>(messagesByConversation.support);
  const [isSupport, setIsSupport] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get chat ID from query params if it exists
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const chatId = searchParams.get("id");
    const supportMode = searchParams.get("support");
    
    if (supportMode === "true") {
      setSelectedChat("support");
      setIsSupport(true);
    } else if (chatId) {
      setSelectedChat(parseInt(chatId, 10));
      setIsSupport(false);
    }
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle message send
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      if (selectedChat === "support") {
        const newMessage: Message = {
          id: supportMessages.length + 1,
          message: messageInput,
          sent: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSupportMessages(prev => [...prev, newMessage]);
        
        // Simulate CS agent response
        setTimeout(() => {
          const agentResponse: Message = {
            id: supportMessages.length + 2,
            message: "Thank you for your message. A customer service agent will respond shortly.",
            sent: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAgent: true
          };
          setSupportMessages(prev => [...prev, agentResponse]);
        }, 1000);
      } else {
        console.log(`Sending message to ${selectedChat}: ${messageInput}`);
      }
      setMessageInput("");
    }
  };

  const handleQuickOption = (option: string) => {
    if (option === "Speak to an agent") {
      const agentMessage: Message = {
        id: supportMessages.length + 1,
        message: "I'd like to speak to a customer service agent",
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSupportMessages(prev => [...prev, agentMessage]);
      
      setTimeout(() => {
        const response: Message = {
          id: supportMessages.length + 2,
          message: "I'm connecting you to an agent. Please wait a moment...",
          sent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAgent: true
        };
        setSupportMessages(prev => [...prev, response]);
      }, 500);
    } else {
      setMessageInput(option);
    }
  };

  // Handle back button for mobile view
  const handleBackToList = () => {
    setSelectedChat(null);
    setIsSupport(false);
    navigate("/chat");
  };

  // Check if we should show the chat list or chat window based on screen size and selection
  const showChatList = !selectedChat || !isMobile;
  const showChatWindow = selectedChat !== null;

  const getCurrentMessages = (): Message[] => {
    if (selectedChat === "support") {
      return supportMessages;
    }
    return messagesByConversation[selectedChat as keyof typeof messagesByConversation] || [];
  };

  const getCurrentChatName = () => {
    if (selectedChat === "support") {
      return "Customer Service";
    }
    return conversations.find(c => c.id === selectedChat)?.vendor || "Chat";
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in h-[calc(100vh-64px)] md:h-[calc(100vh-120px)]">
        <div className="flex h-full">
          {/* Chat List - Show on larger screens or when no chat is selected on mobile */}
          {showChatList && !isSupport && (
            <div className={`${isMobile && selectedChat ? 'hidden' : 'block'} w-full ${!isMobile && selectedChat ? 'md:w-1/3' : 'w-full'} border-r bg-white`}>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                    Messages
                  </h1>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedChat === conversation.id ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setSelectedChat(conversation.id);
                      setIsSupport(false);
                      if (isMobile) {
                        navigate(`/chat?id=${conversation.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {conversation.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{conversation.vendor}</h3>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Window */}
          {showChatWindow && (selectedChat !== null) && (
            <div className={`${isMobile && !selectedChat ? 'hidden' : 'flex'} flex-1 flex-col`}>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {selectedChat === "support" ? <Bot className="h-5 w-5" /> : conversations.find(c => c.id === selectedChat)?.avatar || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getCurrentChatName()}
                    </h3>
                    <p className="text-sm text-green-500">
                      {selectedChat === "support" ? "Available 24/7" : "Online"}
                    </p>
                  </div>
                </div>
                {selectedChat !== "support" && (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Options for Support */}
              {selectedChat === "support" && supportMessages.length <= 1 && (
                <div className="p-4 border-b bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">How can we help you today?</p>
                  <div className="grid grid-cols-1 gap-2">
                    {supportQuickOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start text-left h-auto p-3"
                        onClick={() => handleQuickOption(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {getCurrentMessages().map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sent
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.sent ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.time}
                        {message.isAgent && " • Agent"}
                        {message.isBot && " • Bot"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center space-x-3">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
