import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import socketService from '../websocket/websocketService';
import { getNotifications, markRead as apiMarkRead, markAllRead as apiMarkAllRead } from '../services/notificationService';
import { playNotificationSound } from '../utils/notificationSound';

export const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [status, setStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track known notification IDs to prevent duplicates
  const knownIds = useRef(new Set());

  // ─────────────────────────────────────────────────────────────────
  // Desktop notification permission
  // ─────────────────────────────────────────────────────────────────
  const requestDesktopPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (window.Notification.permission === 'default') {
      await window.Notification.requestPermission();
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Show a desktop notification and navigate on click
  // ─────────────────────────────────────────────────────────────────
  const showDesktopNotification = useCallback((notif) => {
    if (!('Notification' in window)) return;
    if (window.Notification.permission !== 'granted') return;

    try {
      const n = new window.Notification(notif.title, {
        body: notif.message,
        icon: '/favicon.ico',
        tag: notif._id, // prevents duplicate desktop notifications
        requireInteraction: false,
      });

      n.onclick = () => {
        window.focus();
        if (notif.link) navigate(notif.link);
        n.close();
        // Mark as read
        apiMarkRead(notif._id).catch(() => {});
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      };
    } catch (err) {
      console.warn('Desktop notification error:', err.message);
    }
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────
  // Load initial notifications from HTTP (once on login)
  // ─────────────────────────────────────────────────────────────────
  const loadInitialNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      if (res.success) {
        const notifs = res.notifications;
        notifs.forEach((n) => knownIds.current.add(n._id));
        setNotifications(notifs);
        setUnreadCount(res.unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  // ─────────────────────────────────────────────────────────────────
  // Mark single notification as read
  // ─────────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await apiMarkRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Mark all as read
  // ─────────────────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // WebSocket event handlers
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleStatusChange = (data) => setStatus(data.status);

    // New notification arrives via WebSocket
    const handleNewNotification = (data) => {
      console.log('[WS] Notification event received:', data);

      if (!data || !data._id) {
        console.warn('[WS] Notification missing _id, ignoring.');
        return;
      }

      // Deduplication guard
      if (knownIds.current.has(data._id)) {
        console.log('[WS] Duplicate notification, skipping:', data._id);
        return;
      }
      knownIds.current.add(data._id);

      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((c) => {
        console.log('[WS] Unread count updated:', c + 1);
        return c + 1;
      });

      // Sound
      console.log('[WS] Playing notification sound');
      playNotificationSound();

      // Desktop notification
      console.log('[WS] Showing desktop notification');
      showDesktopNotification(data);
    };

    // Server confirmed a single notification was read
    const handleNotificationRead = (data) => {
      if (!data?.id) return;
      setNotifications((prev) =>
        prev.map((n) => (n._id === data.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => {
        const unread = prev > 0 ? prev - 1 : 0;
        return unread;
      });
    };

    // Server confirmed all notifications were read
    const handleNotificationReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    socketService.addListener('status_change', handleStatusChange);
    socketService.addListener('notification', handleNewNotification);
    socketService.addListener('notification_read', handleNotificationRead);
    socketService.addListener('notification_read_all', handleNotificationReadAll);

    return () => {
      socketService.removeListener('status_change', handleStatusChange);
      socketService.removeListener('notification', handleNewNotification);
      socketService.removeListener('notification_read', handleNotificationRead);
      socketService.removeListener('notification_read_all', handleNotificationReadAll);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Connect / disconnect on auth change
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      if (token) socketService.connect(token);

      // Load existing notifications from DB
      loadInitialNotifications();

      // Request desktop notification permission once
      requestDesktopPermission();
    } else {
      socketService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
      knownIds.current.clear();
    }
  }, [user]);

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketService,
        status,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        requestDesktopPermission,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
