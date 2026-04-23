import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="bg-mesh-warm flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="glass-panel max-w-2xl rounded-[2rem] p-10 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          <Sparkles size={14} /> Lost in the custom studio
        </div>
        <p className="mb-2 text-8xl font-black tracking-tight text-brand-100">404</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">This page wandered off</h1>
        <p className="mx-auto mb-8 max-w-md text-slate-500">
          The page you are looking for does not exist right now, but the rest of the storefront is still very much alive.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
