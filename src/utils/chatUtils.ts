// Chat utility functions
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ChatStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

// Function to mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('room_id', roomId)
      .eq('receiver_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};
