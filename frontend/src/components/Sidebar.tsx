import { NavLink, useNavigate } from 'react-router-dom'
import {
  MessageSquare, Kanban, Zap, ShoppingBag,
  Calendar, Wrench, FolderOpen, Settings, LogOut, Bot
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useEffect } from 'react'
import { chatApi } from '../services/api'
import type { SessionDto } from '../types'

const navItems = [
  { to: '/chat',        icon: MessageSquare, label: 'Chat' },
  { to: '/tasks',       icon: Kanban,        label: 'Task Board' },
  { to: '/skills',      icon: Zap,           label: 'Skills' },
  { to: '/marketplace', icon: ShoppingBag,   label: 'Marketplace' },
  { to: '/scheduler',   icon: Calendar,      label: 'Scheduler' },
  { to: '/tools',       icon: Wrench,        label: 'Tools' },
  { to: '/files',       icon: FolderOpen,    label: 'Files' },
  { to: '/settings',    icon: Settings,      label: 'Settings' },
]

export default function Sidebar() {
  const { logout, username } = useAuthStore()
  const { sessions, setSessions, currentSessionId, loadSession } = useChatStore()
  const navigate = useNavigate()

  useEffect(() => {
    chatApi.getSessions().then(setSessions).catch(() => {})
  }, [setSessions])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-gray-100">Agentic Labs</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Recent Chats
              </span>
            </div>
            {sessions.slice(0, 8).map((session: SessionDto) => (
              <button
                key={session.id}
                onClick={() => {
                  loadSession(session.id)
                  navigate(`/chat/${session.id}`)
                }}
                className={`sidebar-item w-full text-left truncate ${
                  currentSessionId === session.id ? 'active' : ''
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate text-xs">
                  {session.lastMessage || 'New chat'}
                </span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-2 py-3 border-t border-gray-800">
        <div className="flex items-center justify-between px-3">
          <div>
            <p className="text-sm font-medium text-gray-200">{username}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
