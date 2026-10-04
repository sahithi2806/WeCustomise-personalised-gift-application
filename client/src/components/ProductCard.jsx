import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Star, Paintbrush, Image as ImageIcon } from 'lucide-react'

export default function ProductCard({ product, index = 0 }) {
  const reduceMotion = useReducedMotion()
  const [imgError, setImgError] = useState(false)
  const imageClass = 'h-full w-full object-cover transition duration-500 group-hover:scale-110'

  return (
    <Link to={`/product/${product.id}`} className="card group flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4 text-center">
            <ImageIcon className="mb-2 text-brand-300" size={28} />
            <span className="text-xs font-semibold text-slate-500 line-clamp-2">{product.name}</span>
          </div>
        ) : reduceMotion ? (
          <img src={product.imageUrl} alt={product.name} className={imageClass} loading="lazy" onError={() => setImgError(true)} />
        ) : (
          <motion.img
            layoutId={`product-image-${product.id}`}
            src={product.imageUrl}
            alt={product.name}
            className={imageClass}
            loading="lazy"
            onError={() => setImgError(true)}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />

        {product.isCustomisable && (
          <div className="absolute top-3 left-3">
            <span className="badge gap-1 bg-white/90 text-brand-700 shadow-sm backdrop-blur">
              <Paintbrush size={10} /> Customisable
            </span>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full bg-black/65 px-3 py-1 text-sm font-semibold text-white">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">{product.category?.name}</p>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
          {product.name}
        </h3>

        {product.avgRating && (
          <div className="mt-2 flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-500">{product.avgRating} ({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xl font-black text-brand-700">Rs. {product.price.toLocaleString()}</span>
          <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  )
}
