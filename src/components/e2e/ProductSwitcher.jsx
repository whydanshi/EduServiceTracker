import { Globe, ArrowRightLeft } from 'lucide-react'

export default function ProductSwitcher({ currentProduct = 'e2e', hasGermanyAccess = true }) {
  if (!hasGermanyAccess) return null

  const germanyUrl = 'http://localhost:5173'
  const e2eUrl = 'http://localhost:5174'

  const otherProduct = currentProduct === 'e2e' ? 'germany' : 'e2e'
  const otherUrl = otherProduct === 'germany' ? germanyUrl : e2eUrl
  const otherLabel = otherProduct === 'germany' ? 'Germany' : 'E2E'

  return (
    <a
      href={otherUrl}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-grey-20 bg-white hover:bg-grey-5 transition-colors text-[12px] font-medium text-grey-60 hover:text-grey-95"
    >
      <ArrowRightLeft className="w-3.5 h-3.5" />
      Switch to {otherLabel}
    </a>
  )
}
