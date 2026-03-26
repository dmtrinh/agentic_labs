import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '../services/api'
import type { Skill } from '../types'
import toast from 'react-hot-toast'
import { Plus, Save, Trash2, Zap } from 'lucide-react'

export default function SkillsPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Skill | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newName, setNewName] = useState('')

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsApi.list
  })

  const saveMutation = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      skillsApi.update(name, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Skill saved')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (name: string) => skillsApi.delete(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] })
      setSelected(null)
      toast.success('Skill deleted')
    }
  })

  const handleSelect = (skill: Skill) => {
    setSelected(skill)
    setEditContent(skill.content)
  }

  const handleSave = () => {
    if (!selected) return
    saveMutation.mutate({ name: selected.name, content: editContent })
  }

  const handleNew = () => {
    if (!newName.trim()) return
    const skill: Skill = { name: newName, content: `# ${newName}\n\n`, tier: 'WORKSPACE', description: '' }
    setSelected(skill)
    setEditContent(skill.content)
    setNewName('')
  }

  const tierColor = { BUILTIN: 'text-brand-400', PROJECT: 'text-yellow-400', WORKSPACE: 'text-green-400' }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
        <h1 className="font-semibold text-gray-100 flex-1">Skills</h1>
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New skill name..."
            className="input w-44"
          />
          <button onClick={handleNew} className="btn-primary" disabled={!newName.trim()}>
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          {isLoading ? (
            <div className="p-4 text-gray-600 text-sm">Loading...</div>
          ) : (
            skills.map(skill => (
              <button
                key={skill.name}
                onClick={() => handleSelect(skill)}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                  selected?.name === skill.name ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                </div>
                <span className={`text-xs mt-0.5 block ${tierColor[skill.tier]}`}>{skill.tier}</span>
                {skill.description && (
                  <p className="text-xs text-gray-600 mt-0.5 truncate">{skill.description}</p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{selected.name}.md</span>
                <div className="flex gap-2">
                  {selected.tier !== 'BUILTIN' && (
                    <button
                      onClick={() => deleteMutation.mutate(selected.name)}
                      className="btn-danger py-1 px-2 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className="btn-primary py-1 px-3 text-xs"
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="flex-1 bg-gray-950 text-gray-300 text-sm font-mono p-4 resize-none focus:outline-none"
                placeholder="Write your skill in Markdown..."
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <p>Select a skill to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
