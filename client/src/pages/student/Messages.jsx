import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, setActiveChat } from '../../store/slices/chatSlice';
import DashboardLayout from '../../components/common/DashboardLayout';
import ChatBox from '../../components/chat/ChatBox';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function StudentMessages() {
  const dispatch = useDispatch();
  const { chats, activeChat, typingUsers } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { onlineUsers } = useSocket() || { onlineUsers: [] };
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const filteredChats = chats.filter((chat) => {
    const other = user?.role === 'student' ? chat.developer : chat.student;
    const nameMatch = other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const projectMatch = chat.project?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || projectMatch;
  });

  return (
    <DashboardLayout title="Messages">
      <div className="flex gap-0 h-[calc(100vh-12rem)] md:h-[calc(100vh-11rem)] -mx-4 md:-mx-8 my-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card backdrop-blur-md">
        {/* Chat list */}
        <div className={`w-full md:w-80 flex-shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--card)]/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]/30">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-[var(--text)] tracking-tight">Conversations</h3>
              <span className="text-[10px] font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/25">
                {chats.length} active
              </span>
            </div>
            
            {/* Search Input */}
            <div className="relative mt-3.5">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-3 p-4">
                <MessageSquare size={32} className="opacity-30 text-brand-500" />
                <p className="text-xs font-semibold">No conversations found</p>
                {chats.length > 0 && <p className="text-[10px] text-center">Try a different search query</p>}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const other = user?.role === 'student' ? chat.developer : chat.student;
                const isActive = activeChat?._id === chat._id;
                const isOnline = onlineUsers?.includes(other?._id) || other?.isOnline;
                const chatTyping = typingUsers[chat._id] || {};
                const isTyping = Object.keys(chatTyping).some((id) => id !== user?._id);

                return (
                  <div
                    key={chat._id}
                    onClick={() => dispatch(setActiveChat(chat))}
                    className={`flex items-center gap-3.5 p-3.5 cursor-pointer rounded-xl transition-all duration-200 border relative overflow-hidden group/item ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/10 to-violet-600/10 dark:from-brand-500/15 dark:to-violet-600/15 border-brand-500/30 shadow-sm'
                        : 'border-transparent hover:bg-[var(--card-hover)]/70 hover:shadow-xs'
                    }`}
                  >
                    {/* Active highlight bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-violet-600 rounded-r-md" />
                    )}

                    {/* Avatar with dynamic online indicator */}
                    <div className="relative flex-shrink-0">
                      {other?.avatar ? (
                        <img src={other.avatar} className="w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-xs group-hover/item:scale-105 transition-transform duration-300 border border-[var(--border)]" alt="" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-xs text-sm group-hover/item:scale-105 transition-transform duration-300">
                          {other?.name?.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[3px] border-[var(--card)] ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        {isOnline && (
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        )}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-xs text-[var(--text)] truncate ${isActive ? 'text-brand-500 dark:text-brand-400' : ''}`}>
                          {other?.name}
                        </p>
                        {chat.lastMessageAt && (
                          <p className="text-[10px] text-[var(--text-muted)] flex-shrink-0 ml-1 font-semibold">
                            {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })}
                          </p>
                        )}
                      </div>
                      
                      {/* Project Tag */}
                      <span className="inline-block max-w-[170px] truncate text-[9px] font-black tracking-wide uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md mt-1 border border-brand-500/10">
                        {chat.project?.title}
                      </span>
                      
                      {isTyping ? (
                        <p className="text-[11px] text-brand-500 font-semibold truncate mt-1.5 flex items-center gap-1 animate-pulse">
                          ✍️ typing…
                        </p>
                      ) : chat.lastMessage?.content ? (
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-1.5 flex items-center gap-1 font-medium font-sans">
                          {chat.lastMessage.type === 'image' ? (
                            <>
                              <span className="text-xs">📷</span> Image shared
                            </>
                          ) : chat.lastMessage.type === 'file' ? (
                            <>
                              <span className="text-xs">📁</span> File attachment
                            </>
                          ) : (
                            chat.lastMessage.content
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`flex-1 flex flex-col bg-[var(--bg)] ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          <ChatBox chat={activeChat} />
        </div>
      </div>
    </DashboardLayout>
  );
}

