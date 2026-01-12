import { useState } from 'react'

function TwoPanelLayout({ leftPanel, rightPanel }) {
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)

  const handleToggleLeft = () => {
    if (showLeft && !showRight) return
    setShowLeft(prev => !prev)
  }

  const handleToggleRight = () => {
    if (showRight && !showLeft) return
    setShowRight(prev => !prev)
  }

  const showBoth = showLeft && showRight
  const gridClass = showBoth
    ? 'grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-4'
    : 'grid grid-cols-1 gap-4'

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
      <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={handleToggleLeft}
          className="panel-toggle"
        >
          {showLeft ? 'Hide ComPath' : 'Show ComPath'}
        </button>
        <button
          type="button"
          onClick={handleToggleRight}
          className="panel-toggle"
        >
          {showRight ? 'Hide preview' : 'Show preview'}
        </button>
        {!showBoth && (
          <button
            type="button"
            onClick={() => {
              setShowLeft(true)
              setShowRight(true)
            }}
            className="panel-toggle"
          >
            Show both
          </button>
        )}
      </div>

      <div className={gridClass}>
        {showLeft && (
          <div className="panel-card lg:max-h-[calc(100vh-200px)]">
            <div className="panel-content">
              {leftPanel}
            </div>
          </div>
        )}

        {showRight && (
          <div className="panel-card lg:max-h-[calc(100vh-200px)] order-first lg:order-last">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoPanelLayout
