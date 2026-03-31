import { useState, useEffect } from 'react'
import Topbar from '../../components/Topbar/Topbar'
import styles from './Settings.module.css'
import { apiFetch } from '../../lib/api'

// ── Initial Data ───────────────────────────────────────────
const INITIAL = {
  contact: {
    email:    'hello@aarambhhevents.com',
    phone:    '+91 95991 29634',
    phoneTel: '+919599129634',
    address:  'New Delhi, India',
  },
  social: {
    instagram: 'aarambhhevents',
    facebook:  'aarambhhevents',
    whatsapp:  '+919599129634',
  },
  branding: {
    founderName:  'Akshit Malhotra',
    tagline:      'Every celebration marks a new beginning.',
    aboutShort:   'Aarambhh Events is a full-service event management company built on the idea of being a reliable bridge between clients and event partners.',
  },
  seo: {
    metaTitle:       'Aarambhh Events — Premium Event Planning, Delhi',
    metaDescription: 'Aarambhh Events offers full-service event planning and vendor coordination for weddings, corporate events, birthdays, and more across India.',
    keywords:        'event planning delhi, wedding planner india, corporate events, aarambhh events',
  },
}

const TABS = [
  {
    id: 'contact',
    label: 'Contact Info',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.89a16 16 0 0 0 6.29 6.29l1.67-1.67a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    id: 'social',
    label: 'Social Links',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
      </svg>
    ),
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'seo',
    label: 'SEO & Meta',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
]

// ── Reusable field ─────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

