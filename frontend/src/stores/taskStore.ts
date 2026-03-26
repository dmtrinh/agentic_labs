import { create } from 'zustand'
import type { Task } from '../types'
import { tasksApi } from '../services/api'

interface TaskState {
  tasks: Task[]
  loadTasks: () => Promise<void>
  updateTask: (task: Task) => void
  updateTaskStatus: (id: string, status: Task['status']) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],

  loadTasks: async () => {
    const tasks = await tasksApi.list()
    set({ tasks })
  },

  updateTask: task =>
    set(state => ({
      tasks: state.tasks.find(t => t.id === task.id)
        ? state.tasks.map(t => t.id === task.id ? task : t)
        : [task, ...state.tasks]
    })),

  updateTaskStatus: (id, status) =>
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
    }))
}))
