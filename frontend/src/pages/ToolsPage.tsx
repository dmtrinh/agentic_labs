import { useQuery } from '@tanstack/react-query'
import { toolsApi } from '../services/api'
import { Wrench, CheckCircle2, Tag } from 'lucide-react'

const categoryColors: Record<string, string> = {
  web:    'bg-blue-500/20 text-blue-400',
  system: 'bg-orange-500/20 text-orange-400',
  files:  'bg-green-500/20 text-green-400',
  ai:     'bg-purple-500/20 text-purple-400'
}

export default function ToolsPage() {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: toolsApi.list
  })

  const byCategory = tools.reduce<Record<string, typeof tools>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = []
    acc[tool.category].push(tool)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
        <Wrench className="w-5 h-5 text-brand-400" />
        <h1 className="font-semibold text-gray-100">Available Tools</h1>
        <span className="ml-auto text-xs text-gray-600">{tools.length} tools</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="text-gray-600 text-sm">Loading...</div>
        ) : (
          Object.entries(byCategory).map(([category, catTools]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catTools.map(tool => (
                  <div key={tool.name} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-200">{tool.name}</code>
                        {tool.enabled && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[tool.category] ?? 'bg-gray-700 text-gray-400'
                      }`}>
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{tool.description}</p>
                    {tool.parameters.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs text-gray-600">Parameters:</p>
                        {tool.parameters.map(param => (
                          <div key={param.name} className="flex items-start gap-2 text-xs">
                            <code className={`font-mono ${param.required ? 'text-brand-400' : 'text-gray-500'}`}>
                              {param.name}
                            </code>
                            <span className="text-gray-600">{param.type}</span>
                            <span className="text-gray-500">{param.description}</span>
                            {param.required && <span className="text-brand-500 text-xs">*</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
