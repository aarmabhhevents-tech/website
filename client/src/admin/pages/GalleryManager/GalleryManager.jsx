import { useState, useRef, useEffect } from 'react'
import Topbar from '../../components/Topbar/Topbar'
import styles from './GalleryManager.module.css'
import { apiFetch } from '../../lib/api'

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate']

const CAT_META = {
  Wedding:   { color:'#c9a227', bg:'rgba(201,162,39,0.12)',  emoji:'💍' },
  Birthday:  { color:'#f472b6', bg:'rgba(244,114,182,0.12)', emoji:'🎂' },
  Corporate: { color:'#60a5fa', bg:'rgba(96,165,250,0.12)',  emoji:'🏢' },
}

export default function GalleryManager() {
  const [images, setImages]             = useState([])
  const [filter, setFilter]             = useState('All')
  const [view, setView]                 = useState('grid')
  const [selected, setSelected]         = useState(new Set())
  const [hovered, setHovered]           = useState(null)
  const [editModal, setEditModal]       = useState(null)
  const [uploadModal, setUploadModal]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [drag, setDrag]                 = useState(false)
  const [toast, setToast]               = useState('')
  const [mounted, setMounted]           = useState(false)

  // Edit
  const [editForm, setEditForm] = useState({ title:'', category:'Wedding' })

  // Upload
  const [uploadMode, setUploadMode]     = useState('file')
  const [uploadForm, setUploadForm]     = useState({ title:'', category:'Wedding', url:'' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview]   = useState('')
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState('')
  const fileRef = useRef()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const rows = await apiFetch('/api/gallery')
        if (!cancelled) setImages(Array.isArray(rows) ? rows : [])
      } catch (e) {
        if (!cancelled) setImages([])
      } finally {
        if (!cancelled) setMounted(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    return () => { if (filePreview) URL.revokeObjectURL(filePreview) }
  }, [filePreview])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const resetUpload = () => {
    setUploadModal(false)
    setUploadForm({ title:'', category:'Wedding', url:'' })
    setSelectedFile(null)
    setFilePreview('')
    setUploadMode('file')
    setUploadError('')
  }

  // ── Handle file picked / dropped ──────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WEBP files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5MB.')
      return
    }
    setUploadError('')
    setSelectedFile(file)
    if (filePreview) URL.revokeObjectURL(filePreview)
    setFilePreview(URL.createObjectURL(file))
    // Auto-fill title from filename if blank
    if (!uploadForm.title) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setUploadForm(p => ({ ...p, title: name }))
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  // ── Submit upload ──────────────────────────────────────────
  const handleUpload = async () => {
    setUploadError('')
    if (!uploadForm.title) { setUploadError('Please enter an image title.'); return }

    // URL mode — just save record, no file upload needed
    if (uploadMode === 'url') {
      if (!uploadForm.url) { setUploadError('Please enter an image URL.'); return }
      try {
        const saved = await apiFetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: uploadForm.url,
            title: uploadForm.title,
            category: uploadForm.category,
            sort_order: images.length + 1,
            uploadedAt: new Date().toISOString().split('T')[0],
          }),
        })
        setImages(prev => [saved, ...prev])
        resetUpload()
        showToast('Image added to gallery')
      } catch (e) {
        setUploadError(e.message || 'Save failed')
      }
      return
    }

    // File mode — upload to backend → Cloudinary
    if (!selectedFile) { setUploadError('Please select a file to upload.'); return }

    setUploading(true)
    try {
      // Step 1: POST file to Express → Cloudinary
      const formData = new FormData()
      formData.append('image', selectedFile)

      const uploaded = await apiFetch('/api/upload/gallery', {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type manually — browser adds boundary automatically
      })
      const { url, public_id } = uploaded || {}
      if (!url) throw new Error('Upload failed')

      // Step 2: Save image record to MongoDB
      const newImg = {
        title:      uploadForm.title,
        category:   uploadForm.category,
        url,
        public_id,
        sort_order: images.length + 1,
        uploadedAt: new Date().toISOString().split('T')[0],
      }

      const saved = await apiFetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImg),
      })

      setImages(prev => [saved, ...prev])
      resetUpload()
      showToast('Image uploaded successfully')

    } catch (err) {
      setUploadError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // ── Other handlers ─────────────────────────────────────────
  const filtered = filter === 'All' ? images : images.filter(i => i.category === filter)

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const openEdit = (img, e) => {
    e?.stopPropagation()
    setEditForm({ title: img.title, category: img.category })
    setEditModal(img)
  }

  const saveEdit = () => {
    ;(async () => {
      try {
        const updated = await apiFetch(`/api/gallery/${editModal._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        })
        setImages(prev => prev.map(i => i._id === updated._id ? updated : i))
        setEditModal(null)
        showToast('Image updated successfully')
      } catch (e) {
        showToast(e.message || 'Update failed')
      }
    })()
  }

  const confirmDelete = (id, e) => { e?.stopPropagation(); setDeleteTarget(id) }

  const deleteImage = () => {
    ;(async () => {
      try {
        await apiFetch(`/api/gallery/${deleteTarget}`, { method: 'DELETE' })
        setImages(prev => prev.filter(i => i._id !== deleteTarget))
        setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget); return n })
        setDeleteTarget(null)
        showToast('Image deleted')
      } catch (e) {
        showToast(e.message || 'Delete failed')
      }
    })()
  }

  const deleteSelected = () => {
    const ids = Array.from(selected)
    const count = ids.length
    ;(async () => {
      try {
        await apiFetch('/api/gallery/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        })
        setImages(prev => prev.filter(i => !selected.has(i._id)))
        showToast(`${count} image${count > 1 ? 's' : ''} deleted`)
        setSelected(new Set())
      } catch (e) {
        showToast(e.message || 'Bulk delete failed')
      }
    })()
  }

  const counts = CATEGORIES.slice(1).reduce((acc, cat) => {
    acc[cat] = images.filter(i => i.category === cat).length
    return acc
  }, {})

  return (
    <>
      <Topbar
        title="Gallery Manager"
        subtitle={`${images.length} images across ${Object.keys(counts).length} categories`}
      />

      <div className={`${styles.content} ${mounted ? styles.mounted : ''}`}>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🖼</div>
            <div>
              <div className={styles.statNum}>{images.length}</div>
              <div className={styles.statLabel}>Total Images</div>
            </div>
          </div>
          {Object.entries(counts).map(([cat, n]) => (
            <div key={cat} className={styles.statCard} style={{ borderColor:`${CAT_META[cat].color}22` }}>
              <div className={styles.statIcon} style={{ background: CAT_META[cat].bg }}>{CAT_META[cat].emoji}</div>
              <div>
                <div className={styles.statNum} style={{ color: CAT_META[cat].color }}>{n}</div>
                <div className={styles.statLabel}>{cat}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filterRow}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`${styles.filterBtn} ${filter===cat ? styles.filterBtnActive : ''}`} onClick={() => setFilter(cat)}>
                {cat} {cat !== 'All' && `(${counts[cat]||0})`}
              </button>
            ))}
          </div>
          <div className={styles.toolRight}>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view==='grid' ? styles.viewBtnActive : ''}`} onClick={() => setView('grid')}>⊞ Grid</button>
              <button className={`${styles.viewBtn} ${view==='list' ? styles.viewBtnActive : ''}`} onClick={() => setView('list')}>≡ List</button>
            </div>
            <button className={styles.uploadBtn} onClick={() => setUploadModal(true)}>+ Add Image</button>
          </div>
        </div>

        {/* Grid view */}
        {view === 'grid' && (
          filtered.length === 0
            ? <div className={styles.empty}>No images in this category.</div>
            : <div className={styles.imgGrid}>
                {filtered.map((img, idx) => (
                  <div
                    key={img._id}
                    className={`${styles.imgCard} ${selected.has(img._id) ? styles.imgCardSelected : ''}`}
                    style={{ animationDelay:`${idx*0.04}s` }}
                    onMouseEnter={() => setHovered(img._id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className={`${styles.checkBox} ${selected.has(img._id) ? styles.checkBoxSelected : ''}`} onClick={e => toggleSelect(img._id, e)}>
                      {selected.has(img._id) && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <div className={styles.imgWrap}>
                      <img src={img.url} alt={img.title} className={`${styles.img} ${hovered===img._id ? styles.imgHovered : ''}`} />
                      <div className={`${styles.imgOverlay} ${hovered===img._id ? styles.imgOverlayVisible : ''}`}>
                        <button className={styles.overlayBtn} onClick={e => openEdit(img, e)}>Edit</button>
                        <button className={`${styles.overlayBtn} ${styles.overlayBtnDelete}`} onClick={e => confirmDelete(img._id, e)}>✕</button>
                      </div>
                    </div>
                    <div className={styles.imgInfo}>
                      <div className={styles.imgTitle}>{img.title}</div>
                      <div className={styles.imgMeta}>
                        <span className={styles.catBadge} style={{ color:CAT_META[img.category]?.color, background:CAT_META[img.category]?.bg }}>{img.category}</span>
                        <span className={styles.imgDate}>{img.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className={styles.listCard}>
            <table className={styles.table}>
              <thead>
                <tr>{['','Image','Title','Category','Uploaded','Actions'].map(h => <th key={h} className={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} className={styles.empty}>No images.</td></tr>
                  : filtered.map((img, idx) => (
                    <tr key={img._id} className={styles.tr} style={{ animationDelay:`${idx*0.04}s` }}>
                      <td className={styles.td} style={{ width:36 }}>
                        <div className={`${styles.checkBox} ${selected.has(img._id) ? styles.checkBoxSelected : ''}`} onClick={e => toggleSelect(img._id, e)}>
                          {selected.has(img._id) && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg>}
                        </div>
                      </td>
                      <td className={styles.td}><img src={img.url} alt={img.title} className={styles.listThumb} /></td>
                      <td className={`${styles.td} ${styles.tdBold}`}>{img.title}</td>
                      <td className={styles.td}><span className={styles.catBadge} style={{ color:CAT_META[img.category]?.color, background:CAT_META[img.category]?.bg }}>{img.category}</span></td>
                      <td className={styles.td}>{img.uploadedAt}</td>
                      <td className={styles.td}>
                        <div className={styles.listActions}>
                          <button className={styles.listBtn} onClick={() => openEdit(img)}>Edit</button>
                          <button className={`${styles.listBtn} ${styles.listBtnDelete}`} onClick={() => setDeleteTarget(img._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Edit Image</span>
              <button className={styles.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <img src={editModal.url} alt="" className={styles.modalPreview} />
              <div className={styles.field}>
                <label className={styles.label}>Image Title</label>
                <input className={styles.input} value={editForm.title} onChange={e => setEditForm(p => ({...p,title:e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={editForm.category} onChange={e => setEditForm(p => ({...p,category:e.target.value}))}>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadModal && (
        <div className={styles.modalOverlay} onClick={resetUpload}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Add New Image</span>
              <button className={styles.closeBtn} onClick={resetUpload}>✕</button>
            </div>
            <div className={styles.modalBody}>

              {/* Mode toggle */}
              <div className={styles.modeToggle}>
                <button className={`${styles.modeBtn} ${uploadMode==='file' ? styles.modeBtnActive : ''}`} onClick={() => { setUploadMode('file'); setUploadError('') }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload File
                </button>
                <button className={`${styles.modeBtn} ${uploadMode==='url' ? styles.modeBtnActive : ''}`} onClick={() => { setUploadMode('url'); setUploadError('') }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Paste URL
                </button>
              </div>

              {/* File upload */}
              {uploadMode === 'file' && (
                <div
                  className={`${styles.dropZone} ${drag ? styles.dropZoneDrag : ''} ${filePreview ? styles.dropZoneHasFile : ''}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display:'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                  {filePreview ? (
                    <>
                      <img src={filePreview} alt="preview" className={styles.dropPreviewImg} />
                      <div className={styles.dropFileName}>{selectedFile?.name}</div>
                      <div className={styles.dropFileSize}>{(selectedFile?.size/1024/1024).toFixed(2)} MB</div>
                      <div className={styles.dropChangeHint}>Click or drop to change</div>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropIconWrap}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <div className={styles.dropText}>Drag & drop or click to upload</div>
                      <div className={styles.dropHint}>JPG, PNG, WEBP · max 5MB</div>
                    </>
                  )}
                </div>
              )}

              {/* URL mode */}
              {uploadMode === 'url' && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Image URL</label>
                    <input className={styles.input} placeholder="https://..." value={uploadForm.url} onChange={e => setUploadForm(p => ({...p,url:e.target.value}))} />
                  </div>
                  {uploadForm.url && (
                    <img src={uploadForm.url} alt="" className={styles.urlPreview} onError={e => e.target.style.display='none'} />
                  )}
                </>
              )}

              {/* Error */}
              {uploadError && <div className={styles.uploadError}>{uploadError}</div>}

              {/* Shared fields */}
              <div className={styles.field}>
                <label className={styles.label}>Image Title <span className={styles.req}>*</span></label>
                <input className={styles.input} placeholder="e.g. Royal Wedding Ceremony" value={uploadForm.title} onChange={e => setUploadForm(p => ({...p,title:e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={uploadForm.category} onChange={e => setUploadForm(p => ({...p,category:e.target.value}))}>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={resetUpload}>Cancel</button>
              <button className={`${styles.saveBtn} ${uploading ? styles.saveBtnBusy : ''}`} onClick={handleUpload} disabled={uploading}>
                {uploading ? <><span className={styles.spinner} /> Uploading…</> : 'Add to Gallery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={`${styles.modalTitle} ${styles.modalTitleDanger}`}>Delete Image?</span>
              <button className={styles.closeBtn} onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className={styles.deleteBody}>
              <p className={styles.deleteText}>This will permanently remove the image from your gallery. This action cannot be undone.</p>
              <div className={styles.deleteActions}>
                <button className={styles.confirmDeleteBtn} onClick={deleteImage}>Yes, Delete</button>
                <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      <div className={`${styles.bulkBar} ${selected.size > 0 ? styles.bulkBarVisible : ''}`}>
        <span className={styles.bulkText}>{selected.size} image{selected.size > 1 ? 's' : ''} selected</span>
        <button className={styles.bulkClear} onClick={() => setSelected(new Set())}>Deselect All</button>
        <button className={styles.bulkDelete} onClick={deleteSelected}>Delete Selected</button>
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}>
        <span className={styles.toastDot} />{toast}
      </div>
    </>
  )
}