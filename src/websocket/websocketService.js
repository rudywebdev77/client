class WebSocketService {
  constructor() {
    this.ws = null;
    this.token = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 3000; // start with 3 seconds
    this.manualDisconnect = false;
    this.isConnecting = false;
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

    const wsUrl = `ws://localhost:5000?token=${token}`;
    console.log('Connecting to WebSocket server...');
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
        console.log(`WebSocket connection closed. Attempting reconnect in ${this.reconnectTimeout / 1000}s...`);
        this.attemptReconnect();
      } else {
        console.log('WebSocket connection closed manually.');
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached.');
      this.triggerEvent('status_change', { status: 'failed' });
      return;
    }

    this.reconnectAttempts += 1;
    setTimeout(() => {
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, 30000); // Exponential backoff up to 30s
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
      this.ws.close();
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
