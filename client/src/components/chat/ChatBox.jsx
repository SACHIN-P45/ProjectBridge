import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addMessage, setActiveChat, editMessageInState, deleteMessageInState } from '../../store/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import {
  Send, Paperclip, File, CheckCheck, Check,
  MessageCircle, ImageIcon, X, Smile, ExternalLink, ChevronLeft,
  MoreHorizontal, Copy, Edit, Trash2, Info
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function dayLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

function groupByDay(messages) {
  const groups = [];
  let lastDay = null;
  for (const msg of messages) {
    const day = format(new Date(msg.createdAt || Date.now()), 'yyyy-MM-dd');
    if (day !== lastDay) {
      groups.push({ type: 'divider', day, label: dayLabel(msg.createdAt) });
      lastDay = day;
    }
    groups.push({ type: 'message', msg });
  }
  return groups;
}

// ──────────────────────────────────────────
// Component
// ──────────────────────────────────────────
export default function ChatBox({ chat }) {
  const dispatch = useDispatch();
  const { socket, onlineUsers } = useSocket() || {};
  const { user } = useSelector((s) => s.auth);
  const { messages, typingUsers } = useSelector((s) => s.chat);
  const chatMessages = messages[chat?._id] || [];

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [filePreview, setFilePreview] = useState(null); // { file, url, type }
  const [lightboxImage, setLightboxImage] = useState(null);

  // Message option actions
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [infoMessage, setInfoMessage] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const otherUser = user?.role === 'student' ? chat?.developer : chat?.student;
  const chatTyping = typingUsers[chat?._id] || {};
  const isOtherTyping = Object.keys(chatTyping).some((id) => id !== user?._id);
  const isOnline = onlineUsers?.includes(otherUser?._id) || otherUser?.isOnline;

  // ── Join / leave room ──────────────────
  useEffect(() => {
    if (!chat?._id) return;
    dispatch(fetchMessages(chat._id));
    socket?.emit('join_room', chat._id);
    inputRef.current?.focus();
    return () => socket?.emit('leave_room', chat._id);
  }, [chat?._id, dispatch, socket]);

  // ── Auto-scroll ────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, isOtherTyping]);

  // ── Mark messages as seen when chat opens or new messages arrive ──────────────────
  useEffect(() => {
    if (!chat?._id || !socket) return;
    
    const hasUnseen = chatMessages.some(m => {
      const senderId = m.sender?._id || m.sender;
      return senderId !== user._id && !m.seen;
    });

    if (hasUnseen) {
      socket.emit('message_seen', { chatId: chat._id, userId: user._id });
      api.put(`/chats/${chat._id}/seen`).catch((err) => console.error('Error marking seen:', err));
    }
  }, [chat?._id, chatMessages.length, socket, user._id]);

  // ── Typing indicator ───────────────────
  const handleTyping = (val) => {
    setMessage(val);
    if (!typing) {
      setTyping(true);
      socket?.emit('typing', { chatId: chat._id, userId: user._id, name: user.name });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      socket?.emit('stop_typing', { chatId: chat._id, userId: user._id });
    }, 1500);
  };

  // ── Core send ─────────────────────────
  const sendMessage = useCallback(async (content, type = 'text', file = null) => {
    if (!content.trim() && !file) return;
    setSending(true);
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', type);
        fd.append('content', content);
        res = await api.post(`/chats/${chat._id}/messages`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post(`/chats/${chat._id}/messages`, { content, type });
      }

      const savedMessage = res.data;

      // 1️⃣ Add to local Redux state immediately
      dispatch(addMessage({ chatId: chat._id, message: savedMessage }));

      // 2️⃣ Relay the message via socket
      socket?.emit('send_message', {
        chatId: chat._id,
        senderId: user._id,
        message: savedMessage,
      });

      // Clear UI
      setMessage('');
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = '';
      if (inputRef.current) inputRef.current.style.height = '46px';
      clearTimeout(typingTimeout.current);
      setTyping(false);
      socket?.emit('stop_typing', { chatId: chat._id, userId: user._id });
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [chat?._id, socket, user, dispatch]);

  // ── File picker ────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    setFilePreview({
      file,
      url: isImg ? URL.createObjectURL(file) : null,
      name: file.name,
      type: isImg ? 'image' : 'file',
    });
  };

  const cancelFile = () => {
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filePreview) {
      const caption = message.trim() || filePreview.name;
      sendMessage(caption, filePreview.type, filePreview.file);
    } else if (message.trim()) {
      sendMessage(message);
    }
  };

  const handleSaveEdit = async (msg) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/chats/${chat._id}/messages/${msg._id}`, { content: editContent });
      const updated = res.data;
      dispatch(editMessageInState({ chatId: chat._id, message: updated }));
      socket?.emit('edit_message', { chatId: chat._id, message: updated });
      setEditingMessageId(null);
      toast.success('Message edited successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.delete(`/chats/${chat._id}/messages/${msg._id}`);
      dispatch(deleteMessageInState({ chatId: chat._id, messageId: msg._id }));
      socket?.emit('delete_message', { chatId: chat._id, messageId: msg._id });
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  // ── Empty state ────────────────────────
  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-[var(--text-muted)] select-none bg-[var(--bg-secondary)]/30 p-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-500/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <MessageCircle size={44} className="text-brand-500 opacity-80" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-[var(--bg)] animate-pulse shadow-md" />
        </div>
        <div className="text-center max-w-sm">
          <h4 className="font-display font-bold text-xl text-[var(--text)] tracking-tight">Select a Conversation</h4>
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            Choose a discussion thread from the left pane to check project details, milestones, payments, or message your developer.
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupByDay(chatMessages);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">

      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm shadow-sm z-10">
        <button
          onClick={() => dispatch(setActiveChat(null))}
          className="md:hidden p-2 -ml-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-all shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="relative flex-shrink-0">
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2 ring-offset-[var(--card)] ring-brand-500/30"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              {otherUser?.name?.charAt(0)}
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
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-[var(--text)] leading-tight text-sm tracking-tight">{otherUser?.name}</p>
            {otherUser?.role === 'developer' && otherUser?.rating && (
              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                ⭐ {otherUser.rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-[11px] mt-1 font-medium">
            {isOtherTyping ? (
              <span className="text-brand-500 font-semibold animate-pulse flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" /> typing…
              </span>
            ) : isOnline ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active now
              </span>
            ) : otherUser?.lastSeen ? (
              <span className="text-[var(--text-muted)] italic font-normal">
                Last active {formatDistanceToNow(new Date(otherUser.lastSeen), { addSuffix: true })}
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">Offline</span>
            )}
          </p>
        </div>

        {/* Project and View details Link */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block max-w-[200px] truncate text-[11px] font-bold text-brand-700 bg-brand-100/60 dark:text-brand-400 dark:bg-brand-900/30 px-2.5 py-1 rounded-full">
            {chat.project?.title}
          </span>
          {chat.project?._id && (
            <Link
              to={user?.role === 'student' ? `/student/projects/${chat.project._id}` : `/developer/assigned`}
              className="btn-secondary px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm shrink-0"
            >
              Project <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Messages ───────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 space-y-3.5"
        style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(59,130,246,0.02) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(139,92,246,0.02) 0%, transparent 40%)' }}
      >
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-sm">
              <MessageCircle size={28} className="opacity-30" />
            </div>
            <p className="text-xs font-semibold">No messages yet. Say hello! 👋</p>
          </div>
        )}

        {grouped.map((item, idx) => {
          if (item.type === 'divider') {
            return (
              <div key={`div-${idx}`} className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border)] shadow-xs">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
            );
          }

          const { msg } = item;
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;

          return (
            <div
              key={msg._id || `tmp-${idx}`}
              className={`flex gap-3 items-end ${isMine ? 'flex-row-reverse' : ''} group relative`}
            >
              {/* Avatar — received messages only */}
              {!isMine && (
                <div className="flex-shrink-0 self-end mb-1">
                  {otherUser?.avatar ? (
                    <img src={otherUser.avatar} alt="" className="w-8 h-8 rounded-full object-cover shadow-xs ring-1 ring-[var(--border)]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      {(msg.sender?.name || otherUser?.name)?.charAt(0)}
                    </div>
                  )}
                </div>
              )}

              {/* Wrapper for bubble and the options trigger button */}
              <div className={`flex items-start gap-1 relative ${isMine ? 'flex-row-reverse' : ''}`}>
                
                {/* Bubble wrapper */}
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>
                  {msg.type === 'image' ? (
                    <div 
                      className={`overflow-hidden rounded-2xl shadow-sm ${
                        isMine 
                          ? 'rounded-br-sm border border-brand-500/20 bg-gradient-to-br from-brand-500 to-violet-600 text-white' 
                          : 'rounded-bl-sm border border-slate-200/60 dark:border-slate-700/40 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <div className="relative cursor-pointer group/image" onClick={() => setLightboxImage(msg.fileUrl)}>
                        <img
                          src={msg.fileUrl}
                          alt="shared attachment"
                          className="max-w-xs max-h-64 object-cover block transition-all duration-300 group-hover/image:scale-[1.02] group-hover/image:opacity-95"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold bg-black/55 backdrop-blur px-2.5 py-1.5 rounded-full flex items-center gap-1">
                            🔍 Preview Image
                          </span>
                        </div>
                      </div>
                      {msg.content && msg.content !== msg.fileName && (
                        <div className="px-4 py-2.5 text-[13.5px] leading-relaxed">
                          {editingMessageId === msg._id ? (
                            <div className="flex flex-col gap-2 w-48 sm:w-64 py-1">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 text-xs bg-slate-200/50 dark:bg-slate-700/50 border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                                rows={2}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingMessageId(null)} className="px-2.5 py-1 rounded-md text-[10px] font-bold border hover:bg-slate-200/40 dark:hover:bg-slate-700/40">Cancel</button>
                                <button onClick={() => handleSaveEdit(msg)} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-500 text-white hover:bg-brand-600">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                              {msg.isEdited && (
                                <span className="text-[9px] opacity-70 ml-1.5 font-semibold select-none italic">(edited)</span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : msg.type === 'file' ? (
                    <div className={`rounded-2xl overflow-hidden shadow-sm ${
                      isMine
                        ? 'rounded-br-sm bg-gradient-to-br from-brand-500 to-violet-600 text-white'
                        : 'rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/40'
                    } w-full max-w-xs`}>
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-3.5 px-4 py-3.5 border-b ${
                          isMine 
                            ? 'border-white/10 hover:bg-white/5 text-white' 
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-200/40 dark:hover:bg-slate-700/40 text-slate-800 dark:text-slate-100'
                        } no-underline transition-all`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-white/20' : 'bg-brand-50 dark:bg-brand-950/40'}`}>
                          <File size={20} className={isMine ? 'text-white' : 'text-brand-500'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-snug">{msg.fileName || 'Download file'}</p>
                          <p className={`text-[10px] ${isMine ? 'text-white/70' : 'text-[var(--text-muted)]'} mt-1 font-semibold`}>Click to download</p>
                        </div>
                      </a>
                      {msg.content && msg.content !== msg.fileName && (
                        <div className="px-4 py-2.5 text-[13.5px] leading-relaxed">
                          {editingMessageId === msg._id ? (
                            <div className="flex flex-col gap-2 w-48 sm:w-64 py-1">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 text-xs bg-slate-200/50 dark:bg-slate-700/50 border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                                rows={2}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingMessageId(null)} className="px-2.5 py-1 rounded-md text-[10px] font-bold border hover:bg-slate-200/40 dark:hover:bg-slate-700/40">Cancel</button>
                                <button onClick={() => handleSaveEdit(msg)} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-500 text-white hover:bg-brand-600">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                              {msg.isEdited && (
                                <span className="text-[9px] opacity-70 ml-1.5 font-semibold select-none italic">(edited)</span>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2.5 shadow-sm ${
                        isMine
                          ? 'rounded-2xl rounded-br-sm bg-gradient-to-br from-brand-500 to-violet-600 text-white'
                          : 'rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/40'
                      }`}
                    >
                      {editingMessageId === msg._id ? (
                        <div className="flex flex-col gap-2 w-48 sm:w-64 py-1">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 text-xs bg-slate-200/50 dark:bg-slate-700/50 border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingMessageId(null)} className="px-2.5 py-1 rounded-md text-[10px] font-bold border hover:bg-slate-200/40 dark:hover:bg-slate-700/40">Cancel</button>
                            <button onClick={() => handleSaveEdit(msg)} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-500 text-white hover:bg-brand-600">Save</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words font-normal">
                          {msg.content}
                          {msg.isEdited && (
                            <span className="text-[9px] opacity-70 ml-1.5 font-semibold select-none italic">(edited)</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timestamp + status indicators */}
                  <div className="flex items-center justify-end gap-1 mt-1 px-1 select-none">
                    <span className="text-[9px] font-semibold text-[var(--text-muted)]">
                      {format(new Date(msg.createdAt || Date.now()), 'HH:mm')}
                    </span>
                    {isMine && (
                      msg.seen ? (
                        <CheckCheck size={14} className="text-sky-400 font-bold shrink-0" />
                      ) : msg.delivered ? (
                        <CheckCheck size={14} className="text-[var(--text-muted)] opacity-60 shrink-0" />
                      ) : (
                        <Check size={14} className="text-[var(--text-muted)] opacity-60 shrink-0" />
                      )
                    )}
                  </div>
                </div>

                {/* Dropdown Options trigger */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center relative shrink-0">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                    className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  
                  {activeMenuId === msg._id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                      <div className={`absolute ${isMine ? 'right-0' : 'left-0'} ${idx >= grouped.length - 3 ? 'bottom-full mb-1' : 'top-full mt-1'} w-32 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-40 py-1.5 overflow-hidden text-left`}>
                        <button 
                          onClick={() => {
                            setInfoMessage(msg);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                        >
                          <Info size={13} className="text-blue-500" /> Info
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            toast.success('Copied to clipboard');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                        >
                          <Copy size={13} className="text-emerald-500" /> Copy
                        </button>
                        {isMine && msg.type === 'text' && (!msg.seen || (msg.seenAt && (Date.now() - new Date(msg.seenAt).getTime()) < 3 * 60 * 1000)) && (
                          <button 
                            onClick={() => {
                              setEditingMessageId(msg._id);
                              setEditContent(msg.content);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                          >
                            <Edit size={13} className="text-amber-500" /> Edit
                          </button>
                        )}
                        {isMine && (
                          <button 
                            onClick={() => {
                              handleDeleteMessage(msg);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {/* Dynamic Typing indicators */}
        {isOtherTyping && (
          <div className="flex gap-3 items-end animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
              {otherUser?.name?.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <div className="px-4 py-2 bg-[var(--card)]/85 backdrop-blur-sm border border-[var(--border)] flex gap-1.5 items-center shadow-xs rounded-2xl rounded-bl-sm">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-semibold px-1.5">
                {otherUser?.name || 'Someone'} is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── File attachment preview bar ────────────────── */}
      {filePreview && (
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm flex items-center gap-3.5 animate-slide-up">
          {filePreview.url ? (
            <img src={filePreview.url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm border border-[var(--border)]" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
              <File size={20} className="text-brand-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text)] truncate">{filePreview.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-semibold">
              {filePreview.type === 'image' ? 'Image attachment' : 'File document'} ready to send
            </p>
          </div>
          <button onClick={cancelFile} className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Input box form bar ──────────────────────── */}
      <div className="px-6 py-4.5 border-t border-[var(--border)] bg-[var(--card)]">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* File input clicker button */}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/25 border border-transparent hover:border-[var(--border)] transition-all flex-shrink-0 mb-0.5 shadow-xs"
          >
            <Paperclip size={19} />
          </button>

          {/* Messages text field input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={message}
              onChange={(e) => {
                handleTyping(e.target.value);
                // Auto-expand message box size
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={filePreview ? 'Add a caption (optional)…' : 'Type a message…'}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-[var(--text)] placeholder-[var(--text-muted)] outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 resize-none py-3.5 pr-4 max-h-32 leading-relaxed text-xs"
              style={{ minHeight: '46px', overflowY: 'hidden' }}
              disabled={sending}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={sending || (!message.trim() && !filePreview)}
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 transition-all duration-300 ${
              message.trim() || filePreview
                ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-glow hover:shadow-glow-violet hover:scale-105 active:scale-95'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]'
            }`}
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} className={message.trim() || filePreview ? '' : 'opacity-40'} />
            )}
          </button>
        </form>
        <p className="text-[9px] text-[var(--text-muted)] mt-2.5 px-1 font-semibold">Enter to send · Shift+Enter for new line</p>
      </div>

      {/* ── Gorgeous Full-Screen Image Lightbox ────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/10"
            onClick={() => setLightboxImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen attachment view"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 transform scale-100"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* ── Message Info Modal ────────────────── */}
      {infoMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setInfoMessage(null)}
        >
          <div 
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-black text-base mb-4 text-[var(--text)]">Message Info</h3>
            <div className="space-y-3.5 text-xs font-semibold text-[var(--text-muted)]">
              <div className="flex justify-between border-b border-[var(--border)] pb-2.5">
                <span>Sent</span>
                <span className="text-[var(--text)]">{format(new Date(infoMessage.createdAt), 'MMM d, yyyy · HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2.5">
                <span>Delivered</span>
                <span className="text-[var(--text)]">
                  {infoMessage.deliveredAt 
                    ? format(new Date(infoMessage.deliveredAt), 'MMM d, yyyy · HH:mm:ss')
                    : (isOnline ? 'Delivered' : 'Sent (Pending delivery)')}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Read</span>
                <span className={infoMessage.seenAt ? 'text-sky-500 font-bold' : 'text-[var(--text-muted)]'}>
                  {infoMessage.seenAt 
                    ? format(new Date(infoMessage.seenAt), 'MMM d, yyyy · HH:mm:ss')
                    : 'Unread'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setInfoMessage(null)} 
              className="mt-6 w-full py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text)] font-bold transition-all text-xs border border-[var(--border)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
