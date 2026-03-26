import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import TaskBoardPage from './pages/TaskBoardPage'
import SkillsPage from './pages/SkillsPage'
import MarketplacePage from './pages/MarketplacePage'
import SchedulerPage from './pages/SchedulerPage'
import ToolsPage from './pages/ToolsPage'
import FilesPage from './pages/FilesPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:sessionId" element={<ChatPage />} />
          <Route path="tasks" element={<TaskBoardPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="scheduler" element={<SchedulerPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
