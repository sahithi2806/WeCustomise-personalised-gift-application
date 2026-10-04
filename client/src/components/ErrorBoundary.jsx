import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-lg w-full p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertTriangle size={26} className="text-rose-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Something went wrong on this page</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The app hit an unexpected error. Reloading usually clears it — if it keeps happening,
            your cart and orders are still safe on the server.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-slate-50 px-4 py-3 text-left text-xs text-slate-500">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6 inline-flex items-center gap-2">
            <RefreshCw size={15} /> Reload the page
          </button>
        </div>
      </div>
    )
  }
}