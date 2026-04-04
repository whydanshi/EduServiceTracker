import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...', value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 bg-white border border-grey-20 rounded-lg px-3.5 py-2.5 focus-within:border-blue-30 focus-within:ring-2 focus-within:ring-blue-10 transition-all ${className}`}>
      <Search className="w-4 h-4 text-grey-40 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent text-[13px] text-grey-70 placeholder:text-grey-40 outline-none w-full"
      />
    </div>
  )
}
