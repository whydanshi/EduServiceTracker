export default function PageHeader({ title, children, leftAction }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          {leftAction}
          <h1 className="text-[24px] font-semibold text-grey-95 tracking-tight leading-tight">{title}</h1>
        </div>
        {children && <div className="flex items-center gap-3 flex-shrink-0">{children}</div>}
      </div>
    </div>
  )
}
