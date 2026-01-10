function TwoPanelLayout({ leftPanel, rightPanel }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-6 w-full max-w-7xl mx-auto min-h-[calc(100vh-200px)]">
      {/* Left Panel - Questionnaire */}
      <div className="panel-card lg:max-h-[calc(100vh-200px)]">
        <div className="panel-content">
          {leftPanel}
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="panel-card lg:max-h-[calc(100vh-200px)] order-first lg:order-last">
        {rightPanel}
      </div>
    </div>
  )
}

export default TwoPanelLayout
