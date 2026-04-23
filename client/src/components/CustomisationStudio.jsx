import { useEffect, useRef, useState, useCallback } from 'react'
import { Type, Palette, ImagePlus, RotateCcw, Download, ZoomIn, ZoomOut, Move, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

const COLORS = [
  '#FFFFFF','#1a1a1a','#1F4E79','#2E75B6','#C0392B',
  '#E74C3C','#27AE60','#2ECC71','#F39C12','#F1C40F',
  '#8E44AD','#9B59B6','#E67E22','#D35400','#16A085',
]

const FONTS = ['Arial','Georgia','Courier New','Impact','Trebuchet MS','Comic Sans MS','Verdana','Times New Roman']

export default function CustomisationStudio({ product, onSave }) {
  const canvasRef   = useRef(null)
  const fileRef     = useRef(null)
  const [tab, setTab]         = useState('text')   // 'text' | 'color' | 'image'
  const [layers, setLayers]   = useState([])        // { id, type, ...props }
  const [selected, setSelected] = useState(null)
  const [bgColor, setBgColor]   = useState('#FFFFFF')
  const [bgImage, setBgImage]   = useState(product.imageUrl)
  const [dragging, setDragging] = useState(null)
  const [dirty, setDirty]       = useState(false)

  // Text tool state
  const [textInput, setTextInput]   = useState('')
  const [textColor, setTextColor]   = useState('#1F4E79')
  const [fontSize, setFontSize]     = useState(28)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [bold, setBold]             = useState(false)
  const [italic, setItalic]         = useState(false)

  const nextId = useRef(1)
  const getId = () => nextId.current++

  // ── Draw canvas ────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Background color
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)

    // Background product image
    if (bgImage) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.globalAlpha = 0.35
        ctx.drawImage(img, 0, 0, W, H)
        ctx.globalAlpha = 1
        drawLayers(ctx, W, H)
      }
      img.src = bgImage
    } else {
      drawLayers(ctx, W, H)
    }
  }, [bgColor, bgImage, layers, selected]) // eslint-disable-line

  function drawLayers(ctx, W, H) {
    layers.forEach(layer => {
      ctx.save()
      const cx = layer.x, cy = layer.y

      if (layer.type === 'text') {
        const weight = layer.bold ? 'bold ' : ''
        const style  = layer.italic ? 'italic ' : ''
        ctx.font = `${style}${weight}${layer.fontSize}px ${layer.fontFamily}`
        ctx.fillStyle = layer.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 4
        ctx.fillText(layer.text, cx, cy)
        ctx.shadowBlur = 0

        // Selection outline
        if (selected === layer.id) {
          const metrics = ctx.measureText(layer.text)
          const tw = metrics.width + 16, th = layer.fontSize + 16
          ctx.strokeStyle = '#2E75B6'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 3])
          ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th)
          ctx.setLineDash([])
        }
      }

      if (layer.type === 'image' && layer.imgEl) {
        const iw = layer.width, ih = layer.height
        ctx.globalAlpha = layer.opacity ?? 1
        ctx.drawImage(layer.imgEl, cx - iw / 2, cy - ih / 2, iw, ih)
        ctx.globalAlpha = 1

        if (selected === layer.id) {
          ctx.strokeStyle = '#2E75B6'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 3])
          ctx.strokeRect(cx - iw / 2, cy - ih / 2, iw, ih)
          ctx.setLineDash([])
        }
      }

      ctx.restore()
    })
  }

  useEffect(() => { draw() }, [draw])

  // ── Hit test ───────────────────────────────────────────────
  const hitTest = (x, y) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // Test in reverse (top layer first)
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]
      if (l.type === 'text') {
        ctx.font = `${l.italic ? 'italic ' : ''}${l.bold ? 'bold ' : ''}${l.fontSize}px ${l.fontFamily}`
        const tw = ctx.measureText(l.text).width + 16
        const th = l.fontSize + 16
        if (x >= l.x - tw / 2 && x <= l.x + tw / 2 && y >= l.y - th / 2 && y <= l.y + th / 2) return l.id
      }
      if (l.type === 'image') {
        if (x >= l.x - l.width / 2 && x <= l.x + l.width / 2 && y >= l.y - l.height / 2 && y <= l.y + l.height / 2) return l.id
      }
    }
    return null
  }

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width  / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  const onMouseDown = (e) => {
    const { x, y } = getCanvasPos(e)
    const hit = hitTest(x, y)
    setSelected(hit)
    if (hit) setDragging({ id: hit, offsetX: x - layers.find(l => l.id === hit).x, offsetY: y - layers.find(l => l.id === hit).y })
  }

  const onMouseMove = (e) => {
    if (!dragging) return
    const { x, y } = getCanvasPos(e)
    setLayers(ls => ls.map(l => l.id === dragging.id ? { ...l, x: x - dragging.offsetX, y: y - dragging.offsetY } : l))
    setDirty(true)
  }

  const onMouseUp = () => setDragging(null)

  // ── Add text ───────────────────────────────────────────────
  const addText = () => {
    if (!textInput.trim()) return
    const canvas = canvasRef.current
    setLayers(ls => [...ls, {
      id: getId(), type: 'text',
      text: textInput, color: textColor,
      fontSize, fontFamily, bold, italic,
      x: canvas.width / 2, y: canvas.height / 2,
    }])
    setTextInput('')
    setDirty(true)
  }

  // ── Add image ──────────────────────────────────────────────
  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      const maxW = 200, maxH = 200
      let w = img.width, h = img.height
      if (w > maxW) { h = h * maxW / w; w = maxW }
      if (h > maxH) { w = w * maxH / h; h = maxH }
      setLayers(ls => [...ls, {
        id: getId(), type: 'image', imgEl: img,
        x: canvas.width / 2, y: canvas.height / 2,
        width: w, height: h, opacity: 1,
        srcUrl: url,
      }])
      setDirty(true)
    }
    img.src = url
  }

  // ── Update selected layer ──────────────────────────────────
  const updateSelected = (patch) => {
    setLayers(ls => ls.map(l => l.id === selected ? { ...l, ...patch } : l))
    setDirty(true)
  }

  const deleteSelected = () => {
    setLayers(ls => ls.filter(l => l.id !== selected))
    setSelected(null)
    setDirty(true)
  }

  const moveLayer = (dir) => {
    setLayers(ls => {
      const idx = ls.findIndex(l => l.id === selected)
      if (idx < 0) return ls
      const next = [...ls]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return ls
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  // ── Export preview snapshot ────────────────────────────────
  const getSnapshot = () => canvasRef.current?.toDataURL('image/png')

  // ── Save ───────────────────────────────────────────────────
  const handleSave = () => {
    const snapshot = getSnapshot()
    const customisation = {
      bgColor,
      layers: layers.map(l => ({
        id: l.id, type: l.type,
        x: l.x, y: l.y,
        ...(l.type === 'text' ? { text: l.text, color: l.color, fontSize: l.fontSize, fontFamily: l.fontFamily, bold: l.bold, italic: l.italic } : {}),
        ...(l.type === 'image' ? { srcUrl: l.srcUrl, width: l.width, height: l.height, opacity: l.opacity } : {}),
      })),
      snapshot,
    }
    onSave(customisation)
    setDirty(false)
  }

  const selectedLayer = layers.find(l => l.id === selected)

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">

      {/* ── Canvas ── */}
      <div className="flex-shrink-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400} height={400}
            className="rounded-2xl shadow-lg border-2 border-gray-100 cursor-crosshair w-full max-w-[400px] mx-auto block"
            style={{ touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onMouseDown}
            onTouchMove={onMouseMove}
            onTouchEnd={onMouseUp}
          />
          {layers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
              <p className="text-sm text-gray-400 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
                Add text or an image to get started
              </p>
            </div>
          )}
        </div>

        {/* Layer controls */}
        {selectedLayer && (
          <div className="mt-3 flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 max-w-[400px] mx-auto shadow-sm">
            <span className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
              {selectedLayer.type === 'text' ? `"${selectedLayer.text}"` : '📷 Image'}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => moveLayer(1)} title="Move down" className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ChevronDown size={14} /></button>
              <button onClick={() => moveLayer(-1)} title="Move up" className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ChevronUp size={14} /></button>
              <button onClick={deleteSelected} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tools Panel ── */}
      <div className="flex-1 min-w-0">

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5 gap-1">
          {[
            { id: 'text',  icon: Type,       label: 'Text'    },
            { id: 'color', icon: Palette,    label: 'Colour'  },
            { id: 'image', icon: ImagePlus,  label: 'Image'   },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Text Tab ── */}
        {tab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Your Text</label>
              <div className="flex gap-2">
                <input
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addText()}
                  placeholder="Type something..."
                  className="input text-sm flex-1"
                  maxLength={60}
                />
                <button onClick={addText} disabled={!textInput.trim()} className="btn-primary px-4 py-2 text-sm">Add</button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{textInput.length}/60 · Press Enter to add</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Text Colour</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setTextColor(c); selectedLayer?.type === 'text' && updateSelected({ color: c }) }}
                    title={c}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${textColor === c ? 'border-brand-700 scale-110' : 'border-gray-200'}`}
                    style={{ background: c }}
                  />
                ))}
                <input type="color" value={textColor} onChange={e => { setTextColor(e.target.value); selectedLayer?.type === 'text' && updateSelected({ color: e.target.value }) }}
                  className="w-7 h-7 rounded-full border-2 border-gray-200 cursor-pointer" title="Custom colour" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Font</label>
              <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); selectedLayer?.type === 'text' && updateSelected({ fontFamily: e.target.value }) }}
                className="input text-sm">
                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Size — {fontSize}px</label>
              <input type="range" min={12} max={72} value={fontSize}
                onChange={e => { setFontSize(Number(e.target.value)); selectedLayer?.type === 'text' && updateSelected({ fontSize: Number(e.target.value) }) }}
                className="w-full accent-brand-700" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setBold(b => !b); selectedLayer?.type === 'text' && updateSelected({ bold: !selectedLayer.bold }) }}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${bold ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-300 text-gray-600 hover:border-brand-700'}`}>
                B
              </button>
              <button onClick={() => { setItalic(i => !i); selectedLayer?.type === 'text' && updateSelected({ italic: !selectedLayer.italic }) }}
                className={`px-4 py-2 rounded-lg text-sm italic border transition-colors ${italic ? 'bg-brand-700 text-white border-brand-700' : 'border-gray-300 text-gray-600 hover:border-brand-700'}`}>
                I
              </button>
            </div>
          </div>
        )}

        {/* ── Colour Tab ── */}
        {tab === 'color' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Background Colour</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLORS.map(c => (
                  <button key={c} onClick={() => { setBgColor(c); setDirty(true) }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c ? 'border-brand-700 scale-110' : 'border-gray-200'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); setDirty(true) }}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <span className="text-sm text-gray-500 font-mono">{bgColor}</span>
              </div>
            </div>

            <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-700">
              <p className="font-semibold mb-1">💡 Tip</p>
              <p className="text-xs text-gray-600">The product image appears as a subtle overlay. Choose a colour that complements it, or go fully custom!</p>
            </div>
          </div>
        )}

        {/* ── Image Tab ── */}
        {tab === 'image' && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-brand-200 rounded-xl p-8 text-center cursor-pointer hover:bg-brand-50 hover:border-brand-400 transition-colors"
            >
              <ImagePlus size={28} className="text-brand-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload your image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF — max 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

            {selectedLayer?.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Size — {selectedLayer.width}px</label>
                  <input type="range" min={40} max={380} value={selectedLayer.width}
                    onChange={e => {
                      const w = Number(e.target.value)
                      const ratio = selectedLayer.height / selectedLayer.width
                      updateSelected({ width: w, height: Math.round(w * ratio) })
                    }}
                    className="w-full accent-brand-700" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Opacity — {Math.round((selectedLayer.opacity ?? 1) * 100)}%</label>
                  <input type="range" min={10} max={100} value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                    onChange={e => updateSelected({ opacity: Number(e.target.value) / 100 })}
                    className="w-full accent-brand-700" />
                </div>
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
              After uploading, click the image on the canvas to select it. Then drag to reposition, or use the size slider above.
            </div>
          </div>
        )}

        {/* ── Toolbar bottom ── */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex gap-2">
            <button onClick={() => { setLayers([]); setSelected(null); setBgColor('#FFFFFF'); setDirty(false) }}
              className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={() => {
              const link = document.createElement('a')
              link.download = `wecustomise-preview.png`
              link.href = getSnapshot()
              link.click()
            }}
              className="btn-ghost flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-lg">
              <Download size={14} /> Save PNG
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={!dirty && layers.length === 0}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            ✨ Add Customised Product to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
