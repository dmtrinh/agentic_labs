import { useEffect } from 'react'
import { useTaskStore } from '../stores/taskStore'
import type { Task, TaskStatus } from '../types'
import toast from 'react-hot-toast'
import { RefreshCw, Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react'

const COLUMNS: { status: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'TODO',    label: 'To Do',   icon: Clock,         color: 'text-gray-400' },
  { status: 'RUNNING', label: 'Running', icon: Play,          color: 'text-blue-400' },
  { status: 'DONE',    label: 'Done',    icon: CheckCircle2,  color: 'text-green-400' },
  { status: 'ERROR',   label: 'Error',   icon: AlertCircle,   color: 'text-red-400' },
]

function TaskCard({ task }: { task: Task }) {
  const badgeClass = {
    TODO: 'badge-todo',
    RUNNING: 'badge-running',
    DONE: 'badge-done',
    ERROR: 'badge-error',
  }[task.status]

  return (
    <div className="card p-3 space-y-2">
      <p className="text-sm text-gray-200 font-medium leading-snug">{task.title}</p>
      <div className="flex items-center justify-between">
        <span className={badgeClass}>{task.status}</span>
        <span className="text-xs text-gray-600">
          {new Date(task.updatedAt).toLocaleTimeString()}
        </span>
      </div>
      {task.agentId !== 'default' && (
        <span className="text-xs text-gray-600">Agent: {task.agentId}</span>
      )}
    </div>
  )
}

export default function TaskBoardPage() {
  const { tasks, loadTasks } = useTaskStore()

  useEffect(() => { loadTasks() }, [loadTasks])

  const refresh = async () => {
    try { await loadTasks() }
    catch { toast.error('Failed to refresh tasks') }
  }

  const tasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <h1 className="font-semibold text-gray-100">Task Board</h1>
        <button onClick={refresh} className="btn-ghost px-2 py-1.5">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(({ status, label, icon: Icon, color }) => (
            <div key={status} className="w-72 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                  {tasksByStatus(status).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {tasksByStatus(status).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {tasksByStatus(status).length === 0 && (
                  <div className="border-2 border-dashed border-gray-800 rounded-xl h-20 flex items-center justify-center">
                    <span className="text-xs text-gray-700">No tasks</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
