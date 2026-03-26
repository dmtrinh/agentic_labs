import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '../services/api'
import toast from 'react-hot-toast'
import { Download, ShoppingBag, Star, ExternalLink } from 'lucide-react'

interface MarketplaceSkill {
  name: string
  description: string
  author: string
  stars: number
  content: string
  tags: string[]
}

const COMMUNITY_SKILLS: MarketplaceSkill[] = [
  {
    name: 'sql_expert',
    description: 'Expert SQL query writing and optimization',
    author: 'community',
    stars: 142,
    tags: ['database', 'sql'],
    content: `# SQL Expert\nYou are an expert SQL developer. Write optimized, safe SQL queries.\n\n## Guidelines\n- Use indexes effectively\n- Avoid SELECT *\n- Explain query logic`
  },
  {
    name: 'creative_writer',
    description: 'Creative writing assistance with style and flair',
    author: 'community',
    stars: 98,
    tags: ['writing', 'creative'],
    content: `# Creative Writer\nYou are a creative writing assistant.\n\n## Styles\n- Fiction, Poetry, Screenwriting\n- Adapt tone to request`
  },
  {
    name: 'data_analyst',
    description: 'Data analysis, statistics, and visualization guidance',
    author: 'community',
    stars: 211,
    tags: ['data', 'analysis', 'python'],
    content: `# Data Analyst\nAnalyze data and suggest visualizations.\n\n## Tools\n- Python (pandas, matplotlib)\n- Statistical methods`
  },
  {
    name: 'devops_helper',
    description: 'Docker, Kubernetes, CI/CD pipeline assistance',
    author: 'community',
    stars: 175,
    tags: ['devops', 'docker', 'k8s'],
    content: `# DevOps Helper\nHelp with infrastructure and deployment.\n\n## Topics\n- Docker & Kubernetes\n- CI/CD pipelines\n- Cloud providers`
  },
  {
    name: 'security_auditor',
    description: 'Code security review and vulnerability assessment',
    author: 'community',
    stars: 89,
    tags: ['security', 'code-review'],
    content: `# Security Auditor\nReview code for security vulnerabilities.\n\n## OWASP Top 10 checks\n- Injection flaws\n- Authentication issues\n- XSS vulnerabilities`
  }
]

export default function MarketplacePage() {
  const qc = useQueryClient()
  const [installed, setInstalled] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const installMutation = useMutation({
    mutationFn: (skill: MarketplaceSkill) =>
      skillsApi.update(skill.name, skill.content),
    onSuccess: (_, skill) => {
      setInstalled(prev => new Set([...prev, skill.name]))
      qc.invalidateQueries({ queryKey: ['skills'] })
      toast.success(`Installed "${skill.name}"`)
    }
  })

  const filtered = COMMUNITY_SKILLS.filter(s =>
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
          className="input w-56"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(skill => (
            <div key={skill.name} className="card p-4 flex flex-col gap-3">
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

              <div className="flex items-center gap-2 mt-auto pt-2">
                <button
                  onClick={() => installMutation.mutate(skill)}
                  disabled={installed.has(skill.name) || installMutation.isPending}
                  className={installed.has(skill.name) ? 'btn-secondary py-1.5 flex-1' : 'btn-primary py-1.5 flex-1'}
                >
                  <Download className="w-3.5 h-3.5" />
                  {installed.has(skill.name) ? 'Installed' : 'Install'}
                </button>
                <button className="btn-ghost py-1.5 px-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
