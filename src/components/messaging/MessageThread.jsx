import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getProjectMessages,
  sendMessage,
  markMessageRead,
  toggleStarMessage,
  togglePinMessage,
  toggleReaction,
  deleteMessage
} from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../context/WebSocketContext';
import {
  FiSend,
  FiPaperclip,
  FiFileText,
  FiImage,
  FiSmile,
  FiMic,
  FiPlay,
  FiPause,
  FiX,
  FiChevronDown,
  FiSearch,
  FiDownload,
  FiCornerUpLeft,
  FiCopy,
  FiTrash2,
  FiStar,
  FiCheck,
  FiFile,
  FiMessageSquare,
  FiInfo,
  FiAlertCircle,
  FiShare
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const FiPin = (props) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="12" y1="17" x2="12" y2="22"></line>
    <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.47A2 2 0 0 1 15 9.29V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.29a2 2 0 0 1-.78 1.24L5.44 14a2 2 0 0 0-.44 1.24z"></path>
  </svg>
);

// Curated WhatsApp Emojis List
const EMOJI_CATEGORIES = {
  Smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '🤪', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '😳', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓'],
  People: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '👂', '👃', '👀', '👁️', '👅', '👄'],
  Animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🐺', '🐗', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🐢', '🐍', '🐙', '🦑', '🦀', '🐬', '🐳', '🐋', '🦈', '🐊', '🦍', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🐕', '🐩', '🐈', '🐇', '🐾'],
  Food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍣', '🍤', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥤'],
  Travel: ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚨', '🚔', '🚘', '🚡', '🚞', '🚉', '🚢', '⛵', '🛥️', '🚤', '✈️', '🛫', '🛬', '🪂', '🚁', '🚀', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '🕰️', '🌡️', '☀️', '🌝', '🌙', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '💥', '🔥', '🌈', '🌧️', '❄️', '💧', '🌊'],
  Objects: ['📱', '💻', '⌨️', '🖱️', '🖨️', '📸', '📹', '🎥', '📽️', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '💸', '💵', '🪙', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '🛠️', '⛏️', '🪓', '📎', '📁', '📂', '📖', '📕', '📝', '💾', '📌', '📍', '🔒', '🔓', '🔑', '🗝️'],
  Symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '☯️', '☦️', '🛐', '⛎', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '✴️', '🆚', '💮', '🉐', '㊙️', '🅰️', '🅱️', '🆎', '🆑', '🆒', '🆓', 'ℹ️', '🆔', '🆕', '🆗', '🆘', '🆙', '🆚']
};

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Helper to format Date Separator WhatsApp Style
const formatDateSeparator = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (msgDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

// Helper to format Message Time
const formatMessageTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper to format File Size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ─────────────────────────────────────────────────────────────────────────────
// Voice message player component with playback speed controls
// ─────────────────────────────────────────────────────────────────────────────
const VoiceMessagePlayer = ({ audioUrl, duration }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const handleSeek = (e) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (e) => {
    e.stopPropagation();
    let nextSpeed = 1;
    if (speed === 1) nextSpeed = 1.5;
    else if (speed === 1.5) nextSpeed = 2;
    setSpeed(nextSpeed);
    audioRef.current.playbackRate = nextSpeed;
  };

  const formatDuration = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Safe fallback url mapping
  const secureUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:5000${audioUrl}`;

  return (
    <div className="flex items-center gap-3 my-0.5 min-w-[220px]">
      <audio ref={audioRef} src={secureUrl} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition duration-150 active:scale-95"
      >
        {playing ? <FiPause className="h-3.5 w-3.5" /> : <FiPlay className="h-3.5 w-3.5 pl-0.5" />}
      </button>

      {/* Waveform + seek */}
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-[2px] h-4 px-0.5">
          {[...Array(20)].map((_, i) => {
            const h = playing ? Math.abs(Math.sin(currentTime * 8 + i * 0.8)) * 10 + 3 : 4;
            const isPlayed = i / 20 < currentTime / (audioRef.current?.duration || duration || 1);
            return (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-[2px] rounded-full transition-all duration-100 ${isPlayed ? 'bg-white' : 'bg-white/40'
                  }`}
              />
            );
          })}
        </div>
        <input
          type="range"
          min={0}
          max={audioRef.current?.duration || duration || 100}
          value={currentTime}
          onChange={handleSeek}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-white opacity-70 hover:opacity-100 transition"
        />
        <div className="flex justify-between text-[9px] text-white/60 font-mono font-medium">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration || audioRef.current?.duration || 0)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSpeedChange}
        className="text-[9px] font-extrabold bg-white/15 hover:bg-white/25 text-white px-1.5 py-0.5 rounded transition duration-150 shrink-0"
      >
        {speed}x
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Primary MessageThread component
// ─────────────────────────────────────────────────────────────────────────────
export const MessageThread = ({ projectId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { socket, status } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Advanced features state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');
  const [replyingTo, setReplyingTo] = useState(null);

  // Dropdown context menu ID
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Voice recording state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState(null);

  // Real-time typing tracking
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Audio recording references
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Fetch all project messages
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const res = await getProjectMessages(projectId);
      if (res.success) {
        setMessages(res.messages);

        // Mark unread messages as read automatically
        res.messages.forEach((msg) => {
          const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id;
          if (!isMe && !msg.isRead) {
            markMessageRead(msg._id).catch(() => { });
          }
        });
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // ── Effect 1: Register message listeners (stable, runs once per socket/projectId) ──
  useEffect(() => {
    if (!socket || !projectId) return;

    const handleNewMessage = (msg) => {
      // Accept messages that belong to this project
      const msgProject = msg.project?._id || msg.project;
      if (String(msgProject) === String(projectId) || String(msg.chatRoomId) === String(projectId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) {
            return prev.map((m) => (m._id === msg._id ? msg : m));
          }
          return [...prev, msg];
        });
        // Mark message as read if received from another user
        const isMe =
          msg.sender?._id === user?.id ||
          msg.sender?._id === user?._id ||
          msg.sender === user?.id ||
          msg.sender === user?._id;
        if (!isMe) {
          markMessageRead(msg._id).catch(() => { });
        }
      }
    };

    const handleMessageUpdated = (msg) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, ...msg } : m)));
    };

    const handleMessageDeleted = (data) => {
      if (data.deleteType === 'everyone') {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? {
                ...m,
                message: '🚫 This message was deleted',
                attachment: '',
                attachmentName: '',
                attachmentType: '',
                attachmentSize: 0,
                voiceUrl: '',
                voiceDuration: 0,
                attachments: [],
              }
              : m
          )
        );
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      }
    };

    const handleReactionUpdated = (data) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    };

    const handleTyping = (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev;
          return [...prev, data];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    socket.addListener('message', handleNewMessage);
    socket.addListener('message_updated', handleMessageUpdated);
    socket.addListener('message_deleted', handleMessageDeleted);
    socket.addListener('reaction_updated', handleReactionUpdated);
    socket.addListener('typing', handleTyping);

    return () => {
      socket.removeListener('message', handleNewMessage);
      socket.removeListener('message_updated', handleMessageUpdated);
      socket.removeListener('message_deleted', handleMessageDeleted);
      socket.removeListener('reaction_updated', handleReactionUpdated);
      socket.removeListener('typing', handleTyping);
    };
  }, [socket, projectId, user]);

  // ── Effect 2: Join / leave project room (only when status becomes 'connected') ──
  useEffect(() => {
    if (!socket || !projectId || status !== 'connected') return;

    socket.send('join_project', { projectId });
    console.log('[WS] Joined project room:', projectId);

    return () => {
      socket.send('leave_project', { projectId });
      console.log('[WS] Left project room:', projectId);
    };
  }, [socket, projectId, status]);

  // Handle auto-scroll logic
  const scrollToBottom = (behavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Only auto-scroll if user is close to bottom to support reading history
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
      if (isAtBottom || messages.length <= 1) {
        scrollToBottom('smooth');
      }
    }
  }, [messages]);

  // Keyboard navigation & close popups
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEmojiPickerOpen(false);
        setActiveMenuId(null);
        setReplyingTo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice recording helpers
  const startVoiceRecording = async () => {
    if (isAdmin) {
      toast.error('Administrators cannot send messages.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceBlob(blob);
        setVoicePreviewUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setVoiceRecording(true);
      setRecordingTimer(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
      toast.success('Recording voice message...');
    } catch (err) {
      toast.error('Could not access microphone');
      console.error(err);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingIntervalRef.current);
    setVoiceRecording(false);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingIntervalRef.current);
    setVoiceRecording(false);
    setVoiceBlob(null);
    setVoicePreviewUrl(null);
    setRecordingTimer(0);
    toast.error('Recording cancelled');
  };

  // Submit / Send handler
  const handleSend = async (e) => {
    if (e) e.preventDefault();

    if (isAdmin) {
      toast.error('Administrators cannot send messages.');
      return;
    }

    // Validate: Reject only when BOTH text input and files/attachments are empty
    if (!text.trim() && files.length === 0 && !voiceBlob) {
      toast.error('Cannot send an empty message');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('message', text);

      if (replyingTo) {
        formData.append('replyTo', replyingTo._id);
      }

      // Voice message upload
      if (voiceBlob) {
        const audioFile = new File([voiceBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        formData.append('attachments', audioFile);
        formData.append('voiceDuration', recordingTimer);
      } else {
        // Normal file attachment
        files.forEach((file) => formData.append('attachments', file));
      }

      const res = await sendMessage(formData);
      if (res.success) {
        setText('');
        setFiles([]);
        setVoiceBlob(null);
        setVoicePreviewUrl(null);
        setReplyingTo(null);
        setEmojiPickerOpen(false);
        fetchMessages();
        scrollToBottom('smooth');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Star message handler
  const handleToggleStar = async (msgId) => {
    try {
      const res = await toggleStarMessage(msgId);
      if (res.success) {
        toast.success(res.isStarred ? 'Starred message' : 'Unstarred message');
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, isStarred: res.isStarred } : m))
        );
      }
    } catch (err) {
      toast.error('Failed to toggle star');
    }
  };

  // Pin message handler
  const handleTogglePin = async (msgId) => {
    try {
      const res = await togglePinMessage(msgId);
      if (res.success) {
        toast.success(res.isPinned ? 'Pinned message' : 'Unpinned message');
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, isPinned: res.isPinned } : m))
        );
      }
    } catch (err) {
      toast.error('Failed to toggle pin');
    }
  };

  // Reaction picker toggler
  const handleAddReaction = async (msgId, emoji) => {
    if (isAdmin) {
      toast.error('Administrators cannot send messages.');
      return;
    }
    try {
      const res = await toggleReaction(msgId, emoji);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, reactions: res.reactions } : m))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to react');
    }
  };

  // Delete message handler
  const handleDelete = async (msgId, type) => {
    if (isAdmin) {
      toast.error('Administrators cannot send messages.');
      return;
    }
    try {
      const res = await deleteMessage(msgId, type);
      if (res.success) {
        toast.success(type === 'everyone' ? 'Deleted message for everyone' : 'Deleted message');
        fetchMessages();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleInputChange = (e) => {
    if (isAdmin) return;
    setText(e.target.value);

    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.send('typing', { isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.send('typing', { isTyping: false });
    }, 2000);
  };

  // Text highlight formatter for matching searches
  const formatSearchedText = (inputText) => {
    if (!searchQuery || !inputText) return inputText;
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = inputText.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-500 text-black rounded px-0.5 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Insert Emoji at current cursor position
  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
  };

  // Scroll to referenced reply message element
  const handleScrollToMessage = (replyMsgId) => {
    const el = document.getElementById(`msg-${replyMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('animate-pulse', 'ring-2', 'ring-indigo-500');
      setTimeout(() => {
        el.classList.remove('animate-pulse', 'ring-2', 'ring-indigo-500');
      }, 2000);
    } else {
      toast.error('Original message not found in thread');
    }
  };

  // Filter messages based on search query / stars
  const filteredMessages = messages.filter((msg) => {
    if (starredOnly && !msg.isStarred) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchText = msg.message?.toLowerCase().includes(query);
      const matchAttachment = msg.attachmentName?.toLowerCase().includes(query);
      return matchText || matchAttachment;
    }
    return true;
  });

  // Find all pinned messages to display at the top bar
  const pinnedMessages = messages.filter((m) => m.isPinned);

  // Role-based sender name color helper
  const getSenderColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-400';
      case 'staff': return 'text-emerald-400';
      case 'client': return 'text-sky-400';
      case 'system': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-[650px] w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden">
      {/* ── Chat Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400">
            <FiMessageSquare className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Project Discussion</h3>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xxs font-semibold text-indigo-400 border border-indigo-500/20">
                  🔒 Read Only
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Active · {messages.length} messages</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(''); }}
            className={`p-2 rounded-full transition duration-150 ${searchOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            title="Search Messages"
          >
            <FiSearch className="h-4 w-4" />
          </button>

          {/* Starred Messages Filter */}
          <button
            type="button"
            onClick={() => setStarredOnly(!starredOnly)}
            className={`p-2 rounded-full transition duration-150 ${starredOnly ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'}`}
            title="Starred Messages"
          >
            <FiStar className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>

      {/* ── Search Overlay Row ── */}
      {searchOpen && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 animate-fade-in shrink-0 z-10">
          <FiSearch className="text-slate-400 h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Search within this chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Pinned Messages Header Bar ── */}
      {pinnedMessages.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-col gap-1.5 animate-slide-down max-h-[85px] overflow-y-auto shrink-0 z-10">
          {pinnedMessages.map((pin) => (
            <div key={pin._id} className="flex items-center justify-between text-xxs text-slate-300 gap-2 border-l-2 border-indigo-500 pl-2 py-0.5">
              <span
                onClick={() => handleScrollToMessage(pin._id)}
                className="cursor-pointer hover:underline truncate max-w-[85%] flex items-center gap-1.5"
              >
                <FiPin className="h-3 w-3 text-indigo-400 shrink-0 transform rotate-45" />
                <span className="font-bold text-indigo-400">{pin.sender?.fullName || 'User'}:</span>{' '}
                {pin.message ? pin.message : pin.attachmentName || 'Attachment'}
              </span>
              <button
                type="button"
                onClick={() => handleTogglePin(pin._id)}
                className="text-slate-500 hover:text-slate-300 shrink-0"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Chat Messages Timeline Container ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-5 space-y-1 bg-slate-50 dark:bg-slate-950"
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs text-slate-400 font-medium">Loading conversation...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center p-6">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <FiMessageSquare className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">No messages yet</p>
            <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] leading-relaxed">
              {starredOnly
                ? 'No starred messages in this project thread.'
                : 'Start the conversation — send a message, share a file, or record a voice note.'}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id;
            const isStaffMessage = msg.sender?.role === 'staff';

            // Alignment Rule for Admin: Client -> LEFT, Staff -> RIGHT. Non-Admin: isMe -> RIGHT, Others -> LEFT.
            const isRight = isAdmin ? isStaffMessage : isMe;

            // Date separation logic
            const currentDateStr = formatDateSeparator(msg.createdAt);
            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
            const prevDateStr = prevMsg ? formatDateSeparator(prevMsg.createdAt) : null;
            const showSeparator = idx === 0 || currentDateStr !== prevDateStr;

            // Media attachment mappings
            const hasAttachment = !!msg.attachment;
            const isImg = msg.attachmentType === 'image';
            const isVid = msg.attachmentType === 'video';
            const isAud = msg.attachmentType === 'audio' || !!msg.voiceUrl;
            const isPdf = msg.attachmentType === 'pdf';
            const isWord = msg.attachmentType === 'word';
            const isExcel = msg.attachmentType === 'excel';
            const isZip = msg.attachmentType === 'zip';

            const secureFileUrl = msg.attachment?.startsWith('http')
              ? msg.attachment
              : `http://localhost:5000${msg.attachment}`;

            return (
              <div key={msg._id} className="flex flex-col">
                {/* ── Date Separator ── */}
                {showSeparator && (
                  <div className="flex justify-center my-4 animate-fade-in shrink-0">
                    <span className="bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400 px-3.5 py-1 rounded-full shadow-sm">
                      {currentDateStr}
                    </span>
                  </div>
                )}

                {/* ── Chat Bubble Wrap ── */}
                <div
                  id={`msg-${msg._id}`}
                  className={`flex flex-col group relative mb-2 ${isRight ? 'items-end' : 'items-start'}`}
                  onMouseEnter={() => setHoveredMessageId(msg._id)}
                  onMouseLeave={() => { setHoveredMessageId(null); setActiveMenuId(null); }}
                >
                  {/* Sender Name — role-coloured */}
                  {((!isMe || isAdmin) && (idx === 0 || filteredMessages[idx - 1]?.sender?._id !== msg.sender?._id)) && (
                    <span className={`text-[11px] font-bold mb-1 tracking-wide ${isRight ? 'mr-2 text-right' : 'ml-2 text-left'} ${getSenderColor(msg.sender?.role)}`}>
                      {msg.sender?.fullName || 'User'}
                    </span>
                  )}

                  {/* ── Main Message Box ── */}
                  <div
                    className={`max-w-[85%] sm:max-w-[72%] rounded-[20px] px-4 py-2.5 sm:px-4.5 sm:py-3 shadow-md relative min-w-[120px] transition-all duration-200 ${isRight
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-[4px] border border-purple-500/20 shadow-purple-950/30'
                        : 'bg-slate-800 text-slate-100 rounded-tl-[4px] border border-slate-700/60 shadow-black/30'
                      }`}
                  >
                    {/* Star Badge Indicator */}
                    {msg.isStarred && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-amber-400 shadow-md">
                        <FiStar className="h-2.5 w-2.5 fill-current" />
                      </span>
                    )}

                    {/* Pin Badge Indicator */}
                    {msg.isPinned && (
                      <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-indigo-400 shadow-md">
                        <FiPin className="h-2.5 w-2.5 transform rotate-45" />
                      </span>
                    )}

                    {/* ── Reply Quote Bubble ── */}
                    {msg.replyTo && (
                      <div
                        onClick={() => handleScrollToMessage(msg.replyTo._id || msg.replyTo)}
                        className="mb-2 bg-slate-950/50 border-l-2 border-indigo-400 rounded-xl p-2.5 text-xxs text-slate-200 cursor-pointer hover:bg-slate-950/70 transition"
                      >
                        <p className="font-bold text-indigo-400 mb-0.5">
                          {msg.replyTo.sender?.fullName || 'User'}
                        </p>
                        <p className="truncate">
                          {msg.replyTo.message ? msg.replyTo.message : msg.replyTo.attachmentName || 'Attachment'}
                        </p>
                      </div>
                    )}

                    {/* ── Attachment Previews ── */}
                    {hasAttachment && (
                      <div className="mb-2 overflow-hidden rounded-xl">
                        {/* Image Preview */}
                        {isImg && (
                          <div className="relative group/img overflow-hidden rounded-xl bg-slate-950 border border-white/10">
                            <img
                              src={secureFileUrl}
                              alt={msg.attachmentName}
                              loading="lazy"
                              className="max-h-64 w-full object-cover group-hover/img:scale-[1.02] transition duration-200 cursor-pointer"
                              onClick={() => window.open(secureFileUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* Video Preview */}
                        {isVid && (
                          <video
                            src={secureFileUrl}
                            controls
                            className="max-h-64 w-full rounded-xl object-cover bg-slate-950 border border-white/10"
                          />
                        )}

                        {/* Voice message player custom wrapper */}
                        {isAud && (
                          <VoiceMessagePlayer audioUrl={msg.voiceUrl || secureFileUrl} duration={msg.voiceDuration} />
                        )}

                        {/* General non-image/video file badges */}
                        {(!isImg && !isVid && !isAud) && (
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isRight ? 'bg-indigo-950/40 border-indigo-400/30' : 'bg-slate-950/40 border-slate-700/60'
                            }`}>
                            <div className={`p-2.5 rounded-lg text-white shrink-0 ${isPdf ? 'bg-red-600' : isWord ? 'bg-blue-600' : isExcel ? 'bg-emerald-600' : isZip ? 'bg-amber-600' : 'bg-slate-600'
                              }`}>
                              <FiFileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-100 truncate">{msg.attachmentName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{formatFileSize(msg.attachmentSize)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={secureFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Open File"
                              >
                                <FiShare className="h-3.5 w-3.5" />
                              </a>
                              <a
                                href={secureFileUrl}
                                download={msg.attachmentName}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Download File"
                              >
                                <FiDownload className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Message Text ── */}
                    {msg.message && (
                      <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap select-text break-words tracking-normal">
                        {formatSearchedText(msg.message)}
                      </p>
                    )}

                    {/* Time & Read Receipts Status Row */}
                    <div className="flex items-center justify-end gap-1 mt-1.5 select-none">
                      <span className={`text-[10px] font-medium ${isRight ? 'text-purple-100/80' : 'text-slate-400'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' || msg.isRead ? (
                            <span className="text-sky-300 flex items-center">
                              <FiCheck className="h-3 w-3 stroke-[2.5]" />
                              <FiCheck className="h-3 w-3 -ml-1.5 stroke-[2.5]" />
                            </span>
                          ) : msg.status === 'delivered' ? (
                            <span className="text-purple-200/70 flex items-center">
                              <FiCheck className="h-3 w-3 stroke-[2.5]" />
                              <FiCheck className="h-3 w-3 -ml-1.5 stroke-[2.5]" />
                            </span>
                          ) : (
                            <FiCheck className="text-purple-200/70 h-3 w-3 stroke-[2.5]" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* ── Reactions list display below bubble ── */}
                    {msg.reactions?.length > 0 && (
                      <div className={`absolute -bottom-2.5 flex items-center gap-1.5 bg-slate-900/95 border border-slate-700/60 py-0.5 px-2 rounded-full shadow-md backdrop-blur-sm text-xxs z-10 ${isRight ? 'right-3' : 'left-3'
                        }`}>
                        {Array.from(new Set(msg.reactions.map((r) => r.emoji))).map((emoji, i) => (
                          <span key={i} className="text-xxs">{emoji}</span>
                        ))}
                        <span className="text-[10px] text-slate-400 font-bold ml-0.5">
                          {msg.reactions.length}
                        </span>
                      </div>
                    )}

                    {/* ── Context Menu Chevron Down Arrow ── */}
                    {hoveredMessageId === msg._id && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === msg._id ? null : msg._id); }}
                        className={`absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 shadow-xs z-20 ${
                          isRight
                            ? 'bg-black/20 hover:bg-black/35 border border-white/10 text-white/90'
                            : 'bg-slate-700/60 hover:bg-slate-700/90 border border-white/10 text-white/90'
                        }`}
                        title="Message options"
                      >
                        <FiChevronDown className="h-4 w-4 text-white/90" />
                      </button>
                    )}

                    {/* ── Hover Reaction Icon Shortcut ── */}
                    {!isAdmin && hoveredMessageId === msg._id && (
                      <div className={`absolute top-[-30px] flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-full shadow-xl z-20 ${isRight ? 'right-0' : 'left-0'
                        }`}>
                        {QUICK_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg._id, emoji)}
                            className="hover:scale-125 transition text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ── Dropdown Options Menu Popup ── */}
                    {activeMenuId === msg._id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                        <div className={`absolute w-36 rounded-xl bg-slate-950 border border-slate-800 p-1.5 shadow-2xl z-40 text-xs text-slate-200 mt-2 ${isRight ? 'right-0 top-7' : 'left-0 top-7'
                          }`}>
                          {!isAdmin && (
                            <button
                              onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs"
                            >
                              <FiCornerUpLeft className="h-3.5 w-3.5 text-indigo-400" /> Reply
                            </button>
                          )}

                          {msg.message && (
                            <button
                              onClick={() => { navigator.clipboard.writeText(msg.message); toast.success('Copied text!'); setActiveMenuId(null); }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs"
                            >
                              <FiCopy className="h-3.5 w-3.5 text-indigo-400" /> Copy
                            </button>
                          )}

                          <button
                            onClick={() => { handleToggleStar(msg._id); setActiveMenuId(null); }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs"
                          >
                            <FiStar className="h-3.5 w-3.5 text-amber-400 fill-current" /> {msg.isStarred ? 'Unstar' : 'Star'}
                          </button>

                          <button
                            onClick={() => { handleTogglePin(msg._id); setActiveMenuId(null); }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs"
                          >
                            <FiPin className="h-3.5 w-3.5 text-indigo-400 transform rotate-45" /> {msg.isPinned ? 'Unpin' : 'Pin'}
                          </button>

                          {hasAttachment && (
                            <a
                              href={secureFileUrl}
                              download={msg.attachmentName}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs"
                            >
                              <FiDownload className="h-3.5 w-3.5 text-blue-400" /> Save As
                            </a>
                          )}

                          {/* Delete actions (Disabled for Admin) */}
                          {!isAdmin && (
                            <>
                              <div className="border-t border-slate-800 my-1" />

                              {isMe && (
                                <button
                                  onClick={() => { handleDelete(msg._id, 'everyone'); setActiveMenuId(null); }}
                                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs text-red-400"
                                >
                                  <FiTrash2 className="h-3.5 w-3.5" /> Delete for All
                                </button>
                              )}

                              <button
                                onClick={() => { handleDelete(msg._id, 'me'); setActiveMenuId(null); }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 text-xxs text-red-500"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" /> Delete for Me
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xxs text-indigo-400 italic font-medium px-4 py-2 bg-slate-900 rounded-lg w-max shrink-0 animate-pulse border border-slate-800 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>{typingUsers.map((u) => u.userName).join(', ')} typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Reply Preview Banner Row ── */}
      {replyingTo && !isAdmin && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between animate-slide-up shrink-0">
          <div className="border-l-2 border-indigo-500 pl-2.5 py-0.5">
            <span className="text-xxs font-bold text-indigo-400">Replying to {replyingTo.sender?.fullName || 'User'}</span>
            <p className="text-xs text-slate-300 truncate max-w-[400px]">
              {replyingTo.message ? replyingTo.message : replyingTo.attachmentName || 'Attachment'}
            </p>
          </div>
          <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-1">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── File Upload List Indicator Row ── */}
      {files.length > 0 && !isAdmin && (
        <div className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center gap-3 overflow-x-auto shrink-0 z-10">
          {files.map((file, i) => {
            const isImg = file.type.startsWith('image/');
            const previewUrl = isImg ? URL.createObjectURL(file) : null;
            return (
              <div key={i} className="flex items-center bg-slate-950 p-2 rounded-xl border border-slate-800 text-xxs text-slate-300 min-w-[160px] gap-2 shrink-0">
                {isImg ? (
                  <img src={previewUrl} alt="preview" className="h-8 w-8 object-cover rounded" />
                ) : (
                  <div className="p-1.5 rounded-lg bg-slate-900 text-slate-400">
                    <FiFile className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 truncate">
                  <p className="font-bold text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Voice Message Recording Preview Bar ── */}
      {voicePreviewUrl && !isAdmin && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs text-slate-300 font-bold">Recorded Voice Message</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-xl px-3 py-2">
              <VoiceMessagePlayer audioUrl={voicePreviewUrl} duration={recordingTimer} />
            </div>
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300"
              title="Delete Voice Message"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
              title="Send Voice Message"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Emoji Picker Container Overlay popup ── */}
      {emojiPickerOpen && !isAdmin && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setEmojiPickerOpen(false)} />
          <div className="absolute bottom-[60px] left-4 w-[340px] h-[360px] rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl z-20 flex flex-col animate-slide-up text-xs shrink-0">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 select-none">
              {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveEmojiCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-bold ${activeEmojiCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Emojis Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-8 gap-2 p-2 justify-items-center align-items-center">
              {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-lg hover:scale-125 transition duration-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Message Input Footer Panel ── */}
      {isAdmin ? (
        <div className="border-t border-slate-800 bg-slate-900 p-3.5 flex items-center justify-center shrink-0 z-10 select-none">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-400 shadow-inner">
            <span className="text-indigo-400 text-sm">🔒</span>
            <span>Administrator has read-only access to this conversation.</span>
          </div>
        </div>
      ) : (
        !voicePreviewUrl && (
          <form
            onSubmit={handleSend}
            className="border-t border-slate-800 bg-slate-900 p-3 flex items-center gap-2.5 shrink-0 z-10 select-none"
          >
            {/* Emoji toggle icon button */}
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className={`p-2 rounded-full transition duration-150 ${emojiPickerOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FiSmile className="h-5 w-5" />
            </button>

            {/* File input attachment paperclip */}
            <label className="cursor-pointer p-2 text-slate-400 hover:text-white transition duration-150 rounded-full hover:bg-slate-800" title="Attach file">
              <FiPaperclip className="h-5 w-5" />
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </label>

            {/* Text Message input box */}
            {voiceRecording ? (
              <div className="flex-1 flex items-center justify-between bg-slate-950 border border-red-500/30 rounded-xl px-4 py-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-red-500">
                    {Math.floor(recordingTimer / 60)}:{(recordingTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    className="text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950 px-2 py-1 rounded"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={text}
                onChange={handleInputChange}
              />
            )}

            {/* Action icon button */}
            {(!text.trim() && files.length === 0) ? (
              <button
                type="button"
                onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-2.5 rounded-full text-white transition-all shadow shadow-slate-950/20 ${voiceRecording ? 'bg-red-600 animate-pulse hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
              >
                <FiMic className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-indigo-600 p-2.5 text-white hover:bg-indigo-500 disabled:opacity-50 transition duration-150 shadow-md shadow-indigo-600/20"
              >
                <FiSend className="h-4 w-4" />
              </button>
            )}
          </form>
        )
      )}
    </div>
  );
};

export default MessageThread;
