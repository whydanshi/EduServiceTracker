import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Modal from '../../components/shared/Modal'
import ConfirmModal from '../../components/shared/ConfirmModal'
import CsvUploadModal from '../../components/shared/CsvUploadModal'
import { useToast } from '../../components/shared/Toast'
import { packages as seedPackages, services as seedServices } from '../../data/packages'
import { readJson, writeJson } from '../../utils/storage'
import { Plus, Pencil, Trash2, Upload, Check } from 'lucide-react'

const PKG_KEY = 'leverage.superadmin.packages.v1'
const SVC_KEY = 'leverage.superadmin.services.v1'

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`
}

function toNumber(val) {
  const n = Number(String(val || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function formatPct(value) {
  return `${Number(value || 0).toFixed(2)}%`
}

function pctClass(value) {
  if (value >= 60) return 'text-green'
  if (value >= 40) return 'text-amber-600'
  return 'text-red'
}

function migratePackage(pkg, allServices) {
  if (pkg.serviceIds) {
    return {
      ...pkg,
      gwPercent: Number(pkg.gwPercent || 0),
    }
  }
  const serviceIds = (pkg.services || [])
    .map((name) => {
      const match = allServices.find((s) => s.name === name)
      return match ? match.id : null
    })
    .filter(Boolean)
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description || '',
    serviceIds,
    packagePriceINR: pkg.packagePriceINR || pkg.mrp || pkg.floorPrice || 0,
    gwPercent: Number(pkg.gwPercent || 0),
    status: pkg.status || 'ACTIVE',
  }
}

function packageCost(serviceIds, allServices) {
  return (serviceIds || []).reduce((sum, id) => {
    const svc = allServices.find((s) => s.id === id)
    return sum + (svc?.priceINR || 0)
  }, 0)
}

function marginPct(cost, msp) {
  if (!msp) return 0
  return ((msp - cost) / msp) * 100
}

function marginWithGwPct(cost, msp, gwPercent) {
  return marginPct(cost, msp) - Number(gwPercent || 0)
}

function symmetricDiffIds(baseIds, nextIds) {
  const a = new Set(baseIds || [])
  const b = new Set(nextIds || [])
  const diff = []
  for (const id of a) {
    if (!b.has(id)) diff.push(id)
  }
  for (const id of b) {
    if (!a.has(id)) diff.push(id)
  }
  return diff
}

function Field({ label, value, onChange, type = 'text', placeholder, autoFocus }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-grey-40 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white"
      />
    </div>
  )
}

function PriceCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const start = () => {
    setDraft(String(value || ''))
    setEditing(true)
  }

  const commit = () => {
    const n = toNumber(draft)
    if (n > 0) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-24 border border-blue-90 rounded px-2 py-1 text-[12px] text-grey-95 outline-none focus:ring-1 focus:ring-blue-20"
      />
    )
  }

  return (
    <button
      onClick={start}
      className="text-[13px] font-semibold text-grey-95 hover:text-blue-90 transition-colors group flex items-center gap-1"
      title="Click to edit price"
    >
      {formatINR(value)}
      <Pencil className="w-3 h-3 text-grey-40 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

export default function SuperAdminPackages() {
  const { toast } = useToast()

  const [svcRows, setSvcRows] = useState(() => readJson(SVC_KEY, seedServices))
  const [pkgRows, setPkgRows] = useState(() => {
    const raw = readJson(PKG_KEY, seedPackages)
    const svcs = readJson(SVC_KEY, seedServices)
    const migrated = raw.map((p) => migratePackage(p, svcs))
    const existing = new Set(migrated.map((p) => p.id))
    const missingSeeds = seedPackages
      .filter((p) => !existing.has(p.id))
      .map((p) => migratePackage(p, svcs))
    const merged = [...migrated, ...missingSeeds]
    if (missingSeeds.length > 0) writeJson(PKG_KEY, merged)
    return merged
  })

  const persistPkg = (next) => { setPkgRows(next); writeJson(PKG_KEY, next) }
  const persistSvc = (next) => { setSvcRows(next); writeJson(SVC_KEY, next) }

  const [showCreatePkg, setShowCreatePkg] = useState(false)
  const [showCreateSvc, setShowCreateSvc] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showEditPkg, setShowEditPkg] = useState(false)
  const [showEditSvc, setShowEditSvc] = useState(false)
  const [activePkg, setActivePkg] = useState(null)
  const [activeSvc, setActiveSvc] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteType, setDeleteType] = useState(null)

  // pending selections are stored per package until that package's Save button is clicked
  const [pendingByPkg, setPendingByPkg] = useState({})
  const [changedCellsByPkg, setChangedCellsByPkg] = useState({})

  const [pkgDraft, setPkgDraft] = useState({ name: '', packagePriceINR: '', gwPercent: '' })
  const [svcDraft, setSvcDraft] = useState({ name: '', priceINR: '' })
  const [editPkgDraft, setEditPkgDraft] = useState({ name: '', packagePriceINR: '', gwPercent: '' })
  const [editSvcDraft, setEditSvcDraft] = useState({ name: '', priceINR: '' })

  const getCurrentServiceIdsForPkg = (pkg) => {
    return pendingByPkg[pkg.id] || pkg.serviceIds || []
  }

  const toggleServicePending = (pkg, svcId) => {
    const current = getCurrentServiceIdsForPkg(pkg)
    const has = current.includes(svcId)
    const next = has ? current.filter((id) => id !== svcId) : [...current, svcId]
    const changed = symmetricDiffIds(pkg.serviceIds || [], next)

    setPendingByPkg((prev) => {
      const out = { ...prev }
      if (changed.length === 0) {
        delete out[pkg.id]
      } else {
        out[pkg.id] = next
      }
      return out
    })

    setChangedCellsByPkg((prev) => {
      const out = { ...prev }
      if (changed.length === 0) {
        delete out[pkg.id]
      } else {
        out[pkg.id] = changed
      }
      return out
    })

    toast({
      title: 'Unsaved change',
      description: `${pkg.name}: click Save in this column to confirm.`,
      type: 'warning',
    })
  }

  const savePackageSelection = (pkgId) => {
    const pendingIds = pendingByPkg[pkgId]
    if (!pendingIds) return

    persistPkg(pkgRows.map((p) => (p.id === pkgId ? { ...p, serviceIds: [...pendingIds] } : p)))
    setPendingByPkg((prev) => {
      const out = { ...prev }
      delete out[pkgId]
      return out
    })
    setChangedCellsByPkg((prev) => {
      const out = { ...prev }
      delete out[pkgId]
      return out
    })
    toast({ title: 'Saved', description: 'Package services updated successfully.', type: 'success' })
  }

  const handleCreatePkg = () => {
    const name = pkgDraft.name.trim()
    const price = toNumber(pkgDraft.packagePriceINR)
    const gwPercent = toNumber(pkgDraft.gwPercent)
    if (!name) { toast({ title: 'Missing field', description: 'Please enter a package name.', type: 'warning' }); return }
    if (!price) { toast({ title: 'Missing field', description: 'Please enter a package price.', type: 'warning' }); return }
    persistPkg([
      ...pkgRows,
      {
        id: makeId('pkg'),
        name,
        description: '',
        serviceIds: [],
        packagePriceINR: price,
        gwPercent,
        status: 'ACTIVE',
      },
    ])
    setShowCreatePkg(false)
    setPkgDraft({ name: '', packagePriceINR: '', gwPercent: '' })
    toast({ title: 'Package created', description: `"${name}" has been added.`, type: 'success' })
  }

  const handleCreateSvc = () => {
    const name = svcDraft.name.trim()
    const price = toNumber(svcDraft.priceINR)
    if (!name) { toast({ title: 'Missing field', description: 'Please enter a service name.', type: 'warning' }); return }
    if (!price) { toast({ title: 'Missing field', description: 'Please enter a price.', type: 'warning' }); return }
    persistSvc([...svcRows, { id: makeId('svc'), name, priceINR: price }])
    setShowCreateSvc(false)
    setSvcDraft({ name: '', priceINR: '' })
    toast({ title: 'Service created', description: `"${name}" has been added.`, type: 'success' })
  }

  const openEditPkg = (pkg) => {
    setActivePkg(pkg)
    setEditPkgDraft({
      name: pkg.name,
      packagePriceINR: String(pkg.packagePriceINR || ''),
      gwPercent: String(pkg.gwPercent || 0),
    })
    setShowEditPkg(true)
  }

  const handleSaveEditPkg = () => {
    const name = editPkgDraft.name.trim()
    const price = toNumber(editPkgDraft.packagePriceINR)
    const gwPercent = toNumber(editPkgDraft.gwPercent)
    if (!name) { toast({ title: 'Missing field', description: 'Please enter a package name.', type: 'warning' }); return }
    if (!price) { toast({ title: 'Missing field', description: 'Please enter a package price.', type: 'warning' }); return }
    persistPkg(pkgRows.map((p) => p.id === activePkg.id ? { ...p, name, packagePriceINR: price, gwPercent } : p))
    setShowEditPkg(false)
    setActivePkg(null)
    toast({ title: 'Package updated', type: 'success' })
  }

  const openEditSvc = (svc) => {
    setActiveSvc(svc)
    setEditSvcDraft({ name: svc.name, priceINR: String(svc.priceINR || '') })
    setShowEditSvc(true)
  }

  const handleSaveEditSvc = () => {
    const name = editSvcDraft.name.trim()
    const price = toNumber(editSvcDraft.priceINR)
    if (!name) { toast({ title: 'Missing field', description: 'Please enter a service name.', type: 'warning' }); return }
    if (!price) { toast({ title: 'Missing field', description: 'Please enter a price.', type: 'warning' }); return }
    persistSvc(svcRows.map((s) => s.id === activeSvc.id ? { ...s, name, priceINR: price } : s))
    setShowEditSvc(false)
    setActiveSvc(null)
    toast({ title: 'Service updated', type: 'success' })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteType === 'package') {
      persistPkg(pkgRows.filter((p) => p.id !== deleteTarget.id))
      setPendingByPkg((prev) => {
        const out = { ...prev }
        delete out[deleteTarget.id]
        return out
      })
      setChangedCellsByPkg((prev) => {
        const out = { ...prev }
        delete out[deleteTarget.id]
        return out
      })
    } else {
      persistSvc(svcRows.filter((s) => s.id !== deleteTarget.id))
      persistPkg(pkgRows.map((p) => ({ ...p, serviceIds: (p.serviceIds || []).filter((id) => id !== deleteTarget.id) })))
      setPendingByPkg((prev) => {
        const out = {}
        for (const [pkgId, ids] of Object.entries(prev)) {
          out[pkgId] = ids.filter((id) => id !== deleteTarget.id)
        }
        return out
      })
      setChangedCellsByPkg((prev) => {
        const out = {}
        for (const [pkgId, ids] of Object.entries(prev)) {
          const filtered = ids.filter((id) => id !== deleteTarget.id)
          if (filtered.length) out[pkgId] = filtered
        }
        return out
      })
    }
  }

  const updatePkgPrice = (pkgId, price) => {
    persistPkg(pkgRows.map((p) => p.id === pkgId ? { ...p, packagePriceINR: price } : p))
  }

  const hasData = pkgRows.length > 0 || svcRows.length > 0

  return (
    <div>
      <PageHeader title="Packages" subtitle="Manage packages and services" />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setPkgDraft({ name: '', packagePriceINR: '', gwPercent: '' }); setShowCreatePkg(true) }}
          className="flex items-center gap-1.5 bg-blue-90 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
        <button
          onClick={() => { setSvcDraft({ name: '', priceINR: '' }); setShowCreateSvc(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-70 border border-grey-20 hover:bg-grey-10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </button>
      </div>

      {!hasData ? (
        <div className="bg-white border border-grey-20 rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[15px] font-semibold text-grey-70 mb-1">No packages or services yet</p>
          <p className="text-[13px] text-grey-40 mb-4">Start by adding a service, then create packages that bundle services together.</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setSvcDraft({ name: '', priceINR: '' }); setShowCreateSvc(true) }}
              className="flex items-center gap-1.5 bg-blue-90 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-grey-20 bg-grey-5">
                  <th className="sticky top-0 left-0 z-30 bg-grey-5 text-left px-4 py-3 w-[250px] min-w-[250px] border-r border-grey-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                    <span className="text-[11px] font-semibold text-grey-40 uppercase tracking-[0.12em]">Service</span>
                  </th>
                  {pkgRows.map((pkg) => {
                    const currentIds = getCurrentServiceIdsForPkg(pkg)
                    const cost = packageCost(currentIds, svcRows)
                    const msp = Number(pkg.packagePriceINR || 0)
                    const margin = marginPct(cost, msp)
                    const marginWithGw = marginWithGwPct(cost, msp, pkg.gwPercent)
                    const hasPending = !!pendingByPkg[pkg.id]

                    return (
                      <th key={pkg.id} className="sticky top-0 z-20 bg-grey-5 text-center px-4 py-3 min-w-[210px] border-r border-grey-20 last:border-r-0 align-top">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-grey-90 leading-tight">{pkg.name}</span>
                          <div className="text-[11px] text-grey-60 leading-5 w-full">
                            <div className="flex items-center justify-between gap-2">
                              <span>Cost</span>
                              <span className="font-semibold text-grey-90">{formatINR(cost)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span>MSP</span>
                              <span className="font-semibold text-grey-90">{formatINR(msp)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span>Margin</span>
                              <span className={`font-semibold ${pctClass(margin)}`}>{formatPct(margin)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span>Margin + GW</span>
                              <span className={`font-semibold ${pctClass(marginWithGw)}`}>{formatPct(marginWithGw)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => savePackageSelection(pkg.id)}
                            disabled={!hasPending}
                            className={`mt-0.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              hasPending
                                ? 'bg-blue-90 text-white hover:bg-blue-50'
                                : 'bg-grey-10 text-grey-40 cursor-not-allowed'
                            }`}
                            title={hasPending ? 'Save service changes for this package' : 'No unsaved changes'}
                          >
                            Save
                          </button>

                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => openEditPkg(pkg)}
                              className="p-1 rounded hover:bg-grey-20 transition-colors"
                              title="Edit package"
                            >
                              <Pencil className="w-3 h-3 text-grey-40" />
                            </button>
                            <button
                              onClick={() => { setDeleteTarget(pkg); setDeleteType('package') }}
                              className="p-1 rounded hover:bg-red-light transition-colors"
                              title="Delete package"
                            >
                              <Trash2 className="w-3 h-3 text-red" />
                            </button>
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-grey-10">
                {svcRows.length === 0 && (
                  <tr>
                    <td colSpan={pkgRows.length + 1} className="text-center py-10 text-[13px] text-grey-40">
                      No services yet. Add services to start creating packages.
                    </td>
                  </tr>
                )}

                {svcRows.map((svc) => (
                  <tr key={svc.id} className="hover:bg-grey-5/50 transition-colors group/row">
                    <td className="sticky left-0 z-20 bg-white group-hover/row:bg-grey-5/50 px-4 py-3 border-r border-grey-20 w-[250px] min-w-[250px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-grey-90 truncate">{svc.name}</p>
                          <p className="text-[11px] text-grey-40 mt-0.5">{formatINR(svc.priceINR)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditSvc(svc)}
                            className="p-1 rounded hover:bg-grey-20 transition-colors"
                            title="Edit service"
                          >
                            <Pencil className="w-3 h-3 text-grey-40" />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(svc); setDeleteType('service') }}
                            className="p-1 rounded hover:bg-red-light transition-colors"
                            title="Delete service"
                          >
                            <Trash2 className="w-3 h-3 text-red" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {pkgRows.map((pkg) => {
                      const currentIds = getCurrentServiceIdsForPkg(pkg)
                      const checked = currentIds.includes(svc.id)
                      const changed = (changedCellsByPkg[pkg.id] || []).includes(svc.id)
                      return (
                        <td
                          key={pkg.id}
                          className={`text-center px-4 py-3 border-r border-grey-10 last:border-r-0 ${changed ? 'bg-amber-50' : ''}`}
                        >
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleServicePending(pkg, svc.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                                checked ? 'bg-blue-90 border-blue-90' : 'bg-white border-grey-30 hover:border-blue-90'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </span>
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>

              {pkgRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-grey-20 bg-grey-5">
                    <td className="sticky left-0 z-20 bg-grey-5 px-4 py-3 border-r border-grey-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                      <span className="text-[12px] font-semibold text-grey-60 uppercase tracking-[0.1em]">Package Cost</span>
                    </td>
                    {pkgRows.map((pkg) => {
                      const currentIds = getCurrentServiceIdsForPkg(pkg)
                      return (
                        <td key={pkg.id} className="text-center px-4 py-3 border-r border-grey-10 last:border-r-0">
                          <span className="text-[13px] font-semibold text-grey-90">{formatINR(packageCost(currentIds, svcRows))}</span>
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="bg-grey-5">
                    <td className="sticky left-0 z-20 bg-grey-5 px-4 py-3 border-r border-grey-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                      <span className="text-[12px] font-semibold text-grey-60 uppercase tracking-[0.1em]">MSP / Package Price</span>
                    </td>
                    {pkgRows.map((pkg) => (
                      <td key={pkg.id} className="text-center px-4 py-3 border-r border-grey-10 last:border-r-0">
                        <PriceCell value={pkg.packagePriceINR} onSave={(price) => updatePkgPrice(pkg.id, price)} />
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-grey-5">
                    <td className="sticky left-0 z-20 bg-grey-5 px-4 py-3 border-r border-grey-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                      <span className="text-[12px] font-semibold text-grey-60 uppercase tracking-[0.1em]">Margin</span>
                    </td>
                    {pkgRows.map((pkg) => {
                      const currentIds = getCurrentServiceIdsForPkg(pkg)
                      const cost = packageCost(currentIds, svcRows)
                      const margin = marginPct(cost, Number(pkg.packagePriceINR || 0))
                      return (
                        <td key={pkg.id} className="text-center px-4 py-3 border-r border-grey-10 last:border-r-0">
                          <span className={`text-[13px] font-semibold ${pctClass(margin)}`}>{formatPct(margin)}</span>
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="bg-grey-5">
                    <td className="sticky left-0 z-20 bg-grey-5 px-4 py-3 border-r border-grey-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                      <span className="text-[12px] font-semibold text-grey-60 uppercase tracking-[0.1em]">Margin + GW</span>
                    </td>
                    {pkgRows.map((pkg) => {
                      const currentIds = getCurrentServiceIdsForPkg(pkg)
                      const cost = packageCost(currentIds, svcRows)
                      const marginGw = marginWithGwPct(cost, Number(pkg.packagePriceINR || 0), Number(pkg.gwPercent || 0))
                      return (
                        <td key={pkg.id} className="text-center px-4 py-3 border-r border-grey-10 last:border-r-0">
                          <span className={`text-[13px] font-semibold ${pctClass(marginGw)}`}>{formatPct(marginGw)}</span>
                          <span className="ml-1 text-[10px] text-grey-50">(GW {formatPct(pkg.gwPercent)})</span>
                        </td>
                      )
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-grey-20 bg-grey-5 flex items-center gap-4">
            <p className="text-[11px] text-grey-40">
              {svcRows.length} service{svcRows.length !== 1 ? 's' : ''} · {pkgRows.length} package{pkgRows.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <Modal isOpen={showCreatePkg} onClose={() => setShowCreatePkg(false)} title="Add package" maxWidth="max-w-sm">
        <div className="space-y-4">
          <Field
            label="Package Name *"
            value={pkgDraft.name}
            onChange={(v) => setPkgDraft({ ...pkgDraft, name: v })}
            placeholder="e.g. German Premium Package"
            autoFocus
          />
          <Field
            label="Package Price / MSP (₹) *"
            value={pkgDraft.packagePriceINR}
            onChange={(v) => setPkgDraft({ ...pkgDraft, packagePriceINR: v })}
            placeholder="e.g. 95000"
          />
          <Field
            label="GW (%)"
            value={pkgDraft.gwPercent}
            onChange={(v) => setPkgDraft({ ...pkgDraft, gwPercent: v })}
            placeholder="e.g. 18"
          />
          <p className="text-[11px] text-grey-40">Services can be selected from the matrix after creation.</p>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={() => setShowCreatePkg(false)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePkg}
            className="px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            Create package
          </button>
        </div>
      </Modal>

      <Modal isOpen={showCreateSvc} onClose={() => setShowCreateSvc(false)} title="Add service" maxWidth="max-w-sm">
        <div className="space-y-4">
          <Field
            label="Service Name *"
            value={svcDraft.name}
            onChange={(v) => setSvcDraft({ ...svcDraft, name: v })}
            placeholder="e.g. APS Processing"
            autoFocus
          />
          <Field
            label="Price (₹) *"
            value={svcDraft.priceINR}
            onChange={(v) => setSvcDraft({ ...svcDraft, priceINR: v })}
            placeholder="e.g. 25000"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={() => setShowCreateSvc(false)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSvc}
            className="px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            Create service
          </button>
        </div>
      </Modal>

      <Modal isOpen={showEditPkg} onClose={() => { setShowEditPkg(false); setActivePkg(null) }} title="Edit package" maxWidth="max-w-sm">
        <div className="space-y-4">
          <Field
            label="Package Name *"
            value={editPkgDraft.name}
            onChange={(v) => setEditPkgDraft({ ...editPkgDraft, name: v })}
            autoFocus
          />
          <Field
            label="Package Price / MSP (₹) *"
            value={editPkgDraft.packagePriceINR}
            onChange={(v) => setEditPkgDraft({ ...editPkgDraft, packagePriceINR: v })}
            placeholder="e.g. 95000"
          />
          <Field
            label="GW (%)"
            value={editPkgDraft.gwPercent}
            onChange={(v) => setEditPkgDraft({ ...editPkgDraft, gwPercent: v })}
            placeholder="e.g. 18"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowEditPkg(false); setActivePkg(null) }}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEditPkg}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save changes
          </button>
        </div>
      </Modal>

      <Modal isOpen={showEditSvc} onClose={() => { setShowEditSvc(false); setActiveSvc(null) }} title="Edit service" maxWidth="max-w-sm">
        <div className="space-y-4">
          <Field
            label="Service Name *"
            value={editSvcDraft.name}
            onChange={(v) => setEditSvcDraft({ ...editSvcDraft, name: v })}
            autoFocus
          />
          <Field
            label="Price (₹) *"
            value={editSvcDraft.priceINR}
            onChange={(v) => setEditSvcDraft({ ...editSvcDraft, priceINR: v })}
            placeholder="e.g. 25000"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowEditSvc(false); setActiveSvc(null) }}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEditSvc}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save changes
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteType(null) }}
        onConfirm={handleDelete}
        title={deleteType === 'package' ? 'Delete package?' : 'Delete service?'}
        message={
          deleteType === 'package'
            ? `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? It will be removed from all packages that include it.`
        }
        confirmLabel="Delete"
        danger
      />

      <CsvUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload packages or services (CSV)"
        subtitle="For packages: Name, PackagePrice, GWPercent · For services: Name, Price"
        expectedHeaders={['Name', 'Price']}
        onImport={(importedRows) => {
          const hasPkg = importedRows.some((r) => r.PackagePrice || r.packagePrice)
          if (hasPkg) {
            const nextPkgs = importedRows.map((r) => ({
              id: makeId('pkg'),
              name: (r.Name || r.name || '').trim(),
              description: (r.Description || r.description || '').trim(),
              serviceIds: [],
              packagePriceINR: toNumber(r.PackagePrice || r.packagePrice || r.Price || r.price),
              gwPercent: toNumber(r.GWPercent || r.gwPercent || r.gw),
              status: (r.Status || r.status || 'ACTIVE').trim().toUpperCase(),
            }))
            persistPkg([...pkgRows, ...nextPkgs])
            toast({ title: 'Import complete', description: `${nextPkgs.length} packages imported.`, type: 'success' })
          } else {
            const nextSvcs = importedRows.map((r) => ({
              id: makeId('svc'),
              name: (r.Name || r.name || '').trim(),
              priceINR: toNumber(r.Price || r.price || r.priceINR),
            }))
            persistSvc([...svcRows, ...nextSvcs])
            toast({ title: 'Import complete', description: `${nextSvcs.length} services imported.`, type: 'success' })
          }
        }}
      />
    </div>
  )
}
