import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, Loader2 } from 'lucide-react'
import QuestionCard from './QuestionCard'

const API_BASE = ''

function Questionnaire({ sessionId, templateName, onComplete, onAnswerUpdate, onStatusUpdate }) {
  const [status, setStatus] = useState(null)
  const [localAnswers, setLocalAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const currentQuestionRef = useRef(null)
  const saveTimeouts = useRef({})

  useEffect(() => {
    fetchStatus()
  }, [sessionId])

  // Scroll to current question when it changes
  useEffect(() => {
    if (currentQuestionRef.current) {
      currentQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status?.next_question?.id])

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

  const { progress, questions, next_question } = status

  return (
    <div className="animate-fade-in">
      {/* Header with progress */}
      <div className="mb-8 sticky top-0 bg-ink-950/95 backdrop-blur-sm py-4 -mx-6 px-6 z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink-400">{templateName}</span>
          <span className="text-sm text-ink-400">
            {progress.answered} / {progress.total}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* All questions */}
      <div className="space-y-6">
        {questions.map((question) => {
          const isAnswered = question.answered
          const isCurrent = question.id === next_question?.id
          const isUpcoming = !isAnswered && !isCurrent
          const isSaving = saving[question.id]

          return (
            <div
              key={question.id}
              ref={isCurrent ? currentQuestionRef : null}
              className="relative"
            >
              <QuestionCard
                question={question}
                value={localAnswers[question.id] ?? question.answer ?? null}
                onChange={(val) => handleAnswerChange(question.id, val)}
                status={isAnswered ? 'answered' : isCurrent ? 'current' : 'upcoming'}
                disabled={isUpcoming}
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

      {/* Finish button */}
      <div className="flex justify-end mt-8 pb-8">
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
