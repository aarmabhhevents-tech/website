import { useEffect, useMemo, useState } from 'react'
import Topbar from '../../components/Topbar/Topbar.jsx'
import styles from './Inquiries.module.css'
import { apiFetch } from '../../lib/api'

const STATUS_META = {
  new:       { label:"New",       color:"#c9a227", bg:"rgba(201,162,39,0.12)"  },
  contacted: { label:"Contacted", color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  closed:    { label:"Closed",    color:"#6b7280", bg:"rgba(107,114,128,0.12)" },
}

const EVENT_COLORS = {
  "Wedding":          "#c9a227",
  "Corporate Event":  "#60a5fa",
  "Birthday Party":   "#f472b6",
  "Engagement":       "#a78bfa",
  "Anniversary":      "#34d399",
  "Social Gathering": "#fb923c",
}

const fmt     = (iso) => new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })

const FILTERS = ['all', 'new', 'contacted', 'closed']

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [notes, setNotes]         = useState('')
  const [toast, setToast]         = useState('')
  const [mounted, setMounted]     = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const rows = await apiFetch('/api/inquiries')
        if (!cancelled) setInquiries(Array.isArray(rows) ? rows : [])
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load inquiries')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setMounted(true)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered = useMemo(() => {
    return inquiries
      .filter((i) => {
        const matchStatus = filter === 'all' || i.status === filter
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.eventType.toLowerCase().includes(q) ||
          i.phone.includes(q)
        return matchStatus && matchSearch
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [inquiries, filter, search])

  const openDrawer = (inq) => {
    setSelected(inq)
    setNotes(inq.notes || '')
    setNotesSaved(false)
  }

  const closeDrawer = () => {
    setSelected(null)
    setNotes('')
  }

  const updateStatus = (id, status) => {
    ;(async () => {
      try {
        const updated = await apiFetch(`/api/inquiries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        setInquiries((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
        setSelected((prev) => (prev && prev._id === updated._id ? updated : prev))
        showToast(`Status updated to ${STATUS_META[status].label}`)
      } catch (e) {
        showToast(e.message || 'Failed to update status')
      }
    })()
  }

  const saveNotes = () => {
    if (!selected?._id) return
    ;(async () => {
      try {
        const updated = await apiFetch(`/api/inquiries/${selected._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        })
        setInquiries((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
        setSelected(updated)
        setNotesSaved(true)
        showToast('Notes saved')
      } catch (e) {
        showToast(e.message || 'Failed to save notes')
      }
    })()
  }

  const counts = useMemo(() => {
    return FILTERS.reduce((acc, f) => {
      acc[f] = f === 'all' ? inquiries.length : inquiries.filter((i) => i.status === f).length
      return acc
    }, {})
  }, [inquiries])

  return (
    <>
      <Topbar
        title="Inquiries"
        subtitle="Manage and respond to client inquiries"
      />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                onClick={() => setFilter(f)}
              >
                <span
                  className={styles.filterDot}
                  style={{
                    background: f === 'all' ? '#c9a227' : STATUS_META[f].color,
                    opacity: filter === f ? 1 : 0.4,
                  }}
                />
                {f === 'all' ? 'All' : STATUS_META[f].label}
                <span className={styles.filterCount}>{counts[f]}</span>
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search name, email, type, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* ── Results info ── */}
        <div className={styles.resultsMeta}>
          {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'inquiry' : 'inquiries'}`}
          {search && ` matching "${search}"`}
          {filter !== 'all' && ` · ${STATUS_META[filter].label}`}
        </div>

        {loadError && (
          <div className={styles.resultsMeta} style={{ color: '#ef4444' }}>
            {loadError}
          </div>
        )}

        {/* ── Table ── */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Name & Contact', 'Event Type', 'Received', 'Status', ''].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    <div className={styles.emptyIcon}>◈</div>
                    <div>No inquiries found.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((inq, idx) => (
                  <tr
                    key={inq._id}
                    className={`${styles.tr} ${selected?._id === inq._id ? styles.trSelected : ''}`}
                    style={{ animationDelay: `${idx * 0.04}s` }}
                    onClick={() => openDrawer(inq)}
                  >
                    <td className={styles.td}>
                      <div className={styles.tdName}>
                        {inq.firstName} {inq.lastName}
                        {inq.status === 'new' && <span className={styles.newDot} />}
                      </div>
                      <div className={styles.tdSub}>{inq.email}</div>
                      <div className={styles.tdSub}>{inq.phone}</div>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.chip}
                        style={{
                          color: EVENT_COLORS[inq.eventType] || '#c9a227',
                          background: `${EVENT_COLORS[inq.eventType] || '#c9a227'}18`,
                        }}
                      >
                        {inq.eventType}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.tdDate}>{fmt(inq.createdAt)}</div>
                      <div className={styles.tdTime}>{fmtTime(inq.createdAt)}</div>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.badge}
                        style={{
                          color: STATUS_META[inq.status].color,
                          background: STATUS_META[inq.status].bg,
                        }}
                      >
                        <span
                          className={styles.badgeDot}
                          style={{ background: STATUS_META[inq.status].color }}
                        />
                        {STATUS_META[inq.status].label}
                      </span>
                    </td>
                    <td className={styles.td} onClick={e => e.stopPropagation()}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => openDrawer(inq)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <>
          <div className={styles.overlay} onClick={closeDrawer} />
          <aside className={styles.drawer}>

            {/* Drawer header */}
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerName}>
                  {selected.firstName} {selected.lastName}
                </div>
                <span
                  className={styles.chip}
                  style={{
                    color: EVENT_COLORS[selected.eventType] || '#c9a227',
                    background: `${EVENT_COLORS[selected.eventType] || '#c9a227'}18`,
                    marginTop: 6,
                    display: 'inline-block',
                  }}
                >
                  {selected.eventType}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={closeDrawer}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Drawer body */}
            <div className={styles.drawerBody}>

              {/* Contact details */}
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <a className={styles.detailLink} href={`mailto:${selected.email}`}>
                    {selected.email}
                  </a>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <a className={styles.detailLink} href={`tel:${selected.phone}`}>
                    {selected.phone}
                  </a>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Received</span>
                  <span className={styles.detailValue}>
                    {fmt(selected.createdAt)} at {fmtTime(selected.createdAt)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Current Status</span>
                  <span
                    className={styles.badge}
                    style={{
                      color: STATUS_META[selected.status].color,
                      background: STATUS_META[selected.status].bg,
                    }}
                  >
                    <span className={styles.badgeDot} style={{ background: STATUS_META[selected.status].color }} />
                    {STATUS_META[selected.status].label}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Message</span>
                <div className={styles.messageBox}>{selected.message}</div>
              </div>

              {/* Quick reply buttons */}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Quick Actions</span>
                <div className={styles.quickActions}>
                  <a
                    href={`mailto:${selected.email}?subject=Re: Your Event Inquiry — Aarambhh Events`}
                    className={styles.quickBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Reply via Email
                  </a>
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=Hi ${selected.firstName}, thank you for reaching out to Aarambhh Events!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.quickBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Update status */}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Update Status</span>
                <div className={styles.statusToggleRow}>
                  {['new', 'contacted', 'closed'].map(st => (
                    <button
                      key={st}
                      className={`${styles.statusToggle} ${selected.status === st ? styles.statusToggleActive : ''}`}
                      style={selected.status === st ? {
                        borderColor: STATUS_META[st].color,
                        background: STATUS_META[st].bg,
                        color: STATUS_META[st].color,
                      } : {}}
                      onClick={() => updateStatus(selected._id, st)}


>
                      <span
                        className={styles.badgeDot}
                        style={{ background: selected.status === st ? STATUS_META[st].color : 'rgba(240,234,214,0.25)' }}
                      />
                      {STATUS_META[st].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal notes */}
              <div className={styles.section}>
                <div className={styles.noteHeader}>
                  <span className={styles.sectionLabel}>Internal Notes</span>
                  {notesSaved && (
                    <span className={styles.savedTag}>✓ Saved</span>
                  )}
                </div>
                <textarea
                  className={styles.notesArea}
                  value={notes}
                  onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
                  placeholder="Add private notes about this inquiry…"
                  rows={4}
                />
                <button className={styles.saveNotesBtn} onClick={saveNotes}>
                  Save Notes
                </button>
              </div>

            </div>
          </aside>
        </>
      )}

      {/* ── Toast ── */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        <span className={styles.toastDot} />
        {toast}
      </div>
    </>
  )
}