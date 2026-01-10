import { useMemo } from 'react'

function DiagramView({ answers, questions, template, currentQuestionId }) {
  // Build question status map
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

  // Group questions into input categories
  const inputGroups = useMemo(() => {
    if (!questions) return []

    const groups = [
      {
        id: 'identity',
        label: 'Project Identity',
        questions: questions.filter(q => ['project_name', 'project_description', 'project_type'].includes(q.id))
      },
      {
        id: 'tech',
        label: 'Technology',
        questions: questions.filter(q => ['languages', 'python_framework', 'js_framework'].includes(q.id))
      },
      {
        id: 'data',
        label: 'Data',
        questions: questions.filter(q => ['data_input', 'database_type'].includes(q.id))
      },
      {
        id: 'org',
        label: 'Organization',
        questions: questions.filter(q => ['team_size', 'timeline', 'ci_cd'].includes(q.id))
      },
      {
        id: 'quality',
        label: 'Quality',
        questions: questions.filter(q => ['testing_strategy', 'documentation'].includes(q.id))
      },
      {
        id: 'deploy',
        label: 'Deployment',
        questions: questions.filter(q => ['deployment', 'additional_notes'].includes(q.id))
      }
    ]

    return groups.filter(g => g.questions.length > 0)
  }, [questions])

  // Calculate group status (best status of its questions)
  const getGroupStatus = (group) => {
    const statuses = group.questions.map(q => questionStatus[q.id])
    if (statuses.some(s => s === 'current')) return 'current'
    if (statuses.every(s => s === 'answered')) return 'answered'
    if (statuses.some(s => s === 'answered')) return 'partial'
    return 'pending'
  }

  // Get node class based on status
  const getNodeClass = (status) => {
    if (status === 'answered' || status === 'partial') return 'diagram-node-answered'
    if (status === 'current') return 'diagram-node-current'
    return 'diagram-node-pending'
  }

  const getTextClass = (status) => {
    if (status === 'answered' || status === 'partial') return 'diagram-text-answered'
    if (status === 'current') return 'diagram-text-current'
    return 'diagram-text-pending'
  }

  // Calculate if flow to algorithm is active
  const hasAnyAnswered = useMemo(() => {
    return Object.values(questionStatus).some(s => s === 'answered')
  }, [questionStatus])

  // Calculate if algorithm to output is active
  const allAnswered = useMemo(() => {
    if (!questions || questions.length === 0) return false
    return questions.every(q => !q.required || questionStatus[q.id] === 'answered')
  }, [questions, questionStatus])

  // SVG dimensions
  const width = 700
  const height = 500
  const nodeWidth = 140
  const nodeHeight = 50
  const nodeRadius = 12

  // Calculate positions
  const inputX = 30
  const algorithmX = width / 2 - nodeWidth / 2
  const outputX = width - nodeWidth - 30
  const centerY = height / 2

  // Input nodes positions
  const inputNodes = inputGroups.map((group, i) => {
    const totalHeight = inputGroups.length * (nodeHeight + 20) - 20
    const startY = (height - totalHeight) / 2
    return {
      ...group,
      x: inputX,
      y: startY + i * (nodeHeight + 20),
      status: getGroupStatus(group)
    }
  })

  // Output nodes
  const outputs = [
    { id: 'spec', label: 'Project Spec', status: allAnswered ? 'answered' : 'pending' },
    { id: 'prompt', label: 'AI Prompt', status: allAnswered ? 'answered' : 'pending' }
  ]

  const outputNodes = outputs.map((output, i) => {
    const totalHeight = outputs.length * (nodeHeight + 40) - 40
    const startY = (height - totalHeight) / 2
    return {
      ...output,
      x: outputX,
      y: startY + i * (nodeHeight + 40)
    }
  })

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-ink-500">
        <p>Start answering questions to see the flow diagram.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[60vh]">
        {/* Connection lines from inputs to algorithm */}
        {inputNodes.map(node => (
          <path
            key={`line-${node.id}`}
            d={`M ${node.x + nodeWidth} ${node.y + nodeHeight / 2}
                Q ${algorithmX - 30} ${node.y + nodeHeight / 2},
                  ${algorithmX} ${centerY}`}
            className={node.status !== 'pending' ? 'diagram-line-active' : 'diagram-line'}
          />
        ))}

        {/* Connection lines from algorithm to outputs */}
        {outputNodes.map(node => (
          <path
            key={`line-out-${node.id}`}
            d={`M ${algorithmX + nodeWidth} ${centerY}
                Q ${outputX - 30} ${centerY},
                  ${outputX} ${node.y + nodeHeight / 2}`}
            className={allAnswered ? 'diagram-line-active' : 'diagram-line'}
          />
        ))}

        {/* Input nodes */}
        {inputNodes.map(node => (
          <g key={node.id} className="diagram-node">
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={nodeRadius}
              className={getNodeClass(node.status)}
              strokeWidth="2"
            />
            <text
              x={node.x + nodeWidth / 2}
              y={node.y + nodeHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-medium ${getTextClass(node.status)}`}
            >
              {node.label}
            </text>
            {/* Question count badge */}
            <g transform={`translate(${node.x + nodeWidth - 8}, ${node.y - 8})`}>
              <circle
                r="10"
                className={node.status === 'answered' ? 'fill-green-500/20 stroke-green-500/60' : 'fill-ink-800 stroke-ink-600'}
                strokeWidth="1"
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] ${node.status === 'answered' ? 'fill-green-400' : 'fill-ink-400'}`}
              >
                {node.questions.filter(q => questionStatus[q.id] === 'answered').length}/{node.questions.length}
              </text>
            </g>
          </g>
        ))}

        {/* Algorithm node (center) */}
        <g className="diagram-node">
          <rect
            x={algorithmX}
            y={centerY - 35}
            width={nodeWidth}
            height={70}
            rx={nodeRadius}
            className={hasAnyAnswered ? 'diagram-node-answered' : 'diagram-node-pending'}
            strokeWidth="2"
          />
          <text
            x={algorithmX + nodeWidth / 2}
            y={centerY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-bold ${hasAnyAnswered ? 'diagram-text-answered' : 'diagram-text-pending'}`}
          >
            Questionnaire
          </text>
          <text
            x={algorithmX + nodeWidth / 2}
            y={centerY + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-xs ${hasAnyAnswered ? 'diagram-text-answered' : 'diagram-text-pending'}`}
          >
            Engine
          </text>
        </g>

        {/* Output nodes */}
        {outputNodes.map(node => (
          <g key={node.id} className="diagram-node">
            <rect
              x={node.x}
              y={node.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={nodeRadius}
              className={getNodeClass(node.status)}
              strokeWidth="2"
            />
            <text
              x={node.x + nodeWidth / 2}
              y={node.y + nodeHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xs font-medium ${getTextClass(node.status)}`}
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* Flow direction arrows */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-ink-600"
            />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-accent"
            />
          </marker>
        </defs>
      </svg>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-ink-800">
        <div className="flex items-center justify-center gap-6 text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-green-500/60 bg-green-500/10"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-amber-500/60 bg-amber-500/10"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-ink-600 bg-ink-800"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagramView
