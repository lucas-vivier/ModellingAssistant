import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Check, Loader2 } from 'lucide-react'
import QuestionCard from './QuestionCard'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function Questionnaire({
  sessionId,
  onComplete,
  onAnswerUpdate,
  onStatusUpdate,
  currentQuestionId,
  onQuestionActivate
}) {
  const [status, setStatus] = useState(null)
  const [localAnswers, setLocalAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [observedQuestionId, setObservedQuestionId] = useState(null)
  const [showSections, setShowSections] = useState(true)
  const questionRefs = useRef({})
  const visibleRatios = useRef({})
  const saveTimeouts = useRef({})

  useEffect(() => {
    fetchStatus()
  }, [sessionId])

  const activeQuestionId = currentQuestionId || status?.next_question?.id

  const scrollToQuestion = useCallback((questionId, behavior = 'smooth') => {
    if (!questionId) return
    const element = questionRefs.current[questionId]
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' })
    }
  }, [])

  // Scroll to active question when it changes
  useEffect(() => {
    scrollToQuestion(activeQuestionId)
  }, [activeQuestionId, scrollToQuestion])

  const { sections, questionSectionMap } = useMemo(() => {
    const list = []
    const map = {}
    let currentSection = null

    const shortSectionTitles = {
      'Project Identification': 'Project',
      'Datasets': 'Data',
      'Model Type & Theoretical Framework': 'Model',
      'Data Sources & Inputs': 'Data',
      'Model Parameters & Calibration': 'Parameters',
      'Sensitivity Analysis': 'Sensitivity',
      'Uncertainty Quantification': 'Uncertainty',
      'Validation & Verification': 'Validation',
      'Outputs': 'Output',
      'Outputs & Visualization': 'Output',
      'Reproducibility & Replication Package': 'Replication',
      'Reproducibility & Open Science': 'Reproducibility',
      'Documentation & Data Availability': 'Documentation',
      'Documentation': 'Documentation',
      'Technical Stack & Tools': 'Tech Stack',
      'Technical Implementation': 'Implementation',
      'Project Timeline & Team': 'Timeline',
      'Project Management & Governance': 'Management'
    }

    const slugify = (value) => value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    if (!status?.questions) {
      return { sections: list, questionSectionMap: map }
    }

    status.questions.forEach((question) => {
      const sectionName = question.section || currentSection || 'General'
      const shortTitle = shortSectionTitles[sectionName] || sectionName
      if (!currentSection || question.section) {
        if (sectionName !== currentSection) {
          list.push({
            id: slugify(sectionName) || 'general',
            title: shortTitle,
            questionIds: [],
            total: 0,
            answered: 0
          })
        }
      }
      currentSection = sectionName
      const current = list[list.length - 1]
      if (!current) return
      current.questionIds.push(question.id)
      current.total += 1
      if (question.answered) {
        current.answered += 1
      }
      map[question.id] = current.id
    })

    return { sections: list, questionSectionMap: map }
  }, [status?.questions])

  const activeSectionId = useMemo(() => {
    if (activeQuestionId && questionSectionMap[activeQuestionId]) {
      return questionSectionMap[activeQuestionId]
    }
    return sections[0]?.id || null
  }, [activeQuestionId, questionSectionMap, sections])

  const highlightSectionId = useMemo(() => {
    if (observedQuestionId && questionSectionMap[observedQuestionId]) {
      return questionSectionMap[observedQuestionId]
    }
    return activeSectionId
  }, [activeSectionId, observedQuestionId, questionSectionMap])

  useEffect(() => {
    if (!status?.questions?.length) return undefined

    visibleRatios.current = {}
    const observer = new IntersectionObserver((entries) => {
      let changed = false
      entries.forEach((entry) => {
        const id = entry.target.dataset.questionId
        if (!id) return
        if (entry.isIntersecting) {
          visibleRatios.current[id] = entry.intersectionRatio
          changed = true
        } else if (visibleRatios.current[id]) {
          delete visibleRatios.current[id]
          changed = true
        }
      })

      if (!changed) return
      const best = Object.entries(visibleRatios.current)
        .sort((a, b) => b[1] - a[1])[0]
      if (best) {
        setObservedQuestionId(best[0])
      }
    }, { threshold: [0.35, 0.6, 0.85] })

    Object.values(questionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [status?.questions])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/status`)
      const data = await response.json()
      setStatus(data)
      // Initialize local answers from server
      setLocalAnswers(data.answers || {})
      // Notify parent of initial status
      onStatusUpdate?.(data)
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAnswer = useCallback(async (questionId, answer) => {
    setSaving(prev => ({ ...prev, [questionId]: true }))
    try {
      const response = await fetch(`${API_BASE}/session/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questionId,
          answer: answer
        })
      })
      const data = await response.json()
      setStatus(data)
      // Sync local answers with server response
      setLocalAnswers(data.answers || {})
      // Notify parent of answer update
      onAnswerUpdate?.(questionId, answer, data.answers)
      onStatusUpdate?.(data)
    } catch (error) {
      console.error('Error saving answer:', error)
    } finally {
      setSaving(prev => ({ ...prev, [questionId]: false }))
    }
  }, [sessionId, onAnswerUpdate, onStatusUpdate])

  const handleAnswerChange = useCallback((questionId, answer) => {
    // Update local state immediately
    setLocalAnswers(prev => ({ ...prev, [questionId]: answer }))

    // Debounce the save
    if (saveTimeouts.current[questionId]) {
      clearTimeout(saveTimeouts.current[questionId])
    }

    saveTimeouts.current[questionId] = setTimeout(() => {
      saveAnswer(questionId, answer)
    }, 500)
  }, [saveAnswer])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts.current).forEach(clearTimeout)
    }
  }, [])

  const canFinish = () => {
    if (!status?.questions) return false

    // Check all required visible questions have answers
    return status.questions.every(q => {
      if (!q.required) return true

      const answer = localAnswers[q.id]
      if (q.type === 'multi_choice') {
        return Array.isArray(answer) && answer.length > 0
      }
      return answer !== null && answer !== undefined && answer !== ''
    })
  }

  const handleFinish = () => {
    if (canFinish()) {
      onComplete(sessionId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  if (!status) {
    return (
      <div className="text-center py-12 text-ink-400">
        Loading error
      </div>
    )
  }

  const { questions } = status

  return (
    <div className="animate-fade-in">
      {/* Sections + questions */}
      <div className="flex flex-col lg:flex-row gap-4">
        {sections.length > 1 && (
          <div className="section-nav lg:sticky lg:top-20 lg:self-start lg:w-52">
            <div className="section-nav-header">
              <div className="section-nav-title">Sections</div>
              <button
                type="button"
                className="section-nav-toggle"
                onClick={() => setShowSections(prev => !prev)}
              >
                {showSections ? 'Hide' : 'Show'}
              </button>
            </div>
            {showSections && (
              <div className="section-nav-list">
                {sections.map((section) => {
                  const isActive = section.id === highlightSectionId
                  const firstQuestionId = section.questionIds[0]
                  return (
                    <button
                      key={section.id}
                      type="button"
                    onClick={() => {
                      setObservedQuestionId(null)
                      if (firstQuestionId) {
                        onQuestionActivate?.(firstQuestionId)
                        scrollToQuestion(firstQuestionId)
                      }
                    }}
                      className={`section-nav-button ${isActive ? 'active' : ''}`}
                    >
                      <span>{section.title}</span>
                      <span className="section-nav-count">
                        {section.answered}/{section.total}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-5 flex-1">
          {questions.map((question) => {
            const isAnswered = question.answered
            const isCurrent = question.id === activeQuestionId
            const isUpcoming = !isAnswered && !isCurrent
            const isSaving = saving[question.id]

            return (
              <div
                key={question.id}
                ref={(el) => {
                  if (el) {
                    questionRefs.current[question.id] = el
                  } else {
                    delete questionRefs.current[question.id]
                  }
                }}
                data-question-id={question.id}
                className="relative question-scroll-target"
                onClick={() => {
                  setObservedQuestionId(null)
                  onQuestionActivate?.(question.id)
                  scrollToQuestion(question.id)
                }}
              >
                <QuestionCard
                  question={question}
                  value={localAnswers[question.id] ?? question.answer ?? null}
                  onChange={(val) => handleAnswerChange(question.id, val)}
                  status={isAnswered ? 'answered' : isCurrent ? 'current' : 'upcoming'}
                  disabled={false}
                />
                {isSaving && (
                  <div className="absolute top-4 right-4">
                    <Loader2 className="w-4 h-4 text-ink-400 animate-spin" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Finish button */}
      <div className="flex justify-end mt-6 pb-6">
        <button
          onClick={handleFinish}
          disabled={!canFinish()}
          className="btn-primary flex items-center gap-2"
        >
          Finish
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Questionnaire
