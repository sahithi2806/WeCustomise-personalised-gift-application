import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, Gift, Palette, Sparkles } from 'lucide-react'
import BrandLogo from '../BrandLogo'

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-slate-950 text-slate-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.18),transparent_22%),linear-gradient(180deg,rgba(31,78,121,0.22),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <Palette size={20} className="text-orange-300" />
            <p className="mt-3 text-sm font-semibold text-white">Live product previews</p>
            <p className="mt-1 text-sm text-slate-400">Designs now sit on shirts, mugs, cases, and posters instead of flat replacement images.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <Gift size={20} className="text-fuchsia-300" />
            <p className="mt-3 text-sm font-semibold text-white">Gift scheduling</p>
            <p className="mt-1 text-sm text-slate-400">Choose the delivery moment during checkout for birthdays, celebrations, and surprises.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <Sparkles size={20} className="text-sky-300" />
            <p className="mt-3 text-sm font-semibold text-white">Brighter storefront</p>
            <p className="mt-1 text-sm text-slate-400">A more expressive visual system with layered gradients, softer glass surfaces, and richer motion.</p>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <BrandLogo to="/" light className="mb-4" />
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Personalised products made just for you. Distinct gifts, custom stories, and a little extra glow in every order.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Quick Links</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/" className="inline-flex items-center gap-2 transition hover:text-white">Home <ArrowUpRight size={14} /></Link></li>
              <li><Link to="/shop" className="inline-flex items-center gap-2 transition hover:text-white">Shop <ArrowUpRight size={14} /></Link></li>
              <li><Link to="/register" className="inline-flex items-center gap-2 transition hover:text-white">Create Account <ArrowUpRight size={14} /></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Support</h4>
            {/* These were <a href="#">, which just jumped to the top of the page. */}
            <div className="mt-4 space-y-2 text-sm">
              <details className="group">
                <summary className="cursor-pointer list-none inline-flex items-center gap-2 transition hover:text-white">
                  Frequently Asked Questions <ChevronDown size={14} className="transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2 pl-4 text-slate-400">
                  <li>How long does delivery take? Standard delivery is 3–5 days; scheduled gift delivery lets you pick the exact moment.</li>
                  <li>Can I change a design after ordering? Reach out soon after placing the order and we can usually help.</li>
                  <li>What payment methods do you accept? UPI, card, and cash on delivery.</li>
                </ul>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none inline-flex items-center gap-2 transition hover:text-white">
                  Shipping Policy <ChevronDown size={14} className="transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2 pl-4 text-slate-400">
                  <li>Free shipping on orders over Rs. 999; a flat Rs. 99 applies below that.</li>
                  <li>Gift orders can be scheduled up front during checkout.</li>
                  <li>You can cancel any order while it is still placed or processing.</li>
                </ul>
              </details>

              <details className="group">
                <summary className="cursor-pointer list-none inline-flex items-center gap-2 transition hover:text-white">
                  Contact Us <ChevronDown size={14} className="transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2 pl-4 text-slate-400">
                  <li>Email: <span className="text-slate-300">support@wecustomise.com</span></li>
                  <li>Hours: Monday–Saturday, 10am–7pm IST</li>
                  <li>We reply to most messages within a working day.</li>
                </ul>
              </details>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          Copyright {new Date().getFullYear()} WeCustomise. Designed to make gifting feel personal.
        </div>
      </div>
    </footer>
  )
}
