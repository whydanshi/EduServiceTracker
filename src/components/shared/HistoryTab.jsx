import { User, CheckCircle2, CreditCard, MessageSquare, Clock } from 'lucide-react'

const iconMap = {
  created: { icon: User,         bg: 'bg-blue-10',      color: 'text-blue-90' },
  status:  { icon: CheckCircle2, bg: 'bg-green-light',  color: 'text-green' },
  payment: { icon: CreditCard,   bg: 'bg-purple-light', color: 'text-purple' },
  note:    { icon: MessageSquare, bg: 'bg-amber-light',  color: 'text-amber' },
}

export default function HistoryTab({ lead }) {
  const history = lead.history || []

  if (!history.length) {
    return (
      <div className="py-16 text-center">
        <Clock className="w-8 h-8 text-grey-20 mx-auto mb-3" />
        <p className="text-[13px] text-grey-40">No history recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 relative max-w-2xl">
      <div className="absolute left-[23px] top-0 bottom-0 w-px bg-grey-20" />
      {history.map((item, i) => {
        const { icon: Icon, bg, color } = iconMap[item.type] || iconMap.note
        return (
          <div key={i} className="flex gap-4 pb-6 relative">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0 z-10 border-2 border-white`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1 pt-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[13px] font-semibold text-grey-95">{item.action}</p>
                <p className="text-[11px] text-grey-40">{item.date} · {item.time}</p>
              </div>
              <p className="text-[12px] text-grey-60">{item.detail}</p>
              <p className="text-[11px] text-grey-40 mt-0.5">by {item.actor}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
