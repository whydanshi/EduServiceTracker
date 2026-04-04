import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'

export default function PocComments({ comments = [], onAddComment, readOnly = false, title = 'POC Notes & Comments' }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onAddComment?.({
      author: 'You',
      role: 'Service POC',
      text: text.trim(),
      date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    })
    setText('')
  }

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
        <MessageSquare className="w-4 h-4 text-grey-40" />
        <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
        <span className="text-[11px] text-grey-40 bg-grey-10 px-2 py-0.5 rounded-full">{comments.length}</span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {comments.length > 0 && (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[11px] font-bold text-blue-90 flex-shrink-0">
                  {c.author?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-grey-95">{c.author}</span>
                    {c.role && <span className="text-[10px] text-grey-40 bg-grey-10 px-1.5 py-0.5 rounded">{c.role}</span>}
                    <span className="text-[10px] text-grey-30 ml-auto">{c.date}</span>
                  </div>
                  <p className="text-[13px] text-grey-70 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {comments.length === 0 && (
          <p className="text-[12px] text-grey-30 text-center py-4">No comments yet</p>
        )}

        {!readOnly && (
          <div className="pt-3 border-t border-grey-10">
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={2}
                placeholder="Add your notes or feedback here..."
                className="flex-1 border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90 resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className={`self-end px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  text.trim() ? 'bg-blue-90 text-white hover:bg-blue-50' : 'bg-grey-10 text-grey-30 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-grey-30 mt-1.5">Press Cmd+Enter to send</p>
          </div>
        )}
      </div>
    </div>
  )
}
