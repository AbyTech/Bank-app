import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Clock, CheckCircle } from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const Support = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 300000)
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        timestamp: new Date()
      }
      setMessages([...messages, userMessage])
      setNewMessage('')

      // Simulate support response
      setTimeout(() => {
        const supportMessage = {
          id: messages.length + 2,
          sender: 'support',
          text: 'Thank you for your message. Our support team will get back to you shortly.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, supportMessage])
      }, 2000)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Support
          </h1>
          <p className="text-silver dark:text-silver">
            Get help from our support team
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Support Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Support Information
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-lg">
                    <Clock className="text-gold" size={20} />
                    <div>
                      <p className="font-semibold text-primary dark:text-cream">Response Time</p>
                      <p className="text-sm text-silver">Usually within 5 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-lg">
                    <CheckCircle className="text-success" size={20} />
                    <div>
                      <p className="font-semibold text-primary dark:text-cream">Availability</p>
                      <p className="text-sm text-silver">24/7 Support</p>
                    </div>
                  </div>

                  {/* <div className="p-4 bg-gold/10 rounded-lg">
                    <h4 className="font-semibold text-gold mb-2">Need Immediate Help?</h4>
                    <p className="text-sm text-silver mb-3">
                      Call our support line for urgent assistance
                    </p>
                    <p className="text-lg font-semibold text-primary dark:text-cream">
                      +1 (555) 123-HELP
                    </p>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Live Chat Support
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-success">Online</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-xs lg:max-w-md ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user' 
                            ? 'bg-gold text-primary' 
                            : 'bg-primary text-cream'
                        }`}>
                          <User size={16} />
                        </div>
                        <div>
                          <div className={`px-4 py-2 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-gold text-primary'
                              : 'bg-primary-100 dark:bg-primary-700 text-primary dark:text-cream'
                          }`}>
                            <p>{message.text}</p>
                          </div>
                          <p className={`text-xs text-silver mt-1 ${
                            message.sender === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-silver/20 dark:border-primary-700 p-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-cream dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center space-x-2"
                    >
                      <Send size={16} />
                      <span>Send</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Support