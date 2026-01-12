import { useState, useMemo } from 'react'
import { Copy, Check, Download, Sparkles } from 'lucide-react'

function PromptViewer({ content, name }) {
  const [copied, setCopied] = useState(false)

  const charCount = useMemo(() => content?.length || 0, [content])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  const downloadAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'prompt'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!content) {
    return (
      <div className="text-center py-8 text-ink-400">
        No prompt content generated
      </div>
    )
  }

  return (
    <div className="prompt-container">
      <div className="prompt-header">
        <div className="flex items-center gap-3">
          <div className="prompt-badge">
            <Sparkles className="w-3 h-3" />
            AI Prompt
          </div>
          <span className="char-count">{charCount.toLocaleString()} characters</span>
        </div>

        <button
          onClick={downloadAsText}
          className="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors"
          title="Download as text file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="prompt-content">
        {content}
      </div>

      <div className="border-t border-ink-800 p-4">
        <button
          onClick={copyToClipboard}
          className={`prompt-copy-btn w-full justify-center ${copied ? 'copied' : ''}`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Prompt to Clipboard
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default PromptViewer
