import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar/Topbar'
import styles from './ServicesManager.module.css'
import { apiFetch } from '../../lib/api'

// FIXED: form fields now match the Service model exactly:
//   title (was: name), is_active (was: isActive)
//   price field removed — not in the Service model
//   icon and number fields added to match the model
const EMPTY_FORM = {
  title: '',
  description: '',
  icon: '',
  number: '',
  sort_order: 0,
  is_active: true,
}

export default function ServicesManager() {
  const [services, setServices]       = useState([])
  const [modal, setModal]             = useState(null)  // null | add | edit | delete
  const [activeService, setActiveService] = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [toast, setToast]             = useState('')
  const [loading, setLoading]         = useState(true)
  // FIXED: was `const mounted = true` — now proper state so mount animation works
  const [mounted, setMounted]         = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const rows = await apiFetch('/api/services')
        if (!cancelled) {
          setServices(Array.isArray(rows) ? rows : [])
          setMounted(true)
        }
      } catch (e) {
        console.error('Failed to load services:', e)
        if (!cancelled) setMounted(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, sort_order: services.length + 1 })
    setModal('add')
  }

  // FIXED: openEdit now maps model fields correctly
  const openEdit = (s) => {
    setForm({
      title:       s.title       || '',
      description: s.description || '',
      icon:        s.icon        || '',
      number:      s.number      || '',
      sort_order:  s.sort_order  || 0,
      is_active:   s.is_active   !== undefined ? s.is_active : true,
    })
    setActiveService(s)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setActiveService(null); setForm(EMPTY_FORM) }

  const handleSave = async () => {
    // FIXED: validation uses `title` (the correct model field)
    if (!form.title) return
    const payload = { ...form }
    try {
      if (modal === 'add') {
        const created = await apiFetch('/api/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setServices(prev => [...prev, created])
        showToast('Service created')
      } else {
        const updated = await apiFetch(`/api/services/${activeService._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setServices(prev => prev.map(s => s._id === activeService._id ? updated : s))
        showToast('Service updated')
      }
      closeModal()
    } catch (e) {
      console.error('Save failed:', e)
      showToast('Error saving service')
    }
  }

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/services/${activeService._id}`, { method: 'DELETE' })
      setServices(prev => prev.filter(s => s._id !== activeService._id))
      showToast('Service deleted')
      closeModal()
    } catch (e) {
      console.error('Delete failed:', e)
      showToast('Error deleting service')
    }
  }

  if (loading) return (
    <div style={{ padding: '48px 36px', color: 'rgba(240,234,214,0.4)', fontSize: 13 }}>
      Loading services…
    </div>
  )

  return (
    <>
      <Topbar title="Services Manager" subtitle="Manage services shown on the public Services page" />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Stats ── */}
        <div className={styles.statsStrip}>
          {[
            { label: 'Total Services', value: services.length,                      color: '#c9a227' },
            // FIXED: was s.isActive — now correctly uses s.is_active
            { label: 'Active',         value: services.filter(s => s.is_active).length,  color: '#34d399' },
            { label: 'Hidden',         value: services.filter(s => !s.is_active).length, color: '#6b7280' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard} style={{ '--accent': s.color }}>
              <span className={styles.statIcon} style={{ color: s.color }}>◈</span>
              <div>
                <div className={styles.statNum} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Service
          </button>
        </div>

        {/* ── Services List ── */}
        <div className={styles.servicesList}>
          {services.length === 0 ? (
            <div className={styles.empty}>No services yet. Click "Add Service" to get started.</div>
          ) : (
            // FIXED: render uses s.title and s.is_active (correct model fields)
            services
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((s, idx) => (
              <div
                key={s._id}
                className={`${styles.serviceCard} ${!s.is_active ? styles.inactive : ''}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceName}>
                    {s.icon && <span style={{ marginRight: 8 }}>{s.icon}</span>}
                    {s.title}
                  </div>
                  <div className={styles.serviceMeta}>
                    {s.number && <span className={styles.categoryChip}>#{s.number}</span>}
                    <span
                      className={styles.categoryChip}
                      style={{
                        color: s.is_active ? '#34d399' : '#6b7280',
                        background: s.is_active ? 'rgba(52,211,153,0.1)' : 'rgba(107,114,128,0.1)',
                      }}
                    >
                      {s.is_active ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                  {s.description && <div className={styles.description}>{s.description}</div>}
                </div>
                <div className={styles.serviceActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(s)}>Edit</button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => { setActiveService(s); setModal('delete') }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              {/* FIXED: modal title shows s.title (was s.name) */}
              <span className={styles.modalTitle}>
                {modal === 'add' ? 'Add Service' : `Edit — ${activeService?.title}`}
              </span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* FIXED: all inputs now use the correct model field names */}
                <div className={styles.field}>
                  <label className={styles.label}>Service Title <span className={styles.req}>*</span></label>
                  <input
                    className={styles.input}
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="e.g., Wedding Planning"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Icon (emoji)</label>
                  <input
                    className={styles.input}
                    value={form.icon}
                    onChange={e => setField('icon', e.target.value)}
                    placeholder="e.g., 💍"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Display Number</label>
                  <input
                    className={styles.input}
                    value={form.number}
                    onChange={e => setField('number', e.target.value)}
                    placeholder="e.g., 01"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sort Order</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={form.sort_order}
                    onChange={e => setField('sort_order', parseInt(e.target.value) || 1)}
                    placeholder="e.g., 1"
                  />
                </div>
                <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Visibility</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={e => setField('is_active', e.target.checked)}
                      style={{ accentColor: '#c9a227', width: 16, height: 16 }}
                    />
                    <label
                      htmlFor="is_active"
                      style={{ fontSize: 13, color: 'rgba(240,234,214,0.6)', cursor: 'pointer' }}
                    >
                      Published (visible on public Services page)
                    </label>
                  </div>
                </div>
              </div>
              <div className={styles.field} style={{ marginTop: 16 }}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Brief description of this service…"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              {/* FIXED: disabled check uses form.title (was form.name) */}
              <button
                className={styles.saveBtn}
                style={{ opacity: !form.title ? 0.5 : 1 }}
                onClick={handleSave}
                disabled={!form.title}
              >
                {modal === 'add' ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {modal === 'delete' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>Delete Service?</span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className={styles.deleteBody}>
              <p className={styles.deleteText}>
                {/* FIXED: was activeService?.name — now correctly uses activeService?.title */}
                Delete <strong style={{ color: '#f0ead6' }}>{activeService?.title}</strong>? This cannot be undone.
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
        <span className={styles.toastDot} />{toast}
      </div>
    </>
  )
}