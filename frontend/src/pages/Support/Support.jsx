import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  User,
  Clock,
  CheckCircle,
  Bot,
  Sparkles,
  Mail,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'
import Card, { CardContent, CardHeader } from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import chatAPI from '../../services/smartsupp'

const BOT_NAME = 'PrimeWave Assistant'

const GREETING = {
  id: 'greeting',
  sender: 'bot',
  text: `Hello! 👋 Welcome to PrimeWave Bank. I'm ${BOT_NAME}, your virtual banking helper.

I can answer questions about:
• Opening an account & logging in
• Your balance, account number & transactions
• Sending money & currency conversion
• Cards (ordering, fees, status)
• Loans (applying & repayment)
• Security & support

What would you like help with today?`,
}

const DEFAULT_SUGGESTIONS = [
  'How do I check my balance?',
  'How do I transfer money?',
  'How do I order a card?',
  'How do I apply for a loan?',
  'How do I contact support?',
]

const ChatBubble = ({ message }) => {
  const isUser = message.sender === 'user'
  const isAgent = message.sender === 'agent'
  const name = isAgent ? 'Support Agent' : isUser ? 'You' : BOT_NAME
  const Icon = isUser ? User : isAgent ? MessageSquare : Bot
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex space-x-3 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-gold text-white' : isAgent ? 'bg-gold-600 text-white' : 'bg-primary text-cream'
        }`}>
          <Icon size={16} />
        </div>
        <div>
          <div className={`px-4 py-2 rounded-2xl whitespace-pre-line ${
            isUser
              ? 'bg-gold text-white'
              : isAgent
              ? 'bg-gold-100 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-800 text-primary dark:text-cream'
              : 'bg-primary-100 dark:bg-primary-700 text-primary dark:text-cream'
          }`}>
            {message.text}
          </div>
          <p className={`text-xs text-silver mt-1 ${isUser ? 'text-right' : 'text-left'}`}>{name}</p>
        </div>
      </div>
    </motion.div>
  )
}

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center space-x-1.5 px-4 py-3 rounded-2xl bg-primary-100 dark:bg-primary-700">
      <span className="w-2 h-2 bg-silver rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
      <span className="w-2 h-2 bg-silver rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
      <span className="text-xs text-silver ml-2">Typing...</span>
    </div>
  </div>
)

const Support = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([GREETING])
  const [quickReplies, setQuickReplies] = useState(DEFAULT_SUGGESTIONS)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const lastSeenMessageId = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const toMessages = (items) =>
    items.map((m) => ({
      id: m.id,
      sender: m.sender === 'agent' ? 'agent' : m.sender === 'user' ? 'user' : 'bot',
      text: m.text,
    }))

  // Initial load: check chat status and fetch any existing conversation
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const status = await chatAPI.getStatus()
      if (cancelled) return
      setChatEnabled(Boolean(status.configured))
      setLoading(true)
      try {
        const data = await chatAPI.getConversation()
        if (!cancelled && data.messages && data.messages.length) {
          const mapped = toMessages(data.messages)
          setMessages((prev) => [prev[0], ...mapped])
          lastSeenMessageId.current = mapped[mapped.length - 1]?.id || null
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  // Poll for new messages (e.g. agent replies from the Smartsupp dashboard)
  useEffect(() => {
    if (!chatEnabled) return undefined
    const interval = setInterval(async () => {
      try {
        const data = await chatAPI.getConversation()
        if (data.messages && data.messages.length) {
          const mapped = toMessages(data.messages)
          const last = mapped[mapped.length - 1]
          if (last && last.id !== lastSeenMessageId.current) {
            lastSeenMessageId.current = last.id
            setMessages((prev) => [prev[0], ...mapped])
          }
        }
      } catch (error) {
        // Ignore polling errors
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [chatEnabled])

  const handleSend = async (rawText) => {
    const text = (rawText || newMessage).trim()
    if (!text || sending) return
    setNewMessage('')
    setQuickReplies([])
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, sender: 'user', text },
    ])
    setSending(true)
    try {
      const data = await chatAPI.sendMessage(text)
      if (data.reply && data.reply.suggestions && data.reply.suggestions.length) {
        setQuickReplies(data.reply.suggestions)
      }
      // Sync the full conversation so the bot reply + any agent messages show
      const conv = await chatAPI.getConversation()
      if (conv.messages && conv.messages.length) {
        const mapped = toMessages(conv.messages)
        lastSeenMessageId.current = mapped[mapped.length - 1]?.id || null
        setMessages((prev) => [prev[0], ...mapped])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: 'Sorry, I had trouble reaching the chat service. Please try again in a moment, or email helpxprimewavebank@gmail.com.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-cream dark:bg-primary-900 pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-primary dark:text-cream mb-2">
            Support
          </h1>
          <p className="text-silver dark:text-silver">
            Get help from our team — our AI assistant is online 24/7
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Support Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
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

                  <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-lg">
                    <Bot className="text-gold" size={20} />
                    <div>
                      <p className="font-semibold text-primary dark:text-cream">AI Assistant</p>
                      <p className="text-sm text-silver">Answers instantly from our knowledge base</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Get in Touch
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="mailto:helpxprimewavebank@gmail.com"
                    className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-lg text-primary dark:text-cream hover:bg-silver/20 transition-colors"
                  >
                    <Mail className="text-gold" size={18} />
                    <span className="text-sm font-medium break-all">helpxprimewavebank@gmail.com</span>
                  </a>
                  <a
                    href="https://t.me/helpxprimewavebank"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-lg text-primary dark:text-cream hover:bg-silver/20 transition-colors"
                  >
                    <MessageSquare className="text-gold" size={18} />
                    <span className="text-sm font-medium">@helpxprimewavebank</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Chat */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col h-[calc(100dvh-16rem)] min-h-[24rem] lg:h-[42rem]">
              <CardHeader className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-primary dark:text-cream">
                  Live Chat Support
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-success">Online</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading && (
                    <div className="text-center text-silver text-sm py-4">
                      Loading conversation...
                    </div>
                  )}
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                  {sending && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
                {/* Quick replies */}
                {quickReplies.length > 0 && !sending && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {quickReplies.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 text-xs rounded-full bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30 transition-colors"
                      >
                        <Sparkles size={12} className="inline mr-1" />
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-silver/20 dark:border-primary-700 p-4">
                  {chatEnabled ? (
                    <div className="flex gap-2 sm:gap-3 items-end">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 min-w-0 px-4 py-3 bg-primary-100 dark:bg-primary-700 border border-silver dark:border-primary-600 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                      <Button
                        onClick={() => handleSend()}
                        disabled={!newMessage.trim() || sending}
                        variant="brand"
                        className="flex items-center space-x-2 shrink-0"
                      >
                        <Send size={16} />
                        <span>Send</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-700 rounded-xl">
                      <AlertCircle className="text-gold shrink-0" size={18} />
                      <p className="text-sm text-silver">
                        Live chat is temporarily unavailable. Please email{' '}
                        <span className="text-gold">helpxprimewavebank@gmail.com</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-silver mt-2">
                    Powered by Smartsupp • conversations are visible to our support team
                  </p>
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
