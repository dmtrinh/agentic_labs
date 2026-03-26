import { useQuery } from '@tanstack/react-query'
import { systemApi } from '../services/api'
import { Settings, Server, Cpu, HardDrive, Code2 } from 'lucide-react'

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
          <h2 className="font-medium text-gray-200">Configuration</h2>
          <p className="text-sm text-gray-400">Configure the application via environment variables:</p>
          <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
            <div><span className="text-brand-400">OPENAI_API_KEY</span>=your_key</div>
            <div><span className="text-brand-400">ANTHROPIC_API_KEY</span>=your_key</div>
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
