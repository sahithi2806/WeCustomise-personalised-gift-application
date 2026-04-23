import { Link } from 'react-router-dom'
import { Star, Paintbrush } from 'lucide-react'

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.isCustomisable && (
          <div className="absolute top-2 left-2">
            <span className="badge bg-brand-700 text-white flex items-center gap-1">
              <Paintbrush size={10} /> Customisable
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category?.name}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.avgRating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500">{product.avgRating} ({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="text-lg font-bold text-brand-700">₹{product.price.toLocaleString()}</span>
          <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  )
}
