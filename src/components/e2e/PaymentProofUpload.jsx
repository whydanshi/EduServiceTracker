import { useState } from 'react'
import { Upload, Image, X } from 'lucide-react'

export default function PaymentProofUpload({ onUpload }) {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      onUpload?.(file, reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName('')
  }

  if (preview) {
    return (
      <div className="relative inline-block">
        <img src={preview} alt="Payment proof" className="w-20 h-20 object-cover rounded-lg border border-grey-20" />
        <button onClick={handleClear} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red text-white rounded-full flex items-center justify-center">
          <X className="w-3 h-3" />
        </button>
        <p className="text-[10px] text-grey-40 mt-1 truncate max-w-[80px]">{fileName}</p>
      </div>
    )
  }

  return (
    <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-dashed border-grey-40 rounded-lg cursor-pointer hover:bg-grey-5 transition-colors">
      <Upload className="w-3.5 h-3.5 text-grey-40" />
      <span className="text-[12px] text-grey-60">Upload Proof</span>
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  )
}
