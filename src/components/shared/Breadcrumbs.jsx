import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items }) {
  if (!items?.length) return null

  return (
    <nav className="flex items-center gap-1.5 mb-4" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1

        return (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight className="w-3 h-3 text-grey-40 shrink-0" aria-hidden />
            )}
            {isLast ? (
              <span className="text-[12px] text-grey-70 font-medium">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="text-[12px] text-grey-40 hover:text-blue-90 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[12px] text-grey-40">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
