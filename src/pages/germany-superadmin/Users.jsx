import { useMemo, useState, useEffect } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmModal from '../../components/shared/ConfirmModal'
import CsvUploadModal from '../../components/shared/CsvUploadModal'
import { useToast } from '../../components/shared/Toast'
import { relativeTime, fullDate } from '../../utils/relativeTime'
import { users as seedUsers } from '../../data/users'
import { readJson, writeJson } from '../../utils/storage'
import { Plus, Pencil, Trash2, Upload, ArrowUpDown, Users } from 'lucide-react'

const STORAGE_KEY = 'leverage.superadmin.users.v1'

const roleLabels = {
  sales: 'Sales',
  service: 'Service',
  admin: 'Admin',
  superadmin: 'Super Admin',
  finance: 'Finance',
}

const teamLabels = {
  sales: 'Sales',
  service: 'Service',
  admin: 'Admin',
  superadmin: 'Super Admin',
  finance: 'Finance',
}

const sortOptions = [
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'name-desc', label: 'Name Z–A' },
  { id: 'created-desc', label: 'Newest first' },
  { id: 'created-asc', label: 'Oldest first' },
  { id: 'role', label: 'Role' },
]

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function nowISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function normalizeRole(val) {
  const v = String(val || '').trim().toLowerCase()
  if (['super admin', 'superadmin', 'super_admin'].includes(v)) return 'superadmin'
  if (['sales'].includes(v)) return 'sales'
  if (['service'].includes(v)) return 'service'
  if (['admin'].includes(v)) return 'admin'
  if (['finance', 'accounts'].includes(v)) return 'finance'
  return 'sales'
}

function normalizeTeam(val, role) {
  const v = String(val || '').trim().toLowerCase()
  if (['super admin', 'superadmin', 'super_admin'].includes(v)) return 'superadmin'
  if (['sales'].includes(v)) return 'sales'
  if (['service'].includes(v)) return 'service'
  if (['admin'].includes(v)) return 'admin'
  if (['finance', 'accounts'].includes(v)) return 'finance'
  return role || 'sales'
}

function cleanPhone(val) {
  const s = String(val || '').trim()
  if (!s) return ''
  return s.startsWith('+') ? s : `+91 ${s}`.replace(/\s+/g, ' ').trim()
}

function makeId() {
  return `usr-${Math.random().toString(16).slice(2, 10)}`
}

function applySorting(data, sortBy) {
  const sorted = [...data]
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'name-desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    case 'created-desc':
      return sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    case 'created-asc':
      return sorted.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    case 'role':
      return sorted.sort((a, b) => (a.role || '').localeCompare(b.role || ''))
    default:
      return sorted
  }
}

