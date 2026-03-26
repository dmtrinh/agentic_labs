import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulerApi } from '../services/api'
import type { CreateJobRequest, JobType } from '../types'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calendar, Clock } from 'lucide-react'

export default function SchedulerPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateJobRequest>({
    name: '',
    description: '',
    jobType: 'CRON',
    schedule: '0 9 * * *',
    prompt: '',
    agentId: 'default'
  })

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: schedulerApi.listJobs
  })

  const createMutation = useMutation({
    mutationFn: schedulerApi.createJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      setShowForm(false)
      setForm({ name: '', description: '', jobType: 'CRON', schedule: '0 9 * * *', prompt: '', agentId: 'default' })
      toast.success('Job created')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: schedulerApi.deleteJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted')
    }
  })

  const scheduleHints: Record<JobType, string> = {
    CRON: 'Cron expression (e.g. 0 9 * * * = daily 9am)',
    INTERVAL: 'Interval in seconds (e.g. 3600 = every hour)',
    ONCE: 'ISO datetime (e.g. 2025-12-25T10:00:00Z)'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
        <Calendar className="w-5 h-5 text-brand-400" />
        <h1 className="font-semibold text-gray-100 flex-1">Scheduler</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create form */}
        {showForm && (
          <div className="card p-4 space-y-3">
            <h3 className="font-medium text-gray-200">Create Scheduled Job</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={form.jobType}
                  onChange={e => setForm({...form, jobType: e.target.value as JobType})}
                  className="input"
                >
                  <option value="CRON">Cron</option>
                  <option value="INTERVAL">Interval</option>
                  <option value="ONCE">Once</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Schedule — <span className="text-gray-600">{scheduleHints[form.jobType]}</span>
                </label>
                <input value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} className="input" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Prompt</label>
                <textarea
                  value={form.prompt}
                  onChange={e => setForm({...form, prompt: e.target.value})}
                  rows={3}
                  className="input resize-none"
                  placeholder="What should the agent do?"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || !form.prompt || createMutation.isPending}
                className="btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Job list */}
        {isLoading ? (
          <div className="text-gray-600 text-sm">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No scheduled jobs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200">{job.name}</span>
                    <span className="badge bg-gray-700 text-gray-400">{job.jobType}</span>
                    <span className={`badge ${job.enabled ? 'badge-done' : 'badge-todo'}`}>
                      {job.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{job.schedule}</p>
                  <p className="text-sm text-gray-400 mt-1 truncate">{job.prompt}</p>
                  {job.lastRunAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      Last run: {new Date(job.lastRunAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(job.id)}
                  className="btn-ghost p-1.5 text-gray-600 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
