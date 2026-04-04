import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

const TOOLTIP_POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export default function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <span
        className={`absolute z-50 pointer-events-none transition-opacity duration-150 whitespace-nowrap ${TOOLTIP_POSITIONS[position]} ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={!visible}
      >
        <span className="block bg-grey-95 text-white text-[11px] rounded-lg px-3 py-2 shadow-lg max-w-[250px] leading-relaxed whitespace-normal">
          {content}
        </span>
      </span>
    </span>
  )
}

export function HelpTooltip({ text }) {
  return (
    <Tooltip content={text}>
      <HelpCircle className="w-3.5 h-3.5 text-grey-40 hover:text-grey-60 cursor-help" />
    </Tooltip>
  )
}
