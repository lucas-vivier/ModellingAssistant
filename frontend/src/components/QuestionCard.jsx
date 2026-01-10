import { Check, CheckCircle } from 'lucide-react'

function QuestionCard({ question, value, onChange, status = 'current', disabled = false }) {
  const { type, question: questionText, placeholder, options, required } = question

  const isAnswered = status === 'answered'
  const isCurrent = status === 'current'
  const isUpcoming = status === 'upcoming'

  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            className="input-field"
            placeholder={placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoFocus={isCurrent}
          />
        )

      case 'textarea':
        return (
          <textarea
            className="input-field min-h-[120px] resize-y"
            placeholder={placeholder || ''}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoFocus={isCurrent}
          />
        )

      case 'single_choice':
        return (
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => !disabled && onChange(option.id)}
                disabled={disabled}
                className={`option-button flex items-center gap-3 ${
                  value === option.id ? 'selected' : ''
                } ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  value === option.id
                    ? 'border-accent bg-accent'
                    : 'border-ink-600'
                }`}>
                  {value === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )

      case 'multi_choice':
        const selectedValues = Array.isArray(value) ? value : []

        const toggleOption = (optionId) => {
          if (disabled) return
          if (selectedValues.includes(optionId)) {
            onChange(selectedValues.filter(v => v !== optionId))
          } else {
            onChange([...selectedValues, optionId])
          }
        }

        return (
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  disabled={disabled}
                  className={`option-button flex items-center gap-3 ${
                    isSelected ? 'selected' : ''
                  } ${disabled ? 'cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent'
                      : 'border-ink-600'
                  }`}>
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )

      default:
        return (
          <input
            type="text"
            className="input-field"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        )
    }
  }

  const cardClasses = [
    'question-card',
    'transition-all duration-300',
    isAnswered && 'border-green-500/30 bg-green-500/5',
    isCurrent && 'border-accent/50 ring-2 ring-accent/20',
    isUpcoming && 'opacity-50'
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-white mb-2">
            {questionText}
            {required && <span className="text-accent ml-1">*</span>}
          </h3>
          {isAnswered && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          )}
        </div>
        {placeholder && type !== 'text' && type !== 'textarea' && (
          <p className="text-ink-400 text-sm">{placeholder}</p>
        )}
      </div>

      {renderInput()}
    </div>
  )
}

export default QuestionCard
