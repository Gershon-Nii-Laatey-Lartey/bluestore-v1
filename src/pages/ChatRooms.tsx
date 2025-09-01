
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundLoadingIndicator } from "@/components/ui/background-loading-indicator";
import { useChatRooms } from "@/hooks/useChatRooms";

const ChatRooms = () => {
  const isMobile = useIsMobile();
  const { isFetching } = useChatRooms();

  if (isMobile) {
    return (
      <Layout>
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Conversations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage all your chats with sellers and buyers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <BackgroundLoadingIndicator isFetching={isFetching} />
            <ChatRoomList />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Conversations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all your chats with sellers and buyers
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <BackgroundLoadingIndicator isFetching={isFetching} />
          <ChatRoomList />
        </div>
      </div>
    </Layout>
  );
};

export default ChatRooms;