// ── Reusable card ──────────────────────────────────────────
function Card({ icon, title, desc, children, onSave, onReset, saving }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <div>
          <div className={styles.cardTitle}>{title}</div>
          {desc && <div className={styles.cardDesc}>{desc}</div>}
        </div>
      </div>
      <div className={styles.cardBody}>{children}</div>
      <div className={styles.cardFooter}>
        <button className={styles.resetBtn} onClick={onReset}>Reset</button>
        <button
          className={`${styles.saveBtn} ${saving ? styles.saveBtnBusy : ''}`}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            'Saving…'
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const [tab, setTab]         = useState('contact')
  const [data, setData]       = useState(INITIAL)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const settings = await apiFetch('/api/settings')
        if (!cancelled && settings) {
          setData({
            contact: settings.contact || INITIAL.contact,
            social: settings.social || INITIAL.social,
            branding: settings.branding || INITIAL.branding,
            seo: settings.seo || INITIAL.seo,
          })
        }
        if (!cancelled) setMounted(true)
      } catch (e) {
        console.error('Failed to load settings:', e)
        if (!cancelled) setMounted(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const update = (section, key, val) =>
    setData(prev => ({ ...prev, [section]: { ...prev[section], [key]: val } }))

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        contact: data.contact,
        social: data.social,
        branding: data.branding,
        seo: data.seo,
      }
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      setSaving(false)
      showToast('Settings saved successfully')
    } catch (e) {
      console.error('Save failed:', e)
      setSaving(false)
      showToast('Error saving settings')
    }
  }

  const handleReset = async () => {
    try {
      const settings = await apiFetch('/api/settings')
      if (settings) {
        setData({
          contact: settings.contact || INITIAL.contact,
          social: settings.social || INITIAL.social,
          branding: settings.branding || INITIAL.branding,
          seo: settings.seo || INITIAL.seo,
        })
        showToast('Settings reset to saved version')
      } else {
        setData(INITIAL)
        showToast('Settings reset to defaults')
      }
    } catch (e) {
      setData(INITIAL)
      showToast('Settings reset to defaults')
    }
  }

  const titleOver = data.seo.metaTitle.length > 60
  const descOver  = data.seo.metaDescription.length > 160

  return (
    <>
      <Topbar title="Settings" subtitle="Manage site-wide configuration" />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* ── Tab bar ── */}
        <div className={styles.tabBar}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className={styles.tabIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Contact Info ── */}
        {tab === 'contact' && (
          <Card
            icon={TABS[0].icon}
            title="Contact Information"
            desc="Shown in the footer and contact page"
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
          >
            <div className={styles.grid2}>
              <Field label="Email Address" hint="Displayed site-wide in footer and contact page">
                <input
                  className={styles.input}
                  value={data.contact.email}
                  onChange={e => update('contact', 'email', e.target.value)}
                />
              </Field>
              <Field label="Display Phone" hint="Formatted number shown to visitors">
                <input
                  className={styles.input}
                  value={data.contact.phone}
                  onChange={e => update('contact', 'phone', e.target.value)}
                />
              </Field>
              <Field label="Phone (tel: link)" hint="No spaces, for clickable links e.g. +919599129634">
                <input
                  className={styles.input}
                  value={data.contact.phoneTel}
                  onChange={e => update('contact', 'phoneTel', e.target.value)}
                />
              </Field>
              <Field label="Location / Address" hint="Shown in footer or contact page">
                <input
                  className={styles.input}
                  value={data.contact.address}
                  onChange={e => update('contact', 'address', e.target.value)}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ── Social Links ── */}
        {tab === 'social' && (
          <Card
            icon={TABS[1].icon}
            title="Social Media Links"
            desc="Used in footer social icons and contact page"
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
          >
            <Field label="Instagram Handle">
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>instagram.com/</span>
                <input
                  className={`${styles.input} ${styles.inputGroupField}`}
                  value={data.social.instagram}
                  onChange={e => update('social', 'instagram', e.target.value)}
                />
              </div>
            </Field>
            <Field label="Facebook Handle">
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>facebook.com/</span>
                <input
                  className={`${styles.input} ${styles.inputGroupField}`}
                  value={data.social.facebook}
                  onChange={e => update('social', 'facebook', e.target.value)}
                />
              </div>
            </Field>
            <Field label="WhatsApp Number" hint="Include country code, no spaces e.g. +919599129634">
              <input
                className={styles.input}
                value={data.social.whatsapp}
                onChange={e => update('social', 'whatsapp', e.target.value)}
              />
            </Field>

            {/* Link preview */}
            <div className={styles.linkPreview}>
              <div className={styles.linkPreviewTitle}>Link Preview</div>
              {[
                { label:'Instagram', val:`https://instagram.com/${data.social.instagram}` },
                { label:'Facebook',  val:`https://facebook.com/${data.social.facebook}`   },
                { label:'WhatsApp',  val:`https://wa.me/${data.social.whatsapp.replace(/\D/g,'')}` },
              ].map(l => (
                <div key={l.label} className={styles.linkRow}>
                  <span className={styles.linkLabel}>{l.label}</span>
                  <span className={styles.linkVal}>{l.val}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Branding ── */}
        {tab === 'branding' && (
          <Card
            icon={TABS[2].icon}
            title="Branding & Identity"
            desc="Key text used across the website"
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
          >
            <Field label="Founder Name" hint="Used in About page and admin portal">
              <input
                className={styles.input}
                value={data.branding.founderName}
                onChange={e => update('branding', 'founderName', e.target.value)}
              />
            </Field>
            <Field label="Brand Tagline" hint="Short line used in hero sections and meta">
              <input
                className={styles.input}
                value={data.branding.tagline}
                onChange={e => update('branding', 'tagline', e.target.value)}
              />
            </Field>
            <Field label="Short About Description" hint="Used in Home page About preview section">
              <textarea
                className={styles.textarea}
                rows={3}
                value={data.branding.aboutShort}
                onChange={e => update('branding', 'aboutShort', e.target.value)}
              />
            </Field>

            {/* Live preview */}
            <div className={styles.brandPreview}>
              <div className={styles.brandPreviewLabel}>Site Preview</div>
              <div className={styles.brandPreviewScript}>Aarambhh Events</div>
              <div className={styles.brandPreviewTagline}>"{data.branding.tagline}"</div>
              <div className={styles.brandPreviewAbout}>{data.branding.aboutShort}</div>
              <div className={styles.brandPreviewFounder}>— {data.branding.founderName}, Founder</div>
            </div>
          </Card>
        )}

        {/* ── SEO ── */}
        {tab === 'seo' && (
          <Card
            icon={TABS[3].icon}
            title="SEO & Meta Tags"
            desc="Controls how your site appears in Google search results"
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
          >
            <Field
              label="Meta Title"
              hint={`${data.seo.metaTitle.length}/60 characters — keep under 60`}
            >
              <input
                className={`${styles.input} ${titleOver ? styles.inputError : ''}`}
                value={data.seo.metaTitle}
                onChange={e => update('seo', 'metaTitle', e.target.value)}
              />
            </Field>
            <Field
              label="Meta Description"
              hint={`${data.seo.metaDescription.length}/160 characters — keep under 160`}
            >
              <textarea
                className={`${styles.textarea} ${descOver ? styles.inputError : ''}`}
                rows={3}
                value={data.seo.metaDescription}
                onChange={e => update('seo', 'metaDescription', e.target.value)}
              />
            </Field>
            <Field label="Keywords" hint="Comma separated. Useful as reference — not critical for modern SEO.">
              <input
                className={styles.input}
                value={data.seo.keywords}
                onChange={e => update('seo', 'keywords', e.target.value)}
              />
            </Field>

            {/* Google preview */}
            <div className={styles.seoPreview}>
              <div className={styles.seoPreviewLabel}>Google Search Preview</div>
              <div className={styles.seoUrl}>aarambhhevents.com</div>
              <div className={`${styles.seoTitle} ${titleOver ? styles.seoTitleOver : ''}`}>
                {data.seo.metaTitle || 'Page Title'}
              </div>
              <div className={styles.seoDesc}>
                {data.seo.metaDescription || 'Page description will appear here.'}
              </div>
            </div>

            {/* Warnings */}
            {titleOver && (
              <div className={styles.warnBox}>
                ⚠ Meta title is {data.seo.metaTitle.length - 60} characters over the recommended limit.
              </div>
            )}
            {descOver && (
              <div className={styles.warnBox}>
                ⚠ Meta description is {data.seo.metaDescription.length - 160} characters over the recommended limit.
              </div>
            )}
          </Card>
        )}

      </div>

      {/* ── Toast ── */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        <span className={styles.toastDot} />
        {toast}
      </div>
    </>
  )
}