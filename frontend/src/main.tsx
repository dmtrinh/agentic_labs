import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#1a1a1a', color: '#f87171', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Application Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 }
  }
})

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<p style="color:red;padding:20px;font-size:20px">ERROR: #root element not found</p>'
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-gray-800 text-gray-100 border border-gray-700',
              duration: 3000
            }}
          />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
