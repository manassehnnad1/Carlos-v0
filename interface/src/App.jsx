import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import EmptyState from './components/EmptyState'
import Composer from './components/Composer'
import UsernameGate from './components/UsernameGate'
import { useChat } from './hooks/useChat'
import { AnimatePresence, motion } from 'motion/react'

export default function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('carlos_username'))
  const { messages, isStreaming, sendMessage, newChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )

  const hasMessages = messages.length > 0

  const handleEnter = (name) => {
    localStorage.setItem('carlos_username', name)
    setUsername(name)
  }

  const handleNewChat = () => {
    newChat()
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  return (
    <AnimatePresence mode="wait">
      {!username ? (
        <UsernameGate key="gate" onEnter={handleEnter} />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex h-full w-full"
        >
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggle={() => setSidebarOpen((o) => !o)}
            onNewChat={handleNewChat}
            username={username}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <ChatHeader
              onToggleSidebar={() => setSidebarOpen((o) => !o)}
              onNewChat={handleNewChat}
            />

            {hasMessages ? (
              <MessageList messages={messages} isStreaming={isStreaming} />
            ) : (
              <EmptyState onPick={sendMessage} />
            )}

            <Composer onSend={sendMessage} disabled={isStreaming} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}