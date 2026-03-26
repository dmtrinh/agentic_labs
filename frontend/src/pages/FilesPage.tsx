import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '../services/api'
import type { FileEntry } from '../types'
import toast from 'react-hot-toast'
import {
  FolderOpen, FileText, Plus, Trash2, Save,
  Download, FolderPlus, ChevronRight
} from 'lucide-react'

export default function FilesPage() {
  const qc = useQueryClient()
  const [currentPath, setCurrentPath] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newDirName, setNewDirName] = useState('')

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files', currentPath],
    queryFn: () => filesApi.list(currentPath)
  })

  const deleteMutation = useMutation({
    mutationFn: filesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] })
      if (selectedFile && currentPath.startsWith(selectedFile.path)) {
        setSelectedFile(null)
      }
      toast.success('Deleted')
    }
  })

  const saveMutation = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      filesApi.update(path, content),
    onSuccess: () => toast.success('Saved')
  })

  const createMutation = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      filesApi.create(path, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] })
      setNewFileName('')
      toast.success('File created')
    }
  })

  const mkdirMutation = useMutation({
    mutationFn: filesApi.mkdir,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files'] })
      setNewDirName('')
      toast.success('Directory created')
    }
  })

  const handleSelectFile = async (entry: FileEntry) => {
    if (entry.type === 'directory') {
      setCurrentPath(entry.path)
      return
    }
    setSelectedFile(entry)
    try {
      const content = await filesApi.read(entry.path)
      setFileContent(content)
    } catch {
      setFileContent('')
    }
  }

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : []

  const topLevelFiles = files.filter(f => {
    const relativePath = currentPath ? f.path.replace(currentPath + '/', '') : f.path
    return !relativePath.includes('/')
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 flex-shrink-0">
        <FolderOpen className="w-5 h-5 text-brand-400" />
        <h1 className="font-semibold text-gray-100">Files</h1>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm ml-2">
          <button onClick={() => setCurrentPath('')} className="text-gray-400 hover:text-gray-200">
            workspace
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <button
                onClick={() => setCurrentPath(pathParts.slice(0, i + 1).join('/'))}
                className="text-gray-400 hover:text-gray-200"
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="filename.txt"
            className="input w-32"
          />
          <button
            onClick={() => createMutation.mutate({ path: [currentPath, newFileName].filter(Boolean).join('/'), content: '' })}
            disabled={!newFileName}
            className="btn-ghost py-1.5"
            title="New file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <input
            value={newDirName}
            onChange={e => setNewDirName(e.target.value)}
            placeholder="folder"
            className="input w-28"
          />
          <button
            onClick={() => mkdirMutation.mutate([currentPath, newDirName].filter(Boolean).join('/'))}
            disabled={!newDirName}
            className="btn-ghost py-1.5"
            title="New folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File tree */}
        <div className="w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          {isLoading ? (
            <div className="p-4 text-gray-600 text-sm">Loading...</div>
          ) : topLevelFiles.length === 0 ? (
            <div className="p-4 text-gray-700 text-sm">Empty directory</div>
          ) : (
            topLevelFiles.map(entry => (
              <div
                key={entry.path}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-800/50 hover:bg-gray-800 transition-colors ${
                  selectedFile?.path === entry.path ? 'bg-gray-800' : ''
                }`}
                onClick={() => handleSelectFile(entry)}
              >
                {entry.type === 'directory'
                  ? <FolderOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
                <span className="text-sm text-gray-300 truncate flex-1">{entry.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  {entry.type === 'file' && (
                    <a
                      href={filesApi.downloadUrl(entry.path)}
                      download={entry.name}
                      className="p-1 text-gray-600 hover:text-gray-300"
                      onClick={e => e.stopPropagation()}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(entry.path) }}
                    className="p-1 text-gray-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-mono">{selectedFile.path}</span>
                <button
                  onClick={() => saveMutation.mutate({ path: selectedFile.path, content: fileContent })}
                  className="btn-primary py-1 px-3 text-xs"
                  disabled={saveMutation.isPending}
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
              <textarea
                value={fileContent}
                onChange={e => setFileContent(e.target.value)}
                className="flex-1 bg-gray-950 text-gray-300 text-sm font-mono p-4 resize-none focus:outline-none"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-700">
              <p>Select a file to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
