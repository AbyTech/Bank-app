import { useEffect, useRef } from 'react'
import { websocketService } from '../services/websocket'

export const useWebSocket = (events = {}) => {
  const eventHandlers = useRef(events)

  useEffect(() => {
    eventHandlers.current = events
  }, [events])

  useEffect(() => {
    // Temporarily disable WebSocket connection to prevent console errors
    // TODO: Implement WebSocket server in backend
    // websocketService.connect()

    // Set up event listeners (but no actual connection)
    Object.entries(eventHandlers.current).forEach(([event, handler]) => {
      if (typeof handler === 'function') {
        websocketService.on(event, handler)
      }
    })

    // Cleanup on unmount
    return () => {
      Object.keys(eventHandlers.current).forEach(event => {
        websocketService.off(event, eventHandlers.current[event])
      })
    }
  }, [])

  const sendMessage = (message) => {
    websocketService.sendMessage(message)
  }

  return { sendMessage }
}