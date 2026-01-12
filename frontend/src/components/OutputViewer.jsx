import { useState } from 'react'
import { FileText, Copy, Check, RefreshCw, Download, Sparkles } from 'lucide-react'
import PromptViewer from './PromptViewer'

function OutputViewer({ outputs, onRestart }) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  const downloadAsFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderMarkdown = (content) => {
    // Basic markdown rendering
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    
    return `<div class="output-content"><p>${html}</p></div>`
  }

  if (!outputs || outputs.length === 0) {
    return (
      <div className="text-center py-12 text-ink-400">
        No output generated
      </div>
    )
  }

  const currentOutput = outputs[activeTab]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
          <Check className="w-8 h-8 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          ComPath complete!
        </h2>
        <p className="text-ink-400">
          Here are the documents generated from your answers
        </p>
      </div>

      {/* Tabs */}
      {outputs.length > 1 && (
        <div className="flex gap-2 mb-4">
          {outputs.map((output, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === index
                  ? 'bg-accent text-white'
                  : 'bg-ink-800 text-ink-400 hover:text-white'
              }`}
            >
              {output.type === 'prompt' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              {output.name}
            </button>
          ))}
        </div>
      )}

      {/* Output content */}
      {currentOutput.type === 'prompt' ? (
        <PromptViewer content={currentOutput.content} name={currentOutput.name} />
      ) : (
        <div className="question-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-ink-400">
              <FileText className="w-4 h-4" />
              <span className="text-sm">{currentOutput.name}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(currentOutput.content)}
                className="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => downloadAsFile(currentOutput.content, `${currentOutput.name}.md`)}
                className="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(currentOutput.content) }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onRestart}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          New ComPath
        </button>
      </div>
    </div>
  )
}

export default OutputViewer
