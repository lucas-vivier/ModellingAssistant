import { useState } from 'react'
import { FileText, GitBranch, Sparkles } from 'lucide-react'
import DocumentPreview from './DocumentPreview'
import DiagramView from './DiagramView'
import PromptPreview from './PromptPreview'

function VisualizationPanel({ answers, questions, template, currentQuestionId }) {
  const [activeTab, setActiveTab] = useState('document')

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="panel-header flex items-center gap-2">
        <button
          onClick={() => setActiveTab('document')}
          className={`tab-button flex items-center gap-2 ${activeTab === 'document' ? 'active' : ''}`}
        >
          <FileText className="w-4 h-4" />
          Document
        </button>
        <button
          onClick={() => setActiveTab('diagram')}
          className={`tab-button flex items-center gap-2 ${activeTab === 'diagram' ? 'active' : ''}`}
        >
          <GitBranch className="w-4 h-4" />
          Diagram
        </button>
        <button
          onClick={() => setActiveTab('prompt')}
          className={`tab-button flex items-center gap-2 ${activeTab === 'prompt' ? 'active' : ''}`}
        >
          <Sparkles className="w-4 h-4" />
          Prompt
        </button>
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'document' && (
          <DocumentPreview
            answers={answers}
            questions={questions}
            template={template}
            currentQuestionId={currentQuestionId}
          />
        )}
        {activeTab === 'diagram' && (
          <DiagramView
            answers={answers}
            questions={questions}
            template={template}
            currentQuestionId={currentQuestionId}
          />
        )}
        {activeTab === 'prompt' && (
          <PromptPreview
            answers={answers}
            template={template}
          />
        )}
      </div>
    </div>
  )
}

export default VisualizationPanel
