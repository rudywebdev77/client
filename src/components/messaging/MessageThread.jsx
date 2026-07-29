import React, { useState, useEffect, useRef } from 'react';
import { getProjectMessages, sendMessage } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { FiSend, FiPaperclip, FiFile, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const MessageThread = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getProjectMessages(projectId);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Polling every 10s for new messages
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('message', text);
      files.forEach((file) => formData.append('attachments', file));

      const res = await sendMessage(formData);
      if (res.success) {
        setText('');
        setFiles([]);
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-slate-800 p-4">
        <FiMessageSquare className="text-indigo-400 h-5 w-5" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Discussion</h3>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xxs font-semibold text-slate-400">{msg.sender?.fullName || 'User'}</span>
                  <span className="text-xxs text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  {msg.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                      {msg.attachments.map((att) => (
                        <a key={att._id} href={`http://localhost:5000${att.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs underline text-indigo-200 hover:text-white">
                          <FiFile className="h-3.5 w-3.5" /> {att.originalName}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* File preview */}
      {files.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800 flex gap-2 overflow-x-auto">
          {files.map((f, i) => (
            <span key={i} className="text-xxs bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded-md truncate max-w-[150px]">
              {f.name}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-slate-800 p-3 flex items-center gap-2">
        <label className="cursor-pointer p-2 text-slate-400 hover:text-white transition-colors">
          <FiPaperclip className="h-5 w-5" />
          <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
        </label>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <FiSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};
export default MessageThread;