function UserForm({ value, onChange, disableSuperAdmin }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  const roleOptions = Object.entries(roleLabels).map(([id, label]) => ({ id, label }))
  if (disableSuperAdmin) {
    roleOptions.find(o => o.id === 'superadmin').disabled = true
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
      <Field label="First Name *" value={value.firstName} onChange={(v) => set('firstName', v)} />
      <Field label="Last Name *" value={value.lastName} onChange={(v) => set('lastName', v)} />
      <Field label="Email *" value={value.email} onChange={(v) => set('email', v)} type="email" />
      <Field label="Phone *" value={value.phone} onChange={(v) => set('phone', v)} />

      <div className="col-span-2 border-t border-grey-20 pt-4 mt-1" />

      <Field label="Employee ID *" value={value.employeeId} onChange={(v) => set('employeeId', v)} />
      <div />

      <SelectField
        label="Role *"
        value={value.role}
        onChange={(v) => set('role', v)}
        options={roleOptions}
      />
      <SelectField
        label="Team *"
        value={value.team}
        onChange={(v) => set('team', v)}
        options={Object.entries(teamLabels).map(([id, label]) => ({ id, label }))}
      />
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-grey-40 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-grey-40 block mb-1.5">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white cursor-pointer"
      >
        {options.map(o => (
          <option key={o.id} value={o.id} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

const USER_PREFS_KEY = 'leverage.superadmin.users.prefs'

export default function SuperAdminUsers() {
  const { toast } = useToast()
  const [prefs] = useState(() => readJson(USER_PREFS_KEY, {}))
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [activeFilter, setActiveFilter] = useState(prefs.filter || 'all')
  const [sortBy, setSortBy] = useState(prefs.sortBy || 'created-desc')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    writeJson(USER_PREFS_KEY, { filter: activeFilter, sortBy })
  }, [activeFilter, sortBy])

  const [rows, setRows] = useState(() => readJson(STORAGE_KEY, seedUsers))

  const [editing, setEditing] = useState(null)
  const [showEdit, setShowEdit] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'sales',
    team: 'sales',
  })

  const resetForm = () => setForm({ firstName: '', lastName: '', email: '', phone: '', employeeId: '', role: 'sales', team: 'sales' })

  const persist = (next) => {
    setRows(next)
    writeJson(STORAGE_KEY, next)
  }

  const roleCounts = useMemo(() => {
    const counts = { all: rows.length, sales: 0, service: 0, admin: 0, finance: 0 }
    rows.forEach(u => {
      const r = u.role || u.team
      if (counts[r] !== undefined) counts[r]++
    })
    return counts
  }, [rows])

  const filters = useMemo(() => [
    { id: 'all', label: 'All', count: roleCounts.all },
    { id: 'sales', label: 'Sales', count: roleCounts.sales, dot: true, dotColor: 'bg-blue-90' },
    { id: 'service', label: 'Service', count: roleCounts.service, dot: true, dotColor: 'bg-purple' },
    { id: 'finance', label: 'Finance', count: roleCounts.finance, dot: true, dotColor: 'bg-amber' },
    { id: 'admin', label: 'Admin', count: roleCounts.admin, dot: true, dotColor: 'bg-green' },
  ], [roleCounts])

  const filtered = useMemo(() => {
    let data = rows
    if (activeFilter !== 'all') {
      data = data.filter(u => u.role === activeFilter || u.team === activeFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      data = data.filter(u =>
        [u.name, u.email, u.employeeId, roleLabels[u.role], teamLabels[u.team]]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      )
    }
    return applySorting(data, sortBy)
  }, [rows, search, activeFilter, sortBy])

  const hasSuperAdmin = useMemo(() => rows.some(u => u.role === 'superadmin'), [rows])

  const columns = [
    {
      key: 'name',
      label: 'Team Member',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">
            {initials(row.name)}
          </div>
          <div>
            <p className="text-[13px] font-medium text-grey-95">{row.name}</p>
            <p className="text-[11px] text-grey-40">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'employeeId', label: 'Employee ID', render: (v) => <span className="text-grey-70">{v}</span> },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-10 text-blue-90">
          {roleLabels[v] || v}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${v === 'active' ? 'bg-green-light text-green' : 'bg-grey-10 text-grey-60'}`}>
          {String(v || 'active').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created on',
      render: (v) => <span className="text-grey-40">{formatDate(v)}</span>,
    },
    { key: 'lastActive', label: 'Last Active', render: (v) => <span className="text-grey-40" title={fullDate(v)}>{relativeTime(v)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditing(row)
              setShowEdit(true)
            }}
            className="p-2 rounded-lg border border-grey-20 hover:bg-grey-10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-grey-60" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(row)
            }}
            className="p-2 rounded-lg border border-grey-20 hover:bg-red-light transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red" />
          </button>
        </div>
      ),
    },
  ]

  const handleCreate = () => {
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const employeeId = form.employeeId.trim()

    if (!firstName || !lastName || !email || !phone || !employeeId) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', type: 'warning' })
      return
    }

    const role = form.role
    const team = form.team

    if (role === 'superadmin' && hasSuperAdmin) {
      toast({ title: 'Role conflict', description: 'Only one Super Admin is allowed. A Super Admin already exists.', type: 'error' })
      return
    }

    const next = [
      {
        id: makeId(),
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: cleanPhone(phone),
        employeeId,
        role,
        team,
        status: 'active',
        createdAt: nowISO(),
        lastActive: nowISO(),
      },
      ...rows,
    ]
    persist(next)
    resetForm()
    toast({ title: 'Member added', description: `${firstName} ${lastName} has been added to the team.`, type: 'success' })
  }

  const handleSaveEdit = (nextUser) => {
    const existingSA = rows.find(u => u.role === 'superadmin' && u.id !== nextUser.id)
    if (nextUser.role === 'superadmin' && existingSA) {
      if (!window.confirm(`Assigning Super Admin to ${nextUser.name} will remove it from ${existingSA.name}. Continue?`)) return
      const next = rows.map(r => {
        if (r.id === nextUser.id) return nextUser
        if (r.id === existingSA.id) return { ...r, role: 'admin', team: 'admin' }
        return r
      })
      persist(next)
    } else {
      persist(rows.map(r => (r.id === nextUser.id ? nextUser : r)))
    }
    setShowEdit(false)
    setEditing(null)
    toast({ title: 'Member updated', description: 'Changes saved successfully.', type: 'success' })
  }

  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      <PageHeader title="Team" subtitle="Manage team members and roles" />

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { resetForm(); setShowCreate(true) }}
          className="flex items-center gap-1.5 bg-blue-90 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add team member
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </button>
      </div>

      <div className="mb-4">
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={(id) => { setActiveFilter(id); setPage(1) }} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <SearchBar placeholder="Search by name, email, role..." value={search} onChange={setSearch} className="w-[320px]" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-grey-40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-[12px] text-grey-60 bg-transparent border border-grey-20 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-grey-40 transition-colors"
            >
              {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <p className="text-[12px] text-grey-40">{filtered.length} members</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        totalItems={filtered.length}
        pageSize={10}
        onPageChange={setPage}
        emptyState={{
          icon: Users,
          title: 'No team members yet',
          description: 'Add your first team member to get started.',
          actionLabel: 'Add team member',
          onAction: () => { resetForm(); setShowCreate(true) },
        }}
      />

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm() }} title="Add new team member" maxWidth="max-w-2xl">
        <div className="mb-4">
          <p className="text-[13px] text-grey-60">Create a new account for Sales, Service, Admin, Finance, or Super Admin roles.</p>
        </div>
        <UserForm value={form} onChange={setForm} disableSuperAdmin={hasSuperAdmin} />
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={() => { setShowCreate(false); resetForm() }}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleCreate()
              setShowCreate(false)
            }}
            className="px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            Add member
          </button>
        </div>
      </Modal>

      <CsvUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload team members (CSV)"
        subtitle="Headers supported: Name, Email, Role, Team, Phone, EmployeeId"
        expectedHeaders={['Name', 'Email', 'Role']}
        onImport={(importedRows) => {
          const nextUsers = importedRows.map((r) => {
            const name = (r.Name || r.name || '').trim()
            const [firstName, ...rest] = name.split(' ')
            const lastName = rest.join(' ').trim()
            const role = normalizeRole(r.Role || r.role)
            const team = normalizeTeam(r.Team || r.team, role)
            return {
              id: makeId(),
              firstName: (r.FirstName || r.firstName || firstName || '').trim(),
              lastName: (r.LastName || r.lastName || lastName || '').trim(),
              name: name || `${firstName} ${lastName}`.trim(),
              email: (r.Email || r.email || '').trim(),
              phone: cleanPhone(r.Phone || r.phone),
              employeeId: (r.EmployeeId || r.employeeId || r.EmployeeID || '').trim(),
              role,
              team,
              status: 'active',
              createdAt: nowISO(),
              lastActive: nowISO(),
            }
          })
          persist([...nextUsers, ...rows])
          toast({ title: 'Import complete', description: `${nextUsers.length} team members imported.`, type: 'success' })
        }}
      />

      <Modal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setEditing(null) }}
        title="Edit team member"
        maxWidth="max-w-2xl"
      >
        {editing && (
          <EditUserForm
            value={editing}
            onCancel={() => { setShowEdit(false); setEditing(null) }}
            onSave={handleSaveEdit}
            allUsers={rows}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          persist(rows.filter(r => r.id !== deleteTarget.id))
          toast({ title: 'Member removed', description: `${deleteTarget.name} has been removed.`, type: 'success' })
          setDeleteTarget(null)
        }}
        title="Delete team member?"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}

function EditUserForm({ value, onCancel, onSave, allUsers }) {
  const [draft, setDraft] = useState(value)
  const set = (k, v) => setDraft(prev => ({ ...prev, [k]: v }))

  const existingSA = allUsers.find(u => u.role === 'superadmin' && u.id !== value.id)

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <Field label="First Name" value={draft.firstName} onChange={(v) => { set('firstName', v); setDraft(prev => ({ ...prev, firstName: v, name: `${v} ${prev.lastName}`.trim() })) }} />
        <Field label="Last Name" value={draft.lastName} onChange={(v) => { set('lastName', v); setDraft(prev => ({ ...prev, lastName: v, name: `${prev.firstName} ${v}`.trim() })) }} />
        <Field label="Email" value={draft.email} onChange={(v) => set('email', v)} type="email" />
        <Field label="Phone" value={draft.phone} onChange={(v) => set('phone', v)} />
        <Field label="Employee ID" value={draft.employeeId} onChange={(v) => set('employeeId', v)} />
        <SelectField
          label="Role"
          value={draft.role}
          onChange={(v) => set('role', v)}
          options={Object.entries(roleLabels).map(([id, label]) => ({ id, label }))}
        />
        <SelectField
          label="Team"
          value={draft.team}
          onChange={(v) => set('team', v)}
          options={Object.entries(teamLabels).map(([id, label]) => ({ id, label }))}
        />
        <SelectField
          label="Status"
          value={draft.status}
          onChange={(v) => set('status', v)}
          options={[{ id: 'active', label: 'Active' }, { id: 'inactive', label: 'Inactive' }]}
        />
      </div>

      {draft.role === 'superadmin' && existingSA && (
        <p className="text-[12px] text-amber mt-3">
          Note: Saving will reassign Super Admin from {existingSA.name} to this user.
        </p>
      )}

      <div className="flex items-center justify-end gap-2 mt-6">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => onSave?.({ ...draft, phone: cleanPhone(draft.phone) })}
          className="px-4 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
        >
          Save changes
        </button>
      </div>
    </div>
  )
}
