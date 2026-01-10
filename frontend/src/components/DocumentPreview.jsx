import { useMemo } from 'react'

function DocumentPreview({ answers, questions, template, currentQuestionId }) {
  // Build a map of question IDs to their status
  const questionStatus = useMemo(() => {
    const statusMap = {}
    if (!questions) return statusMap

    questions.forEach(q => {
      if (q.answered) {
        statusMap[q.id] = 'answered'
      } else if (q.id === currentQuestionId) {
        statusMap[q.id] = 'current'
      } else {
        statusMap[q.id] = 'pending'
      }
    })
    return statusMap
  }, [questions, currentQuestionId])

  // Build a map of question IDs to their labels (for options)
  const optionLabels = useMemo(() => {
    const labels = {}
    if (!questions) return labels

    questions.forEach(q => {
      if (q.options) {
        labels[q.id] = {}
        q.options.forEach(opt => {
          labels[q.id][opt.id] = opt.label
        })
      }
    })
    return labels
  }, [questions])

  // Format answer value for display
  const formatAnswer = (questionId, value) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    // Handle multi-choice (array of option IDs)
    if (Array.isArray(value)) {
      const labels = optionLabels[questionId]
      if (labels) {
        return value.map(v => labels[v] || v).join(', ')
      }
      return value.join(', ')
    }

    // Handle single-choice (option ID)
    const labels = optionLabels[questionId]
    if (labels && labels[value]) {
      return labels[value]
    }

    return value
  }

  // Get status class for a question
  const getStatusClass = (questionId) => {
    const status = questionStatus[questionId]
    return `status-section status-${status || 'pending'}`
  }

  // Group questions into sections for the document view
  const sections = useMemo(() => {
    if (!questions) return []

    return [
      {
        title: 'Project Identity',
        questions: ['project_name', 'project_description', 'project_type']
      },
      {
        title: 'Technology Stack',
        questions: ['languages', 'python_framework', 'js_framework']
      },
      {
        title: 'Data Architecture',
        questions: ['data_input', 'database_type']
      },
      {
        title: 'Organization',
        questions: ['team_size', 'timeline']
      },
      {
        title: 'Quality & Documentation',
        questions: ['testing_strategy', 'documentation', 'ci_cd']
      },
      {
        title: 'Deployment',
        questions: ['deployment']
      },
      {
        title: 'Additional Notes',
        questions: ['additional_notes']
      }
    ]
  }, [questions])

  // Get question label by ID
  const getQuestionLabel = (questionId) => {
    const q = questions?.find(q => q.id === questionId)
    if (!q) return questionId
    // Simplify question text for display
    return q.question.replace(/\?$/, '').replace(/^What is (your )?/i, '').replace(/^Which /i, '')
  }

  // Check if a question is visible
  const isQuestionVisible = (questionId) => {
    return questions?.some(q => q.id === questionId)
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-ink-500">
        <p>Start answering questions to see your specification take shape.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Document Title */}
      <div className={getStatusClass('project_name')}>
        <h1 className="text-2xl font-display font-bold text-white mb-1">
          {answers?.project_name ? (
            <>Project: {answers.project_name}</>
          ) : (
            <span className="text-ink-500 italic">Project Name</span>
          )}
        </h1>
        {answers?.project_description ? (
          <p className="text-ink-300 text-sm">{answers.project_description}</p>
        ) : questionStatus['project_description'] !== 'answered' && (
          <p className="text-ink-500 text-sm italic">Description pending...</p>
        )}
      </div>

      {/* Sections */}
      {sections.map(section => {
        // Only show section if at least one question is visible
        const visibleQuestions = section.questions.filter(qId => isQuestionVisible(qId))
        if (visibleQuestions.length === 0) return null

        // Skip if section is just project name/description (already shown above)
        if (section.title === 'Project Identity') {
          const otherQuestions = visibleQuestions.filter(qId => qId !== 'project_name' && qId !== 'project_description')
          if (otherQuestions.length === 0) return null

          return (
            <div key={section.title} className="mt-6">
              <h2 className="text-lg font-display font-semibold text-ink-200 mb-3">{section.title}</h2>
              {otherQuestions.map(questionId => {
                const value = formatAnswer(questionId, answers?.[questionId])
                return (
                  <div key={questionId} className={getStatusClass(questionId)}>
                    <span className="text-ink-400 text-sm">{getQuestionLabel(questionId)}</span>
                    {value ? (
                      <p className="text-white font-medium">{value}</p>
                    ) : (
                      <p className="text-ink-500 italic">Awaiting answer...</p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        return (
          <div key={section.title} className="mt-6">
            <h2 className="text-lg font-display font-semibold text-ink-200 mb-3">{section.title}</h2>
            {visibleQuestions.map(questionId => {
              const value = formatAnswer(questionId, answers?.[questionId])
              return (
                <div key={questionId} className={getStatusClass(questionId)}>
                  <span className="text-ink-400 text-sm">{getQuestionLabel(questionId)}</span>
                  {value ? (
                    <p className="text-white font-medium">{value}</p>
                  ) : (
                    <p className="text-ink-500 italic">Awaiting answer...</p>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-ink-800">
        <div className="flex items-center gap-6 text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-l-2 border-green-500/60 bg-green-500/10"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-l-2 border-amber-500/60 bg-amber-500/10"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-l-2 border-ink-700 bg-ink-900/30 opacity-50"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentPreview
