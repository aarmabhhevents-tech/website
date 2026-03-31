import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../../components/Topbar/Topbar'
import styles from './Dashboard.module.css'
import { apiFetch } from '../../lib/api'

// ── Remove mock data ────────────────────────────────────────
// const MOCK_INQUIRIES = [ ... ]

const STATUS_META = {
  new:       { label:"New",       color:"#c9a227", bg:"rgba(201,162,39,0.12)"  },
  contacted: { label:"Contacted", color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  closed:    { label:"Closed",    color:"#6b7280", bg:"rgba(107,114,128,0.12)" },
}

const EVENT_COLORS = {
  "Wedding":         "#c9a227",
  "Corporate Event": "#60a5fa",
  "Birthday Party":  "#f472b6",
  "Engagement":      "#a78bfa",
  "Anniversary":     "#34d399",
  "Social Gathering":"#fb923c",
}

const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', {
  day:'numeric', month:'short', year:'numeric'
})

export default function Dashboard() {
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const mounted = true

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const rows = await apiFetch('/api/inquiries')
        if (!cancelled) setInquiries(Array.isArray(rows) ? rows : [])
      } catch (e) {
        console.error('Failed to load inquiries:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const counts = {
    total:     inquiries.length,
    new:       inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    closed:    inquiries.filter(i => i.status === 'closed').length,
  }

  const recent = [...inquiries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const byType = inquiries.reduce((acc, i) => {
    acc[i.eventType] = (acc[i.eventType] || 0) + 1
    return acc
  }, {})

  const today = new Date().toLocaleDateString('en-IN', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  })

  return (
    <>
      <Topbar title="Dashboard" subtitle={today} />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Stat cards ── */}
        <div className={styles.statGrid}>
          {[
            { label:"Total Inquiries", value: counts.total,     sub:"All time",          accent:"#c9a227", icon:"◈" },
            { label:"New",             value: counts.new,       sub:"Awaiting response", accent:"#c9a227", icon:"✦" },
            { label:"Contacted",       value: counts.contacted, sub:"In progress",       accent:"#60a5fa", icon:"◇" },
            { label:"Closed",          value: counts.closed,    sub:"Completed",         accent:"#6b7280", icon:"○" },
          ].map((card, i) => (
            <div
              key={i}
              className={styles.statCard}
              style={{ '--accent': card.accent, animationDelay:`${i * 0.07}s` }}
            >
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{card.label}</span>
                <span className={styles.statIcon} style={{ color: card.accent }}>{card.icon}</span>
              </div>
              <div className={styles.statValue} style={{ color: card.accent }}>{card.value}</div>
              <div className={styles.statSub}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Body grid ── */}
        <div className={styles.bodyGrid}>

          {/* Recent inquiries table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Recent Inquiries</span>
              <button className={styles.cardAction} onClick={() => navigate('/admin/inquiries')}>
                View all
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Name', 'Event Type', 'Date', 'Status'].map(h => (
                      <th key={h} className={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className={styles.td} style={{ textAlign: 'center' }}>Loading…</td>
                    </tr>
                  ) : recent.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.td} style={{ textAlign: 'center' }}>No inquiries yet.</td>
                    </tr>
                  ) : (
                    recent.map(inq => (
                      <tr
                        key={inq._id}
                        className={styles.tr}
                        onClick={() => navigate('/admin/inquiries')}
                      >
                        <td className={styles.td}>
                          <span className={styles.tdName}>{inq.firstName} {inq.lastName}</span>
                          <span className={styles.tdSub}>{inq.email}</span>
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
                          <span className={styles.tdDate}>{fmt(inq.createdAt)}</span>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status summary donut-style */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Status Overview</span>
            </div>
            <div className={styles.statusBody}>
              {['new', 'contacted', 'closed'].map(st => (
                <div key={st} className={styles.statusRow}>
                  <div className={styles.statusLeft}>
                    <span
                      className={styles.statusDot}
                      style={{ background: STATUS_META[st].color }}
                    />
                    <span className={styles.statusLabel}>{STATUS_META[st].label}</span>
                  </div>
                  <div className={styles.statusRight}>
                    <span
                      className={styles.statusCount}
                      style={{ color: STATUS_META[st].color }}
                    >
                      {counts[st]}
                    </span>
                    <div className={styles.statusTrackWrap}>
                      <div
                        className={styles.statusTrack}
                        style={{
                          width: counts.total ? `${(counts[st] / counts.total) * 100}%` : '0%',
                          background: STATUS_META[st].color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By event type */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Inquiries by Type</span>
            </div>
            <div className={styles.chartBody}>
              {Object.entries(byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className={styles.chartRow}>
                    <div className={styles.chartMeta}>
                      <span className={styles.chartLabel}>{type}</span>
                      <span
                        className={styles.chartCount}
                        style={{ color: EVENT_COLORS[type] || '#c9a227' }}
                      >
                        {count}
                      </span>
                    </div>
                    <div className={styles.trackWrap}>
                      <div
                        className={styles.track}
                        style={{
                          width: `${(count / counts.total) * 100}%`,
                          background: EVENT_COLORS[type] || '#c9a227',
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* ── Quick actions ── */}
        <div className={styles.quickActions}>
          {[
            { label:"View All Inquiries", icon:"💬", to:"/admin/inquiries"  },
            { label:"Manage Gallery",     icon:"🖼",  to:"/admin/gallery"   },
            { label:"Edit Services",      icon:"◈",  to:"/admin/services"  },
            { label:"Site Settings",      icon:"⚙",  to:"/admin/settings"  },
          ].map((a, i) => (
            <button
              key={i}
              className={styles.quickBtn}
              onClick={() => navigate(a.to)}
            >
              <span className={styles.quickIcon}>{a.icon}</span>
              <span className={styles.quickLabel}>{a.label}</span>
              <svg className={styles.quickArrow} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>

      </div>
    </>
  )
}