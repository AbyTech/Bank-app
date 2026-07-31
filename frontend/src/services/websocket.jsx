class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
  }

  connect() {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = import.meta.env.VITE_API_BASE_URL ? 
        new URL(import.meta.env.VITE_API_BASE_URL).hostname : '127.0.0.1:8000'
      this.socket = new WebSocket(`${wsProtocol}//${wsHost}/ws/notifications/`)

      this.socket.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected', null)
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.socket.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts})`)
        this.connect()
      }, 3000 * this.reconnectAttempts)
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'balance_update':
        this.emit('balanceUpdate', data)
        break
      case 'transaction':
        this.emit('newTransaction', data)
        break
      case 'support_message':
        this.emit('supportMessage', data)
        break
      case 'card_update':
        this.emit('cardUpdate', data)
        break
      case 'loan_update':
        this.emit('loanUpdate', data)
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error)
        }
      })
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
    }
    this.listeners.clear()
  }
}

export const websocketService = new WebSocketService()