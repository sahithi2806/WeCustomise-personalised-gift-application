import { Link } from 'react-router-dom'

function BrandGlyph({ compact = false }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.15rem] ${compact ? 'h-10 w-10' : 'h-12 w-12'} bg-[linear-gradient(145deg,#1f4e79_5%,#ec4899_52%,#f59e0b_100%)] shadow-[0_14px_35px_rgba(15,23,42,0.18)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="absolute -right-2 top-1 h-5 w-5 rounded-full bg-white/20 blur-md" />
      <div className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-white/70" />
      <div className="relative flex h-full w-full items-center justify-center">
        <span className={`font-black tracking-[-0.08em] text-white ${compact ? 'text-base' : 'text-lg'}`}>WC</span>
      </div>
    </div>
  )
}

export default function BrandLogo({ to = '/', compact = false, light = false, className = '' }) {
  const content = (
    <div className={`group inline-flex items-center gap-3 ${className}`}>
      <div className="transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]">
        <BrandGlyph compact={compact} />
      </div>
      <div className="min-w-0">
        <p className={`font-black leading-none tracking-tight ${compact ? 'text-lg' : 'text-xl'} ${light ? 'text-white' : 'text-slate-900'}`}>
          WeCustomise
        </p>
        <p className={`mt-1 text-[10px] uppercase tracking-[0.28em] ${light ? 'text-white/70' : 'text-slate-400'}`}>
          Gifts with glow
        </p>
      </div>
    </div>
  )

  if (!to) return content

  return <Link to={to}>{content}</Link>
}
