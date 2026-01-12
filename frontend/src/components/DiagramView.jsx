import { useMemo } from 'react'

function DiagramView({ answers, questions }) {
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

  const normalizeValues = (questionId, value) => {
    if (value === null || value === undefined || value === '') return []

    if (Array.isArray(value)) {
      const labels = optionLabels[questionId]
      return value.map(v => labels?.[v] || v).filter(Boolean)
    }

    const labels = optionLabels[questionId]
    if (labels && labels[value]) {
      return [labels[value]]
    }

    return [String(value)]
  }

  const shortLabels = {
    data_sources: 'Sources',
    data_description: 'Datasets',
    data_input: 'Inputs',
    database_type: 'Database',
    model_domain: 'Domain',
    model_type: 'Model type',
    theoretical_foundation: 'Theory',
    key_equations: 'Equations',
    parameter_types: 'Parameters',
    output_types: 'Outputs',
    figure_formats: 'Figure formats',
    table_format: 'Table formats'
  }

  const truncate = (value, max = 60) => (
    value.length > max ? `${value.slice(0, max - 1)}…` : value
  )

  const allItems = useMemo(() => {
    if (!questions) return []
    const items = []
    questions.forEach(question => {
      const values = normalizeValues(question.id, answers?.[question.id])
      if (values.length === 0) return
      items.push({
        id: question.id,
        section: question.section || 'General',
        question,
        values
      })
    })
    return items
  }, [questions, answers])

  const hasSectionMatch = (question, term) => {
    const section = (question.section || '').toLowerCase()
    return section.includes(term)
  }

  const dataIds = new Set(['data_sources', 'data_description', 'data_input', 'database_type'])
  const modelIds = new Set(['model_domain', 'model_type', 'theoretical_foundation', 'key_equations', 'parameter_types'])
  const outputIds = new Set(['output_types', 'figure_formats', 'table_format'])

  const dataItems = allItems.filter(item => dataIds.has(item.id) || hasSectionMatch(item.question, 'data'))
  const modelItems = allItems.filter(item => modelIds.has(item.id) || hasSectionMatch(item.question, 'model'))
  const outputItems = allItems.filter(item => outputIds.has(item.id) || hasSectionMatch(item.question, 'output'))

  const groupIds = new Set([
    ...dataItems.map(item => item.id),
    ...modelItems.map(item => item.id),
    ...outputItems.map(item => item.id)
  ])
  const otherItems = allItems.filter(item => !groupIds.has(item.id))

  const buildBoxes = (items, fallback) => {
    if (items.length === 0) {
      return [{ label: `Awaiting ${fallback}`, value: '' }]
    }

    const boxes = []
    items.forEach(item => {
      const label = shortLabels[item.id] || item.question.question || item.id
      item.values.forEach(value => {
        boxes.push({ label, value })
      })
    })
    return boxes
  }

  const dataBoxes = buildBoxes(dataItems, 'data')
  const modelBoxes = buildBoxes(modelItems, 'model')
  const outputBoxes = buildBoxes(outputItems, 'outputs')
  const otherBoxes = buildBoxes(otherItems, 'details')

  const dataFilled = dataItems.length > 0
  const modelFilled = modelItems.length > 0
  const outputFilled = outputItems.length > 0
  const otherFilled = otherItems.length > 0

  const getNodeClass = (filled) => (
    filled ? 'diagram-node-answered' : 'diagram-node-pending'
  )

  const getTextClass = (filled) => (
    filled ? 'diagram-text-answered' : 'diagram-text-pending'
  )

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-ink-500">
        <p>Start answering questions to see the flow diagram.</p>
      </div>
    )
  }

  const width = 720
  const nodeWidth = 220
  const nodeHeight = 56
  const nodeRadius = 12
  const boxHeight = 22
  const boxGap = 6
  const lineHeight = 12
  const sectionGap = 26
  const sectionPadding = 12
  const minSectionHeight = nodeHeight + 20

  const boxHeightFor = (count) => (
    Math.max(minSectionHeight, nodeHeight + sectionPadding + count * (boxHeight + boxGap))
  )

  const dataHeight = boxHeightFor(dataBoxes.length)
  const modelHeight = boxHeightFor(modelBoxes.length)
  const outputHeight = boxHeightFor(outputBoxes.length)
  const otherHeight = boxHeightFor(otherBoxes.length)

  const height = 40 + dataHeight + sectionGap + modelHeight + sectionGap + outputHeight + sectionGap + otherHeight + 40

  const centerX = width / 2 - nodeWidth / 2
  const dataY = 40
  const modelY = dataY + dataHeight + sectionGap
  const outputY = modelY + modelHeight + sectionGap
  const otherY = outputY + outputHeight + sectionGap

  const renderBoxes = (boxes, startY) => (
    boxes.slice(0, 8).map((box, index) => {
      const y = startY + nodeHeight + sectionPadding + index * (boxHeight + boxGap)
      const labelText = box.value ? `${box.label}: ${box.value}` : box.label
      return (
        <g key={`${box.label}-${index}`}>
          <rect
            x={centerX + 12}
            y={y}
            width={nodeWidth - 24}
            height={boxHeight}
            rx="8"
            className="diagram-box"
          />
          <text
            x={centerX + nodeWidth / 2}
            y={y + boxHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="diagram-box-text"
          >
            {truncate(labelText)}
          </text>
        </g>
      )
    })
  )

  return (
    <div className="animate-fade-in">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[70vh]">
        {/* Flow lines */}
        <path
          d={`M ${centerX + nodeWidth / 2} ${dataY + nodeHeight}
              L ${centerX + nodeWidth / 2} ${modelY}`}
          className={dataFilled ? 'diagram-line-active' : 'diagram-line'}
        />
        <path
          d={`M ${centerX + nodeWidth / 2} ${modelY + nodeHeight}
              L ${centerX + nodeWidth / 2} ${outputY}`}
          className={modelFilled ? 'diagram-line-active' : 'diagram-line'}
        />
        <path
          d={`M ${centerX + nodeWidth / 2} ${outputY + nodeHeight}
              L ${centerX + nodeWidth / 2} ${otherY}`}
          className={outputFilled ? 'diagram-line-active' : 'diagram-line'}
        />

        {/* Data node */}
        <g className="diagram-node">
          <rect
            x={centerX}
            y={dataY}
            width={nodeWidth}
            height={nodeHeight}
            rx={nodeRadius}
            className={getNodeClass(dataFilled)}
            strokeWidth="2"
          />
          <text
            x={centerX + nodeWidth / 2}
            y={dataY + nodeHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-semibold ${getTextClass(dataFilled)}`}
          >
            Data
          </text>
          {renderBoxes(dataBoxes, dataY)}
        </g>

        {/* Model node */}
        <g className="diagram-node">
          <rect
            x={centerX}
            y={modelY}
            width={nodeWidth}
            height={nodeHeight}
            rx={nodeRadius}
            className={getNodeClass(modelFilled)}
            strokeWidth="2"
          />
          <text
            x={centerX + nodeWidth / 2}
            y={modelY + nodeHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-semibold ${getTextClass(modelFilled)}`}
          >
            Model
          </text>
          {renderBoxes(modelBoxes, modelY)}
        </g>

        {/* Output node */}
        <g className="diagram-node">
          <rect
            x={centerX}
            y={outputY}
            width={nodeWidth}
            height={nodeHeight}
            rx={nodeRadius}
            className={getNodeClass(outputFilled)}
            strokeWidth="2"
          />
          <text
            x={centerX + nodeWidth / 2}
            y={outputY + nodeHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-semibold ${getTextClass(outputFilled)}`}
          >
            Outputs
          </text>
          {renderBoxes(outputBoxes, outputY)}
        </g>

        {/* Context node */}
        <g className="diagram-node">
          <rect
            x={centerX}
            y={otherY}
            width={nodeWidth}
            height={nodeHeight}
            rx={nodeRadius}
            className={getNodeClass(otherFilled)}
            strokeWidth="2"
          />
          <text
            x={centerX + nodeWidth / 2}
            y={otherY + nodeHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-semibold ${getTextClass(otherFilled)}`}
          >
            Context
          </text>
          {renderBoxes(otherBoxes, otherY)}
        </g>

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
            <div className="w-4 h-4 rounded border-2 border-ink-600 bg-ink-800"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagramView
