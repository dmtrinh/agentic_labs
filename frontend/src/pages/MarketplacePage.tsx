import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marketplaceApi } from '../services/api'
import toast from 'react-hot-toast'
import { Download, ShoppingBag, Star, Check } from 'lucide-react'

interface MarketplaceSkill {
  source: string
  name: string
  description: string
  author: string
  stars: number
  tags: string[]
}

const CATALOG: MarketplaceSkill[] = [
  {
    source: 'community',
    name: 'sql-expert',
    description: 'Expert SQL query writing and database optimization',
    author: 'community',
    stars: 142,
    tags: ['database', 'sql']
  },
  {
    source: 'community',
    name: 'creative-writer',
    description: 'Creative writing assistance with style and flair',
    author: 'community',
    stars: 98,
    tags: ['writing', 'creative']
  },
  {
    source: 'community',
    name: 'data-analyst',
    description: 'Data analysis, statistics, and visualization guidance',
    author: 'community',
    stars: 211,
    tags: ['data', 'analysis', 'python']
  },
  {
    source: 'community',
    name: 'devops-helper',
    description: 'Docker, Kubernetes, CI/CD pipeline assistance',
    author: 'community',
    stars: 175,
    tags: ['devops', 'docker', 'k8s']
  },
  {
    source: 'community',
    name: 'security-auditor',
    description: 'Code security review and vulnerability assessment',
    author: 'community',
    stars: 89,
    tags: ['security', 'code-review']
  }
]

export default function MarketplacePage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')

  const { data: targets = [] } = useQuery({
    queryKey: ['marketplace-targets'],
    queryFn: marketplaceApi.targets
  })

  const installMutation = useMutation({
    mutationFn: (skill: MarketplaceSkill) =>
      marketplaceApi.install(skill.source, skill.name, selectedAgent),
    onSuccess: (_, skill) => {
      qc.invalidateQueries({ queryKey: ['skills'] })
      qc.invalidateQueries({ queryKey: ['marketplace-installed'] })
      toast.success(`Installed "${skill.name}"`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Install failed')
    }
  })

  const filtered = CATALOG.filter(s =>
    s.name.includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.tags.some(t => t.includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
        <ShoppingBag className="w-5 h-5 text-brand-400" />
        <h1 className="font-semibold text-gray-100 flex-1">Skill Marketplace</h1>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="input w-48"
        />
        {targets.length > 0 && (
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="input w-40 bg-gray-900 text-sm"
          >
            {targets.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(skill => (
            <SkillCard
              key={`${skill.source}/${skill.name}`}
              skill={skill}
              selectedAgent={selectedAgent}
              onInstall={() => installMutation.mutate(skill)}
              installing={installMutation.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillCard({
  skill,
  selectedAgent,
  onInstall,
  installing
}: {
  skill: MarketplaceSkill
  selectedAgent: string
  onInstall: () => void
  installing: boolean
}) {
  const { data: checkResult } = useQuery({
    queryKey: ['marketplace-check', skill.source, skill.name, selectedAgent],
    queryFn: () => marketplaceApi.check(skill.source, skill.name, selectedAgent),
    staleTime: 30_000
  })

  const isInstalled = checkResult?.installed ?? false

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-100">{skill.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">by {skill.author}</p>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          <Star className="w-3.5 h-3.5 fill-current" />
          {skill.stars}
        </div>
      </div>

      <p className="text-sm text-gray-400">{skill.description}</p>

      <div className="flex flex-wrap gap-1">
        {skill.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-2">
        <button
          onClick={onInstall}
          disabled={isInstalled || installing}
          className={isInstalled ? 'btn-secondary py-1.5 w-full' : 'btn-primary py-1.5 w-full'}
        >
          {isInstalled
            ? <><Check className="w-3.5 h-3.5" /> Installed</>
            : <><Download className="w-3.5 h-3.5" /> Install</>}
        </button>
      </div>
    </div>
  )
}
