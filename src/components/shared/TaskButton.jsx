import { ArrowUpRight } from 'lucide-react'

export default function TaskButton({ label, onClick, href, className = '' }) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (href) {
      window.open(`${href}?standalone=true`, '_blank')
    } else {
      onClick?.(e)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-[6px] rounded-lg text-[12px] font-medium bg-blue-10 text-blue-90 hover:bg-blue-20 transition-colors ${className}`}
    >
      {label}
      <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  )
}
