import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { wsService } from '../services/websocket'
import { useTaskStore } from '../stores/taskStore'
import type { WsEvent } from '../types'

export default function Layout() {
  const token = useAuthStore(s => s.token)
  const { updateTask, updateTaskStatus } = useTaskStore()

  useEffect(() => {
    // Ensure WS connected (may already be from login)
    if (token && !wsService.connected) {
      wsService.connect(token).catch(console.error)
    }

    // Global task event subscription
    const unsub = wsService.subscribeToTasks((event: WsEvent) => {
      if (event.type === 'task_update') updateTask(event.payload as any)
      if (event.type === 'task_status') {
        const p = event.payload as { id: string; status: any }
        updateTaskStatus(p.id, p.status)
      }
    })

    return unsub
  }, [token, updateTask, updateTaskStatus])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
