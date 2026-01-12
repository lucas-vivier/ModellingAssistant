import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, GitBranch, Sparkles } from 'lucide-react'

function InteractiveTutorial({ onFinish, onSkip }) {
  const steps = useMemo(() => ([
    {
      title: 'Analytical framing',
      caption: 'Define the measurable question before touching code.',
      typing: [
        'Objective: estimate household energy demand response to price shocks.',
        'Hypothesis: elasticity differs by income quintile and technology uptake.',
        'Decision context: welfare impacts of efficiency policy over 2022-2030.'
      ].join('\n')
    },
    {
      title: 'Data + calibration',
      caption: 'Anchor the model with traceable inputs and targets.',
      typing: [
        'Data: National Household Survey 2022 (monthly panel).',
        'Calibration targets: literature elasticities + national accounts totals.',
        'Uncertainty: bootstrap intervals + scenario bands.'
      ].join('\n')
    },
    {
      title: 'Model flow',
      caption: 'A simple structure that is easy to audit.',
      typing: [
        'Inputs -> Estimation -> Simulation -> Validation -> Outputs',
        'Key equations: CES utility, demand system, welfare aggregation.',
        'Checks: analytical cases + out-of-sample validation.'
      ].join('\n')
    },
    {
      title: 'Exports',
      caption: 'Preview the artifacts generated at the end.',
      typing: [
        'Document: technical specification (methods, datasets, assumptions).',
        'Diagram: model flow with inputs, parameters, outputs.',
        'Prompt (VSCode): scaffold the repo and analysis entry point.'
      ].join('\n')
    },
    {
      title: 'Completion snapshot',
      caption: 'Everything looks filled-in and ready to export.',
      typing: [
        'Status: all sections completed.',
        'Artifacts: Document + Diagram + VSCode prompt.',
        'Next: open VSCode, paste the prompt, and run run_all.py.'
      ].join('\n')
    }
  ]), [])

  const [activeStep, setActiveStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const fullText = steps[activeStep]?.typing || ''
    let index = 0
    setTypedText('')
    setIsTyping(true)

    const interval = setInterval(() => {
      index += 1
      setTypedText(fullText.slice(0, index))
      if (index >= fullText.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 18)

    return () => clearInterval(interval)
  }, [activeStep, steps])

  const stepCount = steps.length
  const isLastStep = activeStep === stepCount - 1

  const handleNext = () => {
    if (isLastStep) {
      onFinish?.()
    } else {
      setActiveStep((prev) => Math.min(prev + 1, stepCount - 1))
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  const iconForStep = (index) => {
    if (index === 3) return <Sparkles className="w-4 h-4" />
    if (index === 2) return <GitBranch className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <div className="question-card animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink-500 mb-3">
            Interactive tutorial
          </div>
          <h2 className="font-display text-3xl font-semibold text-white mb-2">
            {steps[activeStep].title}
          </h2>
          <p className="text-ink-400 mb-6">
            {steps[activeStep].caption}
          </p>

          <div className="flex items-center gap-2 text-sm text-ink-400 mb-6">
            {iconForStep(activeStep)}
            Step {activeStep + 1} of {stepCount}
          </div>

          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={`step-${index}`}
                className={`h-2 rounded-full transition-all ${
                  index === activeStep ? 'w-10 bg-accent' : 'w-6 bg-ink-700'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary flex items-center gap-2"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              className="btn-primary flex items-center gap-2"
              onClick={handleNext}
            >
              {isLastStep ? 'Start questionnaire' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="text-sm text-ink-400 hover:text-white transition-colors ml-auto"
              onClick={onSkip}
            >
              Skip tutorial
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-ink-950/60 border border-ink-800 rounded-2xl p-5 min-h-[260px]">
            <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
              <span className="uppercase tracking-[0.2em]">Auto-typing preview</span>
              <span>{isTyping ? 'Typing...' : 'Complete'}</span>
            </div>
            <pre className="font-mono text-sm text-ink-200 whitespace-pre-wrap leading-relaxed">
              {typedText}
              {isTyping && <span className="typing-cursor">|</span>}
            </pre>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-400">
            <div className="border border-ink-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-ink-300 mb-2">
                <FileText className="w-4 h-4" />
                Document
              </div>
              Technical spec, datasets, assumptions.
            </div>
            <div className="border border-ink-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-ink-300 mb-2">
                <GitBranch className="w-4 h-4" />
                Diagram
              </div>
              Flow overview from data to outputs.
            </div>
            <div className="border border-ink-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-ink-300 mb-2">
                <Sparkles className="w-4 h-4" />
                Prompt
              </div>
              VSCode-ready scaffold prompt.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveTutorial
