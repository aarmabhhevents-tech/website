import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar/Topbar'
import styles from './Booking.module.css'
import { apiFetch } from '../../lib/api'

// ── Remove mock data ────────────────────────────────────────
// const MOCK_INQUIRIES = [ ... ]
// const MOCK_BOOKINGS = [ ... ]

const PAYMENT_META = {
  pending:  { label:'Pending',       color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
  advance:  { label:'Advance Paid',  color:'#60a5fa', bg:'rgba(96,165,250,0.12)'  },
  paid:     { label:'Fully Paid',    color:'#34d399', bg:'rgba(52,211,153,0.12)'  },
  refunded: { label:'Refunded',      color:'#f87171', bg:'rgba(248,113,113,0.12)' },
}

const EVENT_COLORS = {
  'Wedding':         '#c9a227',
  'Corporate Event': '#60a5fa',
  'Birthday Party':  '#f472b6',
  'Engagement':      '#a78bfa',
  'Anniversary':     '#34d399',
  'Social Gathering':'#fb923c',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const fmtDate  = (iso) => new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
const fmtMoney = (n)   => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—'

const EMPTY_FORM = {
  clientName:'', email:'', phone:'', eventType:'Wedding',
  eventDate:'', budget:'', paymentStatus:'pending', advancePaid:'', notes:'',
}

export default function Bookings() {
  const [bookings, setBookings]     = useState([])
  const [inquiries, setInquiries]   = useState([])
  const [view, setView]             = useState('list')       // list | calendar
  const [modal, setModal]           = useState(null)         // null | add | edit | delete | convert | detail
  const [activeBooking, setActiveBooking] = useState(null)
  const [activeInquiry, setActiveInquiry] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [toast, setToast]           = useState('')
  const mounted = true
  const [calDate, setCalDate]       = useState(new Date(2026, 2)) // March 2026
  const [hoveredDay, setHoveredDay] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [bookingsData, inquiriesData] = await Promise.all([
          apiFetch('/api/bookings'),
          apiFetch('/api/inquiries')
        ])
        if (!cancelled) {
          setBookings(Array.isArray(bookingsData) ? bookingsData : [])
          setInquiries(Array.isArray(inquiriesData) ? inquiriesData : [])
        }
      } catch (e) {
        console.error('Failed to load data:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Open modals ──
  const openAdd = () => { setForm({ ...EMPTY_FORM }); setModal('add') }

  const openEdit = (b) => {
    setForm({ ...b, budget: b.budget || '', advancePaid: b.advancePaid || '' })
    setActiveBooking(b)
    setModal('edit')
  }

  const openDetail = (b) => { setActiveBooking(b); setModal('detail') }

  const openConvert = (inq) => {
    setActiveInquiry(inq)
    setForm({
      clientName: `${inq.firstName} ${inq.lastName}`,
      email: inq.email,
      phone: inq.phone,
      eventType: inq.eventType,
      eventDate: '', budget: '', paymentStatus: 'pending', advancePaid: '', notes: inq.message,
    })
    setModal('convert')
  }

  const closeModal = () => { setModal(null); setActiveBooking(null); setActiveInquiry(null); setForm(EMPTY_FORM) }

  // ── Save ──
  const handleSave = async () => {
    if (!form.clientName || !form.eventDate) return
    const payload = { ...form, budget: Number(form.budget) || 0, advancePaid: Number(form.advancePaid) || 0 }
    try {
      if (modal === 'add' || modal === 'convert') {
        const created = await apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) })
        setBookings(prev => [...prev, created])
        if (modal === 'convert') {
          // Update inquiry status to 'closed'
          await apiFetch(`/api/inquiries/${activeInquiry._id}`, { method: 'PATCH', body: JSON.stringify({ status: 'closed' }) })
          setInquiries(prev => prev.map(i => i._id === activeInquiry._id ? { ...i, status: 'closed' } : i))
        }
        showToast(modal === 'convert' ? 'Inquiry converted to booking' : 'Booking created')
      } else {
        const updated = await apiFetch(`/api/bookings/${activeBooking._id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        setBookings(prev => prev.map(b => b._id === activeBooking._id ? updated : b))
        showToast('Booking updated')
      }
      closeModal()
    } catch (e) {
      console.error('Save failed:', e)
      showToast('Error saving booking')
    }
  }

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/bookings/${activeBooking._id}`, { method: 'DELETE' })
      setBookings(prev => prev.filter(b => b._id !== activeBooking._id))
      showToast('Booking deleted')
      closeModal()
    } catch (e) {
      console.error('Delete failed:', e)
      showToast('Error deleting booking')
    }
  }

  // ── Calendar helpers ──
  const calYear  = calDate.getFullYear()
  const calMonth = calDate.getMonth()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const prevMonth = () => setCalDate(new Date(calYear, calMonth - 1))
  const nextMonth = () => setCalDate(new Date(calYear, calMonth + 1))

  const bookingsThisMonth = bookings.filter(b => {
    const d = new Date(b.eventDate)
    return d.getFullYear() === calYear && d.getMonth() === calMonth
  })

  const inquiriesThisMonth = inquiries.filter(i => {
    const d = new Date(i.createdAt)
    return d.getFullYear() === calYear && d.getMonth() === calMonth
  })

  const getBookingsForDay = (day) =>
    bookings.filter(b => { const d = new Date(b.eventDate); return d.getFullYear()===calYear && d.getMonth()===calMonth && d.getDate()===day })

  const getInquiriesForDay = (day) =>
    inquiries.filter(i => { const d = new Date(i.createdAt); return d.getFullYear()===calYear && d.getMonth()===calMonth && d.getDate()===day })

  const today = new Date()
  const isToday = (day) => today.getDate()===day && today.getMonth()===calMonth && today.getFullYear()===calYear

  // Stats
  const totalRevenue = bookings.reduce((s, b) => s + (b.budget || 0), 0)
  const totalReceived = bookings.reduce((s, b) => s + (b.advancePaid || 0), 0)
  const upcoming = bookings.filter(b => new Date(b.eventDate) >= today).length

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Topbar title="Bookings" subtitle="Manage confirmed bookings and event calendar" />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Stats strip ── */}
        <div className={styles.statsStrip}>
          {[
            { label:'Total Bookings', value: bookings.length,      color:'#c9a227', icon:'◈' },
            { label:'Upcoming',       value: upcoming,             color:'#60a5fa', icon:'☆' },
            { label:'Total Value',    value: fmtMoney(totalRevenue),  color:'#34d399', icon:'₹', small:true },
            { label:'Amount Received',value: fmtMoney(totalReceived), color:'#a78bfa', icon:'✦', small:true },
          ].map((s, i) => (
            <div key={i} className={styles.statCard} style={{ '--accent': s.color }}>
              <span className={styles.statIcon} style={{ color: s.color }}>{s.icon}</span>
              <div>
                <div className={styles.statNum} style={{ color: s.color, fontSize: s.small ? 20 : 28 }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${view==='list' ? styles.viewBtnActive : ''}`} onClick={() => setView('list')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              List
            </button>
            <button className={`${styles.viewBtn} ${view==='calendar' ? styles.viewBtnActive : ''}`} onClick={() => setView('calendar')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Calendar
            </button>
          </div>
          <button className={styles.addBtn} onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Booking
          </button>
        </div>

        {/* ════════════════════════════════════════
            LIST VIEW
        ════════════════════════════════════════ */}
        {view === 'list' && (
          <div className={styles.listWrap}>

            {/* Confirmed bookings */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Confirmed Bookings</span>
                <span className={styles.sectionCount}>{bookings.length}</span>
              </div>
              <div className={styles.bookingList}>
                {bookings.length === 0 ? (
                  <div className={styles.empty}>No bookings yet.</div>
                ) : (
                  [...bookings].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).map((b, idx) => (
                    <div
                      key={b._id}
                      className={styles.bookingCard}
                      style={{ animationDelay:`${idx * 0.05}s` }}
                      onClick={() => openDetail(b)}
                    >
                      {/* Date block */}
                      <div className={styles.dateBlock}>
                        <span className={styles.dateDay}>{new Date(b.eventDate).getDate()}</span>
                        <span className={styles.dateMon}>{MONTHS[new Date(b.eventDate).getMonth()].slice(0,3)}</span>
                        <span className={styles.dateYear}>{new Date(b.eventDate).getFullYear()}</span>
                      </div>

                      {/* Info */}
                      <div className={styles.bookingInfo}>
                        <div className={styles.bookingName}>{b.clientName}</div>
                        <div className={styles.bookingMeta}>
                          <span className={styles.chip} style={{ color: EVENT_COLORS[b.eventType]||'#c9a227', background:`${EVENT_COLORS[b.eventType]||'#c9a227'}18` }}>
                            {b.eventType}
                          </span>
                          <span className={styles.bookingContact}>{b.email}</span>
                        </div>
                        {b.notes && <div className={styles.bookingNotes}>{b.notes.slice(0, 80)}{b.notes.length > 80 ? '…' : ''}</div>}
                      </div>

                      {/* Right side */}
                      <div className={styles.bookingRight}>
                        <span className={styles.payBadge} style={{ color: PAYMENT_META[b.paymentStatus]?.color, background: PAYMENT_META[b.paymentStatus]?.bg }}>
                          <span className={styles.badgeDot} style={{ background: PAYMENT_META[b.paymentStatus]?.color }} />
                          {PAYMENT_META[b.paymentStatus]?.label}
                        </span>
                        <div className={styles.budgetInfo}>
                          <span className={styles.budgetTotal}>{fmtMoney(b.budget)}</span>
                          {b.advancePaid > 0 && <span className={styles.budgetPaid}>↳ {fmtMoney(b.advancePaid)} received</span>}
                        </div>
                        <div className={styles.bookingBtns} onClick={e => e.stopPropagation()}>
                          <button className={styles.editBtn} onClick={() => openEdit(b)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => { setActiveBooking(b); setModal('delete') }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Convert inquiries */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Convert Inquiry to Booking</span>
                <span className={styles.sectionCount}>{inquiries.filter(i => i.status !== 'closed').length} open</span>
              </div>
              <div className={styles.inquiryList}>
                {inquiries.filter(i => i.status !== 'closed').map((inq, idx) => (
                  <div key={inq._id} className={styles.inquiryRow} style={{ animationDelay:`${idx * 0.04}s` }}>
                    <div className={styles.inquiryInfo}>
                      <div className={styles.inquiryName}>{inq.firstName} {inq.lastName}</div>
                      <div className={styles.inquiryMeta}>
                        <span className={styles.chip} style={{ color: EVENT_COLORS[inq.eventType]||'#c9a227', background:`${EVENT_COLORS[inq.eventType]||'#c9a227'}18` }}>
                          {inq.eventType}
                        </span>
                        <span className={styles.inquiryEmail}>{inq.email}</span>
                      </div>
                      <div className={styles.inquiryMsg}>{inq.message.slice(0, 90)}{inq.message.length > 90 ? '…' : ''}</div>
                    </div>
                    <button className={styles.convertBtn} onClick={() => openConvert(inq)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      Confirm Booking
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            CALENDAR VIEW
        ════════════════════════════════════════ */}
        {view === 'calendar' && (
          <div className={styles.calendarWrap}>

            {/* Calendar header */}
            <div className={styles.calHeader}>
              <button className={styles.calNavBtn} onClick={prevMonth}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className={styles.calMonthLabel}>
                {MONTHS[calMonth]} {calYear}
              </div>
              <button className={styles.calNavBtn} onClick={nextMonth}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* Legend */}
            <div className={styles.calLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background:'#c9a227' }} /> Booking
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background:'#60a5fa' }} /> Inquiry Follow-up
              </span>
            </div>

            {/* Day headers */}
            <div className={styles.calGrid}>
              {DAYS.map(d => (
                <div key={d} className={styles.calDayHeader}>{d}</div>
              ))}

              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} className={styles.calCell} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayBookings  = getBookingsForDay(day)
                const dayInquiries = getInquiriesForDay(day)
                const hasEvents    = dayBookings.length > 0 || dayInquiries.length > 0
                const isHov        = hoveredDay === day

                return (
                  <div
                    key={day}
                    className={`${styles.calCell} ${styles.calCellActive} ${isToday(day) ? styles.calCellToday : ''} ${hasEvents ? styles.calCellHasEvents : ''}`}
                    onMouseEnter={() => hasEvents && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span className={styles.calDayNum}>{day}</span>

                    {/* Booking dots */}
                    {dayBookings.slice(0, 2).map(b => (
                      <div
                        key={b._id}
                        className={styles.calEventChip}
                        style={{ background: `${EVENT_COLORS[b.eventType]||'#c9a227'}22`, borderLeft:`2px solid ${EVENT_COLORS[b.eventType]||'#c9a227'}` }}
                        onClick={() => openDetail(b)}
                      >
                        <span className={styles.calEventName}>{b.clientName.split(' ')[0]}</span>
                      </div>
                    ))}

                    {/* Inquiry dots */}
                    {dayInquiries.slice(0, 1).map(inq => (
                      <div
                        key={inq._id}
                        className={styles.calEventChip}
                        style={{ background:'rgba(96,165,250,0.1)', borderLeft:'2px solid #60a5fa' }}
                      >
                        <span className={styles.calEventName} style={{ color:'#60a5fa' }}>{inq.firstName} ↗</span>
                      </div>
                    ))}

                    {/* Overflow */}
                    {(dayBookings.length + dayInquiries.length) > 3 && (
                      <div className={styles.calOverflow}>+{dayBookings.length + dayInquiries.length - 3} more</div>
                    )}

                    {/* Tooltip */}
                    {isHov && hasEvents && (
                      <div className={styles.calTooltip}>
                        {dayBookings.map(b => (
                          <div key={b._id} className={styles.tooltipItem} onClick={() => openDetail(b)}>
                            <span className={styles.tooltipDot} style={{ background: EVENT_COLORS[b.eventType]||'#c9a227' }} />
                            <div>
                              <div className={styles.tooltipName}>{b.clientName}</div>
                              <div className={styles.tooltipSub}>{b.eventType} · {PAYMENT_META[b.paymentStatus]?.label}</div>
                            </div>
                          </div>
                        ))}
                        {dayInquiries.map(inq => (
                          <div key={inq._id} className={styles.tooltipItem}>
                            <span className={styles.tooltipDot} style={{ background:'#60a5fa' }} />
                            <div>
                              <div className={styles.tooltipName}>{inq.firstName} {inq.lastName}</div>
                              <div className={styles.tooltipSub}>{inq.eventType} · Inquiry follow-up</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Month summary */}
            <div className={styles.calSummary}>
              <div className={styles.calSummaryItem}>
                <span className={styles.calSummaryNum} style={{ color:'#c9a227' }}>{bookingsThisMonth.length}</span>
                <span className={styles.calSummaryLabel}>Bookings this month</span>
              </div>
              <div className={styles.calSummaryDivider} />
              <div className={styles.calSummaryItem}>
                <span className={styles.calSummaryNum} style={{ color:'#60a5fa' }}>{inquiriesThisMonth.length}</span>
                <span className={styles.calSummaryLabel}>Inquiry follow-ups</span>
              </div>
              <div className={styles.calSummaryDivider} />
              <div className={styles.calSummaryItem}>
                <span className={styles.calSummaryNum} style={{ color:'#34d399' }}>
                  {fmtMoney(bookingsThisMonth.reduce((s, b) => s + (b.budget||0), 0))}
                </span>
                <span className={styles.calSummaryLabel}>Month value</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          BOOKING DETAIL DRAWER
      ════════════════════════════════════════ */}
      {modal === 'detail' && activeBooking && (
        <>
          <div className={styles.overlay} onClick={closeModal} />
          <aside className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerName}>{activeBooking.clientName}</div>
                <span className={styles.chip} style={{ color: EVENT_COLORS[activeBooking.eventType]||'#c9a227', background:`${EVENT_COLORS[activeBooking.eventType]||'#c9a227'}18`, display:'inline-block', marginTop:6 }}>
                  {activeBooking.eventType}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.detailGrid}>
                {[
                  { label:'Event Date',    val: fmtDate(activeBooking.eventDate) },
                  { label:'Payment',       val: <span className={styles.payBadge} style={{ color: PAYMENT_META[activeBooking.paymentStatus]?.color, background: PAYMENT_META[activeBooking.paymentStatus]?.bg }}><span className={styles.badgeDot} style={{ background: PAYMENT_META[activeBooking.paymentStatus]?.color }}/>{PAYMENT_META[activeBooking.paymentStatus]?.label}</span> },
                  { label:'Total Budget',  val: fmtMoney(activeBooking.budget) },
                  { label:'Advance Paid',  val: fmtMoney(activeBooking.advancePaid) },
                  { label:'Email',         val: <a className={styles.detailLink} href={`mailto:${activeBooking.email}`}>{activeBooking.email}</a> },
                  { label:'Phone',         val: <a className={styles.detailLink} href={`tel:${activeBooking.phone}`}>{activeBooking.phone}</a> },
                ].map(({ label, val }) => (
                  <div key={label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{label}</span>
                    <span className={styles.detailVal}>{val}</span>
                  </div>
                ))}
              </div>
              {activeBooking.notes && (
                <div className={styles.drawerSection}>
                  <span className={styles.sectionLabel}>Notes / Brief</span>
                  <div className={styles.notesBox}>{activeBooking.notes}</div>
                </div>
              )}
              <div className={styles.drawerActions}>
                <button className={styles.drawerEditBtn} onClick={() => { closeModal(); setTimeout(() => openEdit(activeBooking), 50) }}>Edit Booking</button>
                <button className={styles.drawerDeleteBtn} onClick={() => { setModal('delete') }}>Delete</button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ════════════════════════════════════════
          ADD / EDIT / CONVERT MODAL
      ════════════════════════════════════════ */}
      {(modal === 'add' || modal === 'edit' || modal === 'convert') && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {modal === 'add' ? 'New Booking' : modal === 'convert' ? `Convert Inquiry — ${activeInquiry?.firstName} ${activeInquiry?.lastName}` : `Edit — ${activeBooking?.clientName}`}
              </span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Client Name <span className={styles.req}>*</span></label>
                  <input className={styles.input} value={form.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="Full name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Event Type</label>
                  <select className={styles.select} value={form.eventType} onChange={e => setField('eventType', e.target.value)}>
                    {Object.keys(EVENT_COLORS).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="client@email.com" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone</label>
                  <input className={styles.input} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Event Date <span className={styles.req}>*</span></label>
                  <input className={styles.input} type="date" value={form.eventDate} onChange={e => setField('eventDate', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Payment Status</label>
                  <select className={styles.select} value={form.paymentStatus} onChange={e => setField('paymentStatus', e.target.value)}>
                    {Object.entries(PAYMENT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Total Budget (₹)</label>
                  <input className={styles.input} type="number" value={form.budget} onChange={e => setField('budget', e.target.value)} placeholder="e.g. 250000" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Advance Received (₹)</label>
                  <input className={styles.input} type="number" value={form.advancePaid} onChange={e => setField('advancePaid', e.target.value)} placeholder="e.g. 50000" />
                </div>
              </div>
              <div className={styles.field} style={{ marginTop:16 }}>
                <label className={styles.label}>Notes / Brief</label>
                <textarea className={styles.textarea} rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Event brief, special requirements, venue details…" />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.saveBtn} style={{ opacity:(!form.clientName||!form.eventDate)?0.5:1 }} onClick={handleSave}>
                {modal === 'convert' ? 'Confirm Booking' : modal === 'add' ? 'Create Booking' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {modal === 'delete' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>Delete Booking?</span>
              <button className={styles.closeBtn} onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.deleteBody}>
              <p className={styles.deleteText}>
                Delete booking for <strong style={{ color:'#f0ead6' }}>{activeBooking?.clientName}</strong>? This cannot be undone.
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