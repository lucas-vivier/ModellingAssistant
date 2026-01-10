import { useState, useEffect } from 'react'
import { FileText, ArrowRight, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/templates`)
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-white mb-3">
          Choose a questionnaire
        </h2>
        <p className="text-ink-400 max-w-md mx-auto">
          Select a template to get started. Questions will dynamically adapt
          to your answers.
        </p>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="w-full group question-card flex items-center gap-5 text-left hover:border-accent/50 transition-all duration-300"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-white text-lg group-hover:text-accent transition-colors">
                {template.name}
              </h3>
              <p className="text-ink-400 text-sm mt-1 line-clamp-2">
                {template.description}
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-ink-500 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-ink-500">
          No templates available
        </div>
      )}
    </div>
  )
}

export default TemplateSelector
