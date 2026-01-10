import { useState } from 'react'
import TemplateSelector from './components/TemplateSelector'
import Questionnaire from './components/Questionnaire'
import OutputViewer from './components/OutputViewer'
import TwoPanelLayout from './components/TwoPanelLayout'
import VisualizationPanel from './components/VisualizationPanel'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const [view, setView] = useState('select') // 'select' | 'questionnaire' | 'results'
  const [session, setSession] = useState(null)
  const [outputs, setOutputs] = useState(null)

  // State for visualization panel
  const [answers, setAnswers] = useState({})
  const [questions, setQuestions] = useState([])
  const [currentQuestionId, setCurrentQuestionId] = useState(null)

  const startQuestionnaire = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_name: templateId })
      })
      const data = await response.json()
      setSession(data)
      setView('questionnaire')
      // Reset visualization state
      setAnswers({})
      setQuestions([])
      setCurrentQuestionId(null)
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
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            className="font-display text-xl font-semibold text-white cursor-pointer hover:text-accent transition-colors"
            onClick={handleRestart}
          >
            Questionnaire<span className="text-accent">.</span>
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
      <main className="flex-1 flex items-start justify-center p-6">
        {view === 'select' && (
          <div className="w-full max-w-2xl">
            <TemplateSelector onSelect={startQuestionnaire} />
          </div>
        )}

        {view === 'questionnaire' && session && (
          <TwoPanelLayout
            leftPanel={
              <Questionnaire
                sessionId={session.session_id}
                templateName={session.template_name}
                onComplete={handleComplete}
                onAnswerUpdate={handleAnswerUpdate}
                onStatusUpdate={handleStatusUpdate}
              />
            }
            rightPanel={
              <VisualizationPanel
                answers={answers}
                questions={questions}
                template={session.template}
                currentQuestionId={currentQuestionId}
              />
            }
          />
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
          Dynamic Questionnaire
        </div>
      </footer>
    </div>
  )
}

export default App
