import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar/Topbar'
import styles from './EventsManager.module.css'
import { apiFetch } from '../../lib/api'

const EMPTY_FORM = {
  category: '',
  tag: '',
  headline: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
}

export default function EventsManager() {
  const [events, setEvents]         = useState([])
  const [modal, setModal]           = useState(null)   // null | 'edit' | 'add' | 'delete'
  const [activeEvent, setActiveEvent] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [toast, setToast]           = useState('')
  const [mounted, setMounted]       = useState(false)
  const [previewImg, setPreviewImg] = useState(true)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await apiFetch('/api/events')
        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : [])
          setMounted(true)
        }
      } catch (e) {
        console.error('Failed to load events:', e)
        if (!cancelled) setMounted(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, sort_order: events.length + 1 })
    setPreviewImg(true)
    setModal('add')
  }

  const openEdit = (ev) => {
    setForm({ ...ev })
    setActiveEvent(ev)
    setPreviewImg(true)
    setModal('edit')
  }

  const openDelete = (ev) => {
    setActiveEvent(ev)
    setModal('delete')
  }

  const closeModal = () => {
    setModal(null)
    setActiveEvent(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.category || !form.headline) return
    try {
      if (modal === 'add') {
        const payload = { ...form, sort_order: events.length + 1 }
        const created = await apiFetch('/api/events', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setEvents(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order))
        showToast('Event added successfully')
      } else {
        const updated = await apiFetch(`/api/events/${activeEvent._id}`, {
          method: 'PATCH',
          body: JSON.stringify(form)
        })
        setEvents(prev => prev.map(e => e._id === activeEvent._id ? updated : e))
        showToast('Event updated successfully')
      }
      closeModal()
    } catch (e) {
      console.error('Save failed:', e)
      showToast('Error saving event')
    }
  }

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/events/${activeEvent._id}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e._id !== activeEvent._id))
      showToast('Event deleted')
      closeModal()
    } catch (e) {
      console.error('Delete failed:', e)
      showToast('Error deleting event')
    }
  }

  const toggleActive = async (id) => {
    const event = events.find(e => e._id === id)
    if (!event) return
    try {
      const updated = await apiFetch(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !event.is_active })
      })
      setEvents(prev => prev.map(e => e._id === id ? updated : e))
    } catch (e) {
      console.error('Toggle failed:', e)
      showToast('Error updating event')
    }
  }

  const moveOrder = async (id, dir) => {
    const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(e => e._id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const event1 = sorted[idx]
    const event2 = sorted[swapIdx]
    const tempOrder = event1.sort_order

    try {
      // Update both events
      const [updated1, updated2] = await Promise.all([
        apiFetch(`/api/events/${event1._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sort_order: event2.sort_order })
        }),
        apiFetch(`/api/events/${event2._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sort_order: tempOrder })
        })
      ])

      setEvents(prev => prev.map(e => {
        if (e._id === updated1._id) return updated1
        if (e._id === updated2._id) return updated2
        return e
      }))
    } catch (e) {
      console.error('Move failed:', e)
      showToast('Error updating order')
    }
  }

  const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order)
  const activeCount   = events.filter(e => e.is_active).length
  const inactiveCount = events.filter(e => !e.is_active).length

  return (
    <>
      <Topbar
        title="Events Manager"
        subtitle="Manage event categories shown on the public Events page"
      />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Stats strip ── */}
        <div className={styles.statsStrip}>
          {[
            { label:'Total Events',    value: events.length,  color:'#c9a227', icon:'☆' },
            { label:'Published',       value: activeCount,    color:'#34d399', icon:'✦' },
            { label:'Hidden',          value: inactiveCount,  color:'#6b7280', icon:'○' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard} style={{ '--accent': s.color }}>
              <div className={styles.statIcon} style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div className={styles.statNum} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add New Event
          </button>
        </div>

        {/* ── Event cards ── */}
        <div className={styles.eventList}>
          {sorted.map((ev, idx) => (
            <div
              key={ev._id}
              className={`${styles.eventCard} ${!ev.is_active ? styles.eventCardHidden : ''}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Thumbnail */}
              <div className={styles.thumb}>
                <img src={ev.image_url} alt={ev.category} className={styles.thumbImg} />
                {!ev.is_active && (
                  <div className={styles.hiddenOverlay}>Hidden</div>
                )}
              </div>

              {/* Info */}
              <div className={styles.eventInfo}>
                <div className={styles.eventTop}>
                  <span className={styles.eventTag}>{ev.tag}</span>
                  <span className={styles.orderBadge}>#{ev.sort_order}</span>
                </div>
                <div className={styles.eventCategory}>{ev.category}</div>
                <div className={styles.eventHeadline}>{ev.headline}</div>
                <div className={styles.eventDesc}>{ev.description}</div>
              </div>

              {/* Actions */}
              <div className={styles.eventActions}>
                {/* Visibility toggle */}
                <div className={styles.toggleWrap}>
                  <span className={styles.toggleLabel}>
                    {ev.is_active ? 'Published' : 'Hidden'}
                  </span>
                  <div
                    className={`${styles.toggle} ${ev.is_active ? styles.toggleOn : ''}`}
                    onClick={() => toggleActive(ev.id)}
                  >
                    <div className={styles.toggleThumb} />
                  </div>
                </div>

                {/* Order arrows */}
                <div className={styles.orderBtns}>
                  <button
                    className={styles.orderBtn}
                    onClick={() => moveOrder(ev.id, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </button>
                  <button
                    className={styles.orderBtn}
                    onClick={() => moveOrder(ev.id, 1)}
                    disabled={idx === sorted.length - 1}
                    title="Move down"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>

                <div className={styles.actionBtns}>
                  <button className={styles.editBtn} onClick={() => openEdit(ev)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => openDelete(ev)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {modal === 'add' ? 'Add New Event' : `Edit — ${activeEvent?.category}`}
              </span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>

                {/* Left — form fields */}
                <div className={styles.formFields}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Category Name <span className={styles.req}>*</span></label>
                      <input
                        className={styles.input}
                        placeholder="e.g. Weddings"
                        value={form.category}
                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Tag / Label</label>
                      <input
                        className={styles.input}
                        placeholder="e.g. Most Popular"
                        value={form.tag}
                        onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Headline <span className={styles.req}>*</span></label>
                    <input
                      className={styles.input}
                      placeholder="e.g. Where Two Souls Begin Their Forever"
                      value={form.headline}
                      onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Short description of this event type…"
                      value={form.description}
                      onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Sort Order</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="1"
                        value={form.sort_order}
                        onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Visibility</label>
                      <div className={styles.visibilityRow}>
                        <div
                          className={`${styles.toggle} ${form.is_active ? styles.toggleOn : ''}`}
                          onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                        >
                          <div className={styles.toggleThumb} />
                        </div>
                        <span className={styles.visLabel}>
                          {form.is_active ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — image */}
                <div className={styles.formImage}>
                  <label className={styles.label}>Cover Image URL</label>
                  <input
                    className={styles.input}
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={e => { setForm(p => ({ ...p, image_url: e.target.value })); setPreviewImg(true) }}
                  />
                  {form.image_url && previewImg ? (
                    <img
                      src={form.image_url}
                      alt=""
                      className={styles.imgPreview}
                      onError={() => setPreviewImg(false)}
                    />
                  ) : (
                    <div className={styles.imgPlaceholder}>
                      <span>No image</span>
                    </div>
                  )}
                  <p className={styles.imgHint}>
                    Paste an Unsplash URL or your Supabase Storage URL
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button
                className={styles.saveBtn}
                style={{ opacity: (!form.category || !form.headline) ? 0.5 : 1 }}
                onClick={handleSave}
              >
                {modal === 'add' ? 'Add Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {modal === 'delete' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>Delete Event?</span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className={styles.deleteBody}>
              <p className={styles.deleteText}>
                You're about to delete <strong style={{ color:'#f0ead6' }}>{activeEvent?.category}</strong>. This will remove it from the public Events page and cannot be undone.
              </p>
              <div className={styles.deleteActions}>
                <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Yes, Delete</button>
                <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        <span className={styles.toastDot} />
        {toast}
      </div>
    </>
  )
}