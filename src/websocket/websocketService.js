class WebSocketService {
  constructor() {
    this.ws = null;
    this.token = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimeout = 3000;
    this.manualDisconnect = false;
    this.isConnecting = false;
  }

  getSocketUrl(token) {
    let socketBaseUrl = import.meta.env.VITE_SOCKET_URL;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // If no explicit VITE_SOCKET_URL is set, derive dynamically from API URL or location
    if (!socketBaseUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;
      if (apiUrl) {
        // Convert http(s) to ws(s)
        socketBaseUrl = apiUrl
          .replace(/^http:/, 'ws:')
          .replace(/^https:/, 'wss:')
          .replace(/\/api\/?$/, '');
      } else if (typeof window !== 'undefined' && window.location.host) {
        const protocol = isHttps ? 'wss:' : 'ws:';
        socketBaseUrl = `${protocol}//${window.location.host}`;
      } else {
        socketBaseUrl = 'ws://localhost:5000';
      }
    }

    // Vercel Serverless Functions do not support persistent native WebSockets.
    // If the socket URL resolves to vercel.app, disable WebSockets cleanly to avoid 404 console errors.
    if (socketBaseUrl && socketBaseUrl.includes('vercel.app')) {
      return null;
    }

    // Force wss:// on HTTPS pages to prevent Mixed Content browser security block
    if (isHttps && socketBaseUrl.startsWith('ws://')) {
      socketBaseUrl = socketBaseUrl.replace(/^ws:\/\//, 'wss://');
    }

    return `${socketBaseUrl}?token=${encodeURIComponent(token)}`;
  }

  connect(token) {
    if (!token) return;
    this.token = token;
    this.manualDisconnect = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const wsUrl = this.getSocketUrl(token);

      if (!wsUrl) {
        console.info('[WS] WebSockets are disabled on Vercel Serverless host. Real-time features will use HTTP polling fallback.');
        this.isConnecting = false;
        this.manualDisconnect = true;
        this.triggerEvent('status_change', { status: 'disabled' });
        return;
      }

      console.log('Connecting to WebSocket server:', wsUrl);
      this.ws = new WebSocket(wsUrl);


      this.ws.onopen = () => {
        console.log('WebSocket connection established successfully.');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 3000;
        this.isConnecting = false;
        this.triggerEvent('status_change', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type) {
            this.triggerEvent(message.type, message.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.triggerEvent('status_change', { status: 'disconnected' });

        if (!this.manualDisconnect) {
          this.attemptReconnect();
        } else {
          console.log('WebSocket connection closed manually.');
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection warning:', error);
        this.isConnecting = false;
      };
    } catch (err) {
      console.warn('Failed to initialize WebSocket connection:', err.message || err);
      this.isConnecting = false;
      this.triggerEvent('status_change', { status: 'failed' });
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max WebSocket reconnection attempts reached. Halting auto-reconnect.');
      this.triggerEvent('status_change', { status: 'failed' });
      return;
    }

    this.reconnectAttempts += 1;
    setTimeout(() => {
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 30000);
      this.connect(this.token);
    }, this.reconnectTimeout);
  }

  send(type, data = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('Cannot send message. WebSocket is not open.');
    }
  }

  disconnect() {
    this.manualDisconnect = true;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  triggerEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in WebSocket listener callback for event "${event}":`, err);
        }
      });
    }
  }
}

const socketService = new WebSocketService();
export default socketService;

