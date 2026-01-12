import { useMemo } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { useState } from 'react'

function PromptPreview({ answers, template }) {
  const [copied, setCopied] = useState(false)

  const optionLabels = useMemo(() => {
    const labels = {}
    if (!template?.questions) return labels

    template.questions.forEach(question => {
      if (question.options) {
        labels[question.id] = {}
        question.options.forEach(opt => {
          labels[question.id][opt.id] = opt.label
        })
      }
    })

    return labels
  }, [template])

  const defaultAnswers = useMemo(() => {
    const defaults = {}
    if (!template?.questions) return defaults

    template.questions.forEach(question => {
      if (question.default !== undefined && question.default !== null && question.default !== '') {
        defaults[question.id] = question.default
      }
    })

    return defaults
  }, [template])

  const buildDataInventoryTable = (entries) => {
    if (!entries || entries.length === 0) return ''
    const headers = [
      'Dataset',
      'Source type',
      'Source link',
      'Resolution',
      'Format',
      'Privacy',
      'Size',
      'Test extract'
    ]
    const sourceTypeLabels = {
      survey_micro: 'Household/firm survey data',
      admin_data: 'Administrative data',
      satellite: 'Satellite / Remote sensing data',
      time_series: 'Time series (macro indicators)',
      cross_section: 'Cross-sectional data',
      panel: 'Panel data',
      experimental: 'Experimental / RCT data',
      synthetic: 'Synthetic / Simulated data',
      literature: 'Parameters from literature',
      api: 'External API (World Bank, IEA, etc.)'
    }
    const privacyLabels = {
      public: 'Public',
      restricted_shareable: 'Restricted (shareable with agreement)',
      confidential: 'Confidential'
    }
    const lines = [
      `| ${headers.join(' | ')} |`,
      `| ${headers.map(() => '---').join(' | ')} |`
    ]
    entries.forEach((entry) => {
      const row = [
        entry.dataset_name || '',
        sourceTypeLabels[entry.source_type] || entry.source_type || '',
        entry.source_link || '',
        entry.resolution || '',
        entry.data_format || '',
        privacyLabels[entry.privacy] || entry.privacy || '',
        entry.size || '',
        entry.extract_plan || ''
      ]
      lines.push(`| ${row.join(' | ')} |`)
    })
    return lines.join('\n')
  }

  const resolvedAnswers = useMemo(() => {
    const merged = { ...defaultAnswers }
    if (!answers) return merged

    Object.entries(answers).forEach(([key, value]) => {
      const isMeaningful = (() => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim() !== ''
        if (Array.isArray(value)) return value.length > 0
        return true
      })()

      if (isMeaningful) {
        merged[key] = value
      }
    })

    if (Array.isArray(merged.data_inventory)) {
      merged.data_inventory_table = buildDataInventoryTable(merged.data_inventory)
    }

    return merged
  }, [answers, defaultAnswers])

  // Find the prompt output template
  const promptOutput = useMemo(() => {
    if (!template?.outputs) return null
    return template.outputs.find(o => o.type === 'prompt')
  }, [template])

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return ''

    if (Array.isArray(value)) {
      const labels = optionLabels[key]
      if (labels) {
        return value.map(v => labels[v] || v).join(', ')
      }
      return value.join(', ')
    }

    const labels = optionLabels[key]
    if (labels && labels[value]) {
      return labels[value]
    }

    return value
  }

  const evaluateCondition = (condition) => {
    const trimmed = condition.trim()

    const containsMatch = trimmed.match(/^(\w+)\s+contains\s+'([^']+)'$/)
    if (containsMatch) {
      const [, varName, needle] = containsMatch
      const value = resolvedAnswers[varName]
      if (Array.isArray(value)) {
        return value.includes(needle)
      }
      if (typeof value === 'string') {
        return value.includes(needle)
      }
      return false
    }

    const notContainsMatch = trimmed.match(/^(\w+)\s+not_contains\s+'([^']+)'$/)
    if (notContainsMatch) {
      const [, varName, needle] = notContainsMatch
      const value = resolvedAnswers[varName]
      if (Array.isArray(value)) {
        return !value.includes(needle)
      }
      if (typeof value === 'string') {
        return !value.includes(needle)
      }
      return true
    }

    const inMatch = trimmed.match(/^(\w+)\s+in\s+\[([^\]]+)\]$/)
    if (inMatch) {
      const [, varName, list] = inMatch
      const items = list.split(',').map(item => item.trim().replace(/^'|'$/g, ''))
      const value = resolvedAnswers[varName]
      if (Array.isArray(value)) {
        return value.some(v => items.includes(v))
      }
      return items.includes(value)
    }

    return Boolean(resolvedAnswers[trimmed])
  }

  // Render the template with current answers (same logic as backend)
  const renderedPrompt = useMemo(() => {
    if (!promptOutput?.template) return ''

    let result = promptOutput.template

    // Handle conditionals: {% if var %}...{% endif %}
    const conditionalPattern = /\{%\s*if\s+(.+?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g
    result = result.replace(conditionalPattern, (match, condition, content) => {
      return evaluateCondition(condition) ? content : ''
    })

    // Replace variables: {{var}}
    Object.entries(resolvedAnswers).forEach(([key, value]) => {
      const displayValue = formatValue(key, value)
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), displayValue)
    })

    // Clean up any remaining unreplaced variables (show placeholder)
    result = result.replace(/\{\{(\w+)\}\}/g, '[$1]')

    return result.trim()
  }, [promptOutput, resolvedAnswers, optionLabels])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(renderedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  if (!promptOutput) {
    return (
      <div className="flex items-center justify-center h-full text-ink-500">
        <p>No prompt template defined</p>
      </div>
    )
  }

  const hasAnswers = Object.keys(answers || {}).length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="prompt-badge">
            <Sparkles className="w-3 h-3" />
            {promptOutput.name || 'AI Prompt'}
          </div>
          <span className="text-xs text-ink-500">
            {renderedPrompt.length.toLocaleString()} chars
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-ink-800 text-ink-300 hover:text-white hover:bg-ink-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Prompt content */}
      <div className="flex-1 overflow-auto">
        <div className="prompt-preview-content">
          <pre className="whitespace-pre-wrap font-mono text-sm text-ink-200 leading-relaxed">
            {renderedPrompt}
          </pre>
        </div>
      </div>

      {/* Progress hint */}
      <div className="mt-4 pt-4 border-t border-ink-800">
        <p className="text-xs text-ink-500">
          {hasAnswers
            ? 'This prompt updates in real-time as you answer questions. Copy it when ready to use with your preferred AI.'
            : 'Defaults are pre-filled. Start answering to personalize the prompt.'}
        </p>
      </div>
    </div>
  )
}

export default PromptPreview
