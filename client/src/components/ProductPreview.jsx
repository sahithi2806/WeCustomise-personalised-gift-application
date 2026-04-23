import { useId } from 'react'

function getCategorySlug(product) {
  return product?.category?.slug || ''
}

function getPreviewConfig(product) {
  const slug = getCategorySlug(product)

  if (slug === 'tshirts') {
    return {
      surface: { x: 104, y: 86, width: 192, height: 218, radius: 26, rotation: -2 },
      tintOpacity: 0.42,
    }
  }

  if (slug === 'hoodies') {
    return {
      surface: { x: 96, y: 88, width: 208, height: 224, radius: 24, rotation: -1 },
      tintOpacity: 0.48,
    }
  }

  if (slug === 'mugs') {
    return {
      surface: { x: 92, y: 132, width: 214, height: 124, radius: 30, rotation: -3 },
      tintOpacity: 0.22,
    }
  }

  if (slug === 'phone-cases') {
    return {
      surface: { x: 112, y: 48, width: 176, height: 304, radius: 34, rotation: -5 },
      tintOpacity: 0.28,
    }
  }

  if (slug === 'posters') {
    return {
      surface: { x: 58, y: 42, width: 284, height: 316, radius: 8, rotation: 0 },
      tintOpacity: 0.1,
    }
  }

  return {
    surface: { x: 88, y: 88, width: 224, height: 224, radius: 24, rotation: 0 },
    tintOpacity: 0.24,
  }
}

function renderTextLayer(layer, filterId) {
  return (
    <text
      key={layer.id}
      x={layer.x}
      y={layer.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={layer.color || '#1F4E79'}
      fontFamily={layer.fontFamily || 'Arial'}
      fontSize={layer.fontSize || 28}
      fontWeight={layer.bold ? 700 : 500}
      fontStyle={layer.italic ? 'italic' : 'normal'}
      filter={`url(#${filterId})`}
    >
      {layer.text}
    </text>
  )
}

function renderImageLayer(layer) {
  return (
    <image
      key={layer.id}
      href={layer.srcUrl}
      x={layer.x - layer.width / 2}
      y={layer.y - layer.height / 2}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity ?? 1}
      preserveAspectRatio="xMidYMid meet"
    />
  )
}

export default function ProductPreview({
  product,
  customisation,
  className = '',
  imageClassName = '',
  showBadge = false,
}) {
  const id = useId()
  const config = getPreviewConfig(product)
  const layers = Array.isArray(customisation?.layers) ? customisation.layers : []
  const hasDesign = Boolean(customisation?.bgColor || layers.length)
  const clipPathId = `${id}-clip`
  const filterId = `${id}-shadow`

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <img src={product.imageUrl} alt={product.name} className={`h-full w-full object-cover ${imageClassName}`} />

      {customisation?.bgColor && (
        <div
          className="absolute inset-0"
          style={{
            background: customisation.bgColor,
            mixBlendMode: 'multiply',
            opacity: config.tintOpacity,
          }}
        />
      )}

      {hasDesign && (
        <div
          className="absolute shadow-[0_18px_45px_rgba(15,23,42,0.2)]"
          style={{
            left: `${(config.surface.x / 400) * 100}%`,
            top: `${(config.surface.y / 400) * 100}%`,
            width: `${(config.surface.width / 400) * 100}%`,
            height: `${(config.surface.height / 400) * 100}%`,
            transform: `rotate(${config.surface.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <clipPath id={clipPathId}>
                <rect x="0" y="0" width="400" height="400" rx={config.surface.radius} ry={config.surface.radius} />
              </clipPath>
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(15,23,42,0.28)" />
              </filter>
            </defs>

            <g clipPath={`url(#${clipPathId})`}>
              <rect
                x="0"
                y="0"
                width="400"
                height="400"
                fill={customisation?.bgColor || 'rgba(255,255,255,0.06)'}
                fillOpacity={customisation?.bgColor ? 0.92 : 0.08}
              />
              {layers.map((layer) =>
                layer.type === 'image' ? renderImageLayer(layer) : renderTextLayer(layer, filterId)
              )}
            </g>
          </svg>
        </div>
      )}

      {showBadge && hasDesign && (
        <div className="absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
          Custom design on product
        </div>
      )}
    </div>
  )
}
