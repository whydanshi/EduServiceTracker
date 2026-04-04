import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-full bg-grey-10 flex items-center justify-center text-grey-40">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-grey-95 mt-4">{title}</h3>
      <p className="text-[13px] text-grey-60 mt-1.5 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 bg-blue-90 text-white rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-blue-50 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
