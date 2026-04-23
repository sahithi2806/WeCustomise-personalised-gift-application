import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Gift, Mail, Phone, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const initialForm = {
  occasion: '',
  scheduledDate: '',
  recipientName: '',
  recipientEmail: '',
  recipientPhone: '',
  message: '',
}

function getDaysUntil(dateString) {
  const today = new Date()
  const target = new Date(dateString)
  const diff = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Gifts() {
  const [form, setForm] = useState(initialForm)
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadGifts = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/gifts')
        setGifts(data.gifts)
      } catch (error) {
        toast.error(error.response?.data?.error || 'Could not load your gift reminders.')
      } finally {
        setLoading(false)
      }
    }

    loadGifts()
  }, [])

  const upcomingCount = useMemo(
    () => gifts.filter((gift) => !gift.sent).length,
    [gifts]
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/gifts', form)
      setGifts((current) =>
        [...current, data.gift].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
      )
      setForm(initialForm)
      toast.success(data.message || 'Gift reminder scheduled.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not schedule your gift reminder.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
        <section className="space-y-6">
          <div className="rounded-[28px] overflow-hidden border border-brand-100 bg-[radial-gradient(circle_at_top_left,_rgba(31,78,121,0.16),_transparent_38%),linear-gradient(135deg,#f8fbff_0%,#eef6ff_45%,#fff7e8_100%)] p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
                <Gift className="text-brand-700" size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-700">Gift Scheduler</p>
                <h1 className="text-3xl font-bold text-gray-900">Plan the next thoughtful delivery</h1>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl leading-relaxed">
              Save important dates for birthdays, anniversaries, and surprises. WeCustomise stores the reminder details so you can come back and shop right on time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-2xl bg-white/75 backdrop-blur px-5 py-4 border border-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                <p className="text-sm text-gray-500 mt-1">Active reminders</p>
              </div>
              <div className="rounded-2xl bg-white/75 backdrop-blur px-5 py-4 border border-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Channels</p>
                <p className="text-2xl font-bold text-gray-900">Email / SMS</p>
                <p className="text-sm text-gray-500 mt-1">Saved for future reminders</p>
              </div>
              <div className="rounded-2xl bg-white/75 backdrop-blur px-5 py-4 border border-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Best for</p>
                <p className="text-2xl font-bold text-gray-900">Birthdays</p>
                <p className="text-sm text-gray-500 mt-1">Anniversaries and festivals too</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Sparkles size={18} className="text-brand-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Reminder</h2>
                <p className="text-sm text-gray-500">Add enough detail so you can act on it later without digging around.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className="input" placeholder="Occasion" value={form.occasion} onChange={(e) => updateField('occasion', e.target.value)} required />
              <input className="input" placeholder="Recipient name" value={form.recipientName} onChange={(e) => updateField('recipientName', e.target.value)} required />
              <input className="input" type="date" value={form.scheduledDate} onChange={(e) => updateField('scheduledDate', e.target.value)} required />
              <input className="input" placeholder="Recipient email" value={form.recipientEmail} onChange={(e) => updateField('recipientEmail', e.target.value)} />
              <input className="input sm:col-span-2" placeholder="Recipient phone" value={form.recipientPhone} onChange={(e) => updateField('recipientPhone', e.target.value)} />
              <textarea
                className="input sm:col-span-2 min-h-28 resize-none"
                placeholder="Optional message or shopping note"
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">Provide at least one contact method so the reminder has somewhere to go later.</p>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Scheduling...' : 'Schedule Gift'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saved Reminders</h2>
              <p className="text-sm text-gray-500">Your upcoming gift occasions, ordered by date.</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 rounded-3xl bg-gray-200" />
              ))}
            </div>
          ) : gifts.length === 0 ? (
            <div className="card p-8 text-center">
              <CalendarDays className="mx-auto text-brand-400 mb-4" size={28} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
              <p className="text-sm text-gray-500">Your saved occasions will appear here once you schedule the first one.</p>
            </div>
          ) : (
            gifts.map((gift) => {
              const daysUntil = getDaysUntil(gift.scheduledDate)
              const dueLabel =
                daysUntil === 0 ? 'Today' :
                daysUntil === 1 ? 'Tomorrow' :
                daysUntil > 1 ? `In ${daysUntil} days` :
                `${Math.abs(daysUntil)} days ago`

              return (
                <article key={gift.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 mb-3">
                        <Gift size={12} />
                        {gift.occasion}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{gift.recipientName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(gift.scheduledDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })} | {dueLabel}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold rounded-full px-3 py-1 ${gift.sent ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {gift.sent ? 'Sent' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-gray-500 mb-1 flex items-center gap-2"><Mail size={14} /> Email</p>
                      <p className="font-medium text-gray-900">{gift.recipientEmail || 'Not provided'}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-gray-500 mb-1 flex items-center gap-2"><Phone size={14} /> Phone</p>
                      <p className="font-medium text-gray-900">{gift.recipientPhone || 'Not provided'}</p>
                    </div>
                  </div>

                  {gift.message && (
                    <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-500 mb-2">Message</p>
                      <p className="text-sm text-gray-700">{gift.message}</p>
                    </div>
                  )}
                </article>
              )
            })
          )}
        </section>
      </div>
    </div>
  )
}
