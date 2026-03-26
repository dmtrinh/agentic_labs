import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { systemApi, credentialsApi, providersApi, channelsApi } from '../services/api'
import type { CreateCredentialRequest } from '../types'
import toast from 'react-hot-toast'
import {
  Settings, Server, Cpu, HardDrive, Code2, Key, Zap, Radio,
  Plus, Trash2, Eye, EyeOff, Play, Square, Check, X
} from 'lucide-react'

// ---- Credentials Section ----
function CredentialsSection() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [revealKeys, setRevealKeys] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<CreateCredentialRequest>({ name: '', type: 'simple', key: '' })

  const { data: credentials = [] } = useQuery({
    queryKey: ['credentials'],
    queryFn: credentialsApi.list
  })

  const createMutation = useMutation({
    mutationFn: credentialsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] })
      setShowForm(false)
      setForm({ name: '', type: 'simple', key: '' })
      toast.success('Credential created')
    },
    onError: () => toast.error('Failed to create credential')
  })

  const deleteMutation = useMutation({
    mutationFn: credentialsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] })
      toast.success('Credential deleted')
    }
  })

  const toggleReveal = (name: string) => {
    setRevealKeys(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-gray-200 flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-400" /> Credentials
        </h2>
        <button onClick={() => setShowForm(v => !v)} className="btn-ghost py-1 px-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-lg p-3 space-y-2 border border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input text-sm"
              placeholder="Name (e.g. anthropic)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <select
              className="input text-sm bg-gray-900"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="simple">Simple (API Key)</option>
              <option value="bearer">Bearer Token</option>
              <option value="login">Login (user/pass)</option>
            </select>
          </div>
          {form.type === 'login' && (
            <input
              className="input text-sm"
              placeholder="Username"
              value={form.username ?? ''}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          )}
          <input
            className="input text-sm font-mono"
            placeholder={form.type === 'login' ? 'Password' : 'API Key / Token'}
            type="password"
            value={form.key ?? ''}
            onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-ghost py-1 px-3 text-xs">
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || createMutation.isPending}
              className="btn-primary py-1 px-3 text-xs"
            >
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      )}

      {credentials.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500">No credentials configured.</p>
      ) : (
        <div className="space-y-2">
          {credentials.map(cred => (
            <div key={cred.name} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-300 font-mono flex-1">{cred.name}</span>
              <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-800 rounded">{cred.type}</span>
              {cred.key && (
                <span className="text-xs font-mono text-gray-500">
                  {revealKeys.has(cred.name) ? cred.key : '••••••••'}
                </span>
              )}
              {cred.key && (
                <button onClick={() => toggleReveal(cred.name)} className="btn-ghost p-1">
                  {revealKeys.has(cred.name)
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(cred.name)}
                className="btn-ghost p-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---- Providers Section ----
function ProvidersSection() {
  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: providersApi.list
  })

  return (
    <section className="card p-4 space-y-3">
      <h2 className="font-medium text-gray-200 flex items-center gap-2">
        <Zap className="w-4 h-4 text-brand-400" /> LLM Providers
      </h2>
      <div className="space-y-2">
        {providers.map(p => (
          <div key={p.name} className="flex items-center gap-3 bg-gray-900 rounded-lg px-3 py-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200 capitalize font-medium">{p.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${p.configured ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                  {p.configured ? 'configured' : 'not configured'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{p.models.slice(0, 3).join(', ')}{p.models.length > 3 ? ` +${p.models.length - 3} more` : ''}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Set API keys via credentials or environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)</p>
    </section>
  )
}

// ---- Channels Section ----
function ChannelsSection() {
  const qc = useQueryClient()
  const { data: channels = {} } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list
  })

  const startMutation = useMutation({
    mutationFn: channelsApi.start,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Channel started') }
  })

  const stopMutation = useMutation({
    mutationFn: channelsApi.stop,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Channel stopped') }
  })

  return (
    <section className="card p-4 space-y-3">
      <h2 className="font-medium text-gray-200 flex items-center gap-2">
        <Radio className="w-4 h-4 text-brand-400" /> Channels
      </h2>
      <div className="space-y-2">
        {Object.values(channels).map(ch => (
          <div key={ch.name} className="flex items-center gap-3 bg-gray-900 rounded-lg px-3 py-2">
            <div className={`w-2 h-2 rounded-full ${ch.running ? 'bg-green-400' : 'bg-gray-600'}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-200 capitalize font-medium">{ch.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${ch.running ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                  {ch.running ? 'running' : 'stopped'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{ch.description}</p>
            </div>
            {ch.name !== 'web' && (
              ch.running ? (
                <button
                  onClick={() => stopMutation.mutate(ch.name)}
                  className="btn-ghost p-1.5 text-red-400"
                  title="Stop channel"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => startMutation.mutate(ch.name)}
                  className="btn-ghost p-1.5 text-green-400"
                  title="Start channel"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ---- Main SettingsPage ----
export default function SettingsPage() {
  const { data: version } = useQuery({ queryKey: ['version'], queryFn: systemApi.version })
  const { data: info } = useQuery({ queryKey: ['system-info'], queryFn: systemApi.info })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
        <Settings className="w-5 h-5 text-brand-400" />
        <h1 className="font-semibold text-gray-100">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl">

        <CredentialsSection />
        <ProvidersSection />
        <ChannelsSection />

        {/* Version info */}
        <section className="card p-4 space-y-3">
          <h2 className="font-medium text-gray-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-400" /> Version Info
          </h2>
          {version && (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(version).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-gray-500 capitalize">{k}</dt>
                  <dd className="text-gray-300 font-mono">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* System info */}
        {info && (
          <>
            <section className="card p-4 space-y-3">
              <h2 className="font-medium text-gray-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" /> CPU & OS
              </h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">OS</dt><dd className="text-gray-300">{info.os?.name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Arch</dt><dd className="text-gray-300">{info.os?.arch}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">CPUs</dt><dd className="text-gray-300">{info.os?.cpuCount}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Load</dt><dd className="text-gray-300">{Number(info.os?.systemLoad).toFixed(2)}</dd></div>
              </dl>
            </section>

            <section className="card p-4 space-y-3">
              <h2 className="font-medium text-gray-200 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-brand-400" /> Memory
              </h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Heap Used</dt><dd className="text-gray-300">{info.memory?.heapUsedMb} MB</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Heap Max</dt><dd className="text-gray-300">{info.memory?.heapMaxMb} MB</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="text-gray-300">{info.memory?.totalMb} MB</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Free</dt><dd className="text-gray-300">{info.memory?.freeMb} MB</dd></div>
              </dl>
            </section>

            <section className="card p-4 space-y-3">
              <h2 className="font-medium text-gray-200 flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-400" /> Runtime
              </h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Java</dt><dd className="text-gray-300">{info.java?.version}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Vendor</dt><dd className="text-gray-300">{info.java?.vendor}</dd></div>
              </dl>
            </section>
          </>
        )}

        {/* Environment */}
        <section className="card p-4 space-y-3">
          <h2 className="font-medium text-gray-200">Environment Variables</h2>
          <p className="text-sm text-gray-400">Override configuration via environment variables:</p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
            <div><span className="text-brand-400">OPENAI_API_KEY</span>=your_key</div>
            <div><span className="text-brand-400">ANTHROPIC_API_KEY</span>=your_key</div>
            <div><span className="text-brand-400">GOOGLE_API_KEY</span>=your_key</div>
            <div><span className="text-brand-400">DEFAULT_LLM</span>=gpt-4o</div>
            <div><span className="text-brand-400">ADMIN_PASSWORD</span>=your_password</div>
            <div><span className="text-brand-400">JWT_SECRET</span>=your_secret</div>
            <div><span className="text-brand-400">WORKSPACE_PATH</span>=./workspace</div>
          </div>
        </section>

      </div>
    </div>
  )
}
