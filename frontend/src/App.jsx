import { useState } from 'react'
import TemplateSelector from './components/TemplateSelector'
import Questionnaire from './components/Questionnaire'
import OutputViewer from './components/OutputViewer'
import TwoPanelLayout from './components/TwoPanelLayout'
import VisualizationPanel from './components/VisualizationPanel'
import InteractiveTutorial from './components/InteractiveTutorial'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const [view, setView] = useState('select') // 'select' | 'tutorial' | 'questionnaire' | 'results'
  const [session, setSession] = useState(null)
  const [outputs, setOutputs] = useState(null)
  const [progress, setProgress] = useState(null)

  // State for visualization panel
  const [answers, setAnswers] = useState({})
  const [questions, setQuestions] = useState([])
  const [currentQuestionId, setCurrentQuestionId] = useState(null)
  const [manualQuestionId, setManualQuestionId] = useState(null)

  const startQuestionnaire = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_name: templateId })
      })
      const data = await response.json()
      setSession(data)
      const nextView = templateId === 'scientific_model_project' ? 'tutorial' : 'questionnaire'
      setView(nextView)
      // Reset visualization state
      setAnswers({})
      setQuestions([])
      setCurrentQuestionId(null)
      setManualQuestionId(null)
      setProgress(null)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handleComplete = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/outputs`)
      const data = await response.json()
      setOutputs(data.outputs)
      setView('results')
    } catch (error) {
      console.error('Error generating outputs:', error)
    }
  }

  const handleRestart = () => {
    setSession(null)
    setOutputs(null)
    setAnswers({})
    setQuestions([])
    setCurrentQuestionId(null)
    setManualQuestionId(null)
    setProgress(null)
    setView('select')
  }

  // Callback when an answer is submitted
  const handleAnswerUpdate = (questionId, answer, allAnswers) => {
    setAnswers(allAnswers || {})
  }

  // Callback when status changes (questions, progress, etc.)
  const handleStatusUpdate = (status) => {
    if (status) {
      setAnswers(status.answers || {})
      setQuestions(status.questions || [])
      setCurrentQuestionId(status.next_question?.id || null)
      setProgress(status.progress || null)
      setManualQuestionId(prev => {
        if (!prev) return prev
        const stillVisible = status.questions?.some(q => q.id === prev)
        return stillVisible ? prev : null
      })
    }
  }

  const handleQuestionActivate = (questionId) => {
    setManualQuestionId(questionId)
  }

  const effectiveQuestionId = manualQuestionId || currentQuestionId

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            className="font-display text-xl font-semibold text-white cursor-pointer hover:text-accent transition-colors"
            onClick={handleRestart}
          >
            ComPath<span className="text-accent">.</span>
          </h1>
          {session && view !== 'select' && (
            <button
              onClick={handleRestart}
              className="text-sm text-ink-400 hover:text-white transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center p-5">
        {view === 'select' && (
          <div className="w-full max-w-2xl">
            <TemplateSelector onSelect={startQuestionnaire} />
          </div>
        )}

        {view === 'questionnaire' && session && (
          <div className="w-full max-w-7xl mx-auto">
            {progress && (
              <div className="mb-4 bg-ink-900/60 border border-ink-800 rounded-2xl px-5 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-ink-500">
                    {session.template_name}
                  </div>
                  <span className="text-sm text-ink-200">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}
            <TwoPanelLayout
              leftPanel={
                <Questionnaire
                  sessionId={session.session_id}
                  onComplete={handleComplete}
                  onAnswerUpdate={handleAnswerUpdate}
                  onStatusUpdate={handleStatusUpdate}
                  currentQuestionId={effectiveQuestionId}
                  onQuestionActivate={handleQuestionActivate}
                />
              }
              rightPanel={
                <VisualizationPanel
                  answers={answers}
                  questions={questions}
                  template={session.template}
                  currentQuestionId={effectiveQuestionId}
                />
              }
            />
          </div>
        )}

        {view === 'tutorial' && session && (
          <div className="w-full max-w-5xl mx-auto">
            <InteractiveTutorial
              onFinish={() => setView('questionnaire')}
              onSkip={() => setView('questionnaire')}
            />
          </div>
        )}

        {view === 'results' && outputs && (
          <div className="w-full max-w-4xl">
            <OutputViewer
              outputs={outputs}
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800/50 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-ink-500 text-sm">
          ComPath
        </div>
      </footer>
    </div>
  )
}

export default App
