import { useMemo } from 'react'

function DocumentPreview({ answers, questions }) {
  // Build a map of question IDs to their labels (for options)
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

  const formatAnswer = (questionId, value) => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    // Handle multi-choice (array of option IDs)
    if (Array.isArray(value)) {
      const labels = optionLabels[questionId]
      if (labels) {
        return value.map(v => labels[v] || v).join(', ')
      }
      return value.join(', ')
    }

    // Handle single-choice (option ID)
    const labels = optionLabels[questionId]
    if (labels && labels[value]) {
      return labels[value]
    }

    return value
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-ink-500">
        <p>Start answering questions to see your specification take shape.</p>
      </div>
    )
  }

  const dataInventory = Array.isArray(answers?.data_inventory) ? answers.data_inventory : []
  const sourceTypeLabels = {
    survey_micro: 'Household/firm survey data',
    admin_data: 'Administrative data',
    satellite: 'Satellite / Remote sensing data',
    time_series: 'Time series (macro indicators)',
    cross_section: 'Cross-sectional data',
    panel: 'Panel data',
    experimental: 'Experimental / RCT data',
    synthetic: 'Synthetic / Simulated data',
    literature: 'Parameters from literature',
    api: 'External API (World Bank, IEA, etc.)'
  }
  const privacyLabels = {
    public: 'Public',
    restricted_shareable: 'Restricted (shareable with agreement)',
    confidential: 'Confidential'
  }

  return (
    <div className="animate-fade-in">
      <div className="question-card">
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Technical Specification
        </h1>
        <p className="text-ink-400 text-sm mb-6">
          {answers?.project_name || 'Project name pending'}
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-ink-200">Project Overview</h2>
          <p className="text-ink-200">
            {answers?.project_description || 'Project description to be defined.'}
          </p>
          <p className="text-ink-400 text-sm">
            Target publication: {formatAnswer('target_publication', answers?.target_publication) || 'TBD'} ·
            Institution: {formatAnswer('institution_type', answers?.institution_type) || 'TBD'} ·
            Primary domain: {formatAnswer('model_domain', answers?.model_domain) || 'TBD'}
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-display font-semibold text-ink-200">Datasets</h2>
          {dataInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Source type</th>
                    <th>Source link</th>
                    <th>Resolution</th>
                    <th>Format</th>
                    <th>Privacy</th>
                    <th>Size</th>
                    <th>Test extract</th>
                  </tr>
                </thead>
                <tbody>
                  {dataInventory.map((entry, index) => (
                    <tr key={`${entry.dataset_name || 'dataset'}-${index}`}>
                      <td>{entry.dataset_name || '-'}</td>
                      <td>{sourceTypeLabels[entry.source_type] || entry.source_type || '-'}</td>
                      <td>{entry.source_link || '-'}</td>
                      <td>{entry.resolution || '-'}</td>
                      <td>{entry.data_format || '-'}</td>
                      <td>{privacyLabels[entry.privacy] || entry.privacy || '-'}</td>
                      <td>{entry.size || '-'}</td>
                      <td>{entry.extract_plan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-ink-500">Dataset details will be added when available.</p>
          )}
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Parameters & Calibration</h2>
          <p className="text-ink-200">
            Parameters will be determined via {formatAnswer('parameter_types', answers?.parameter_types) || 'TBD'}.
          </p>
          {answers?.calibration_targets && (
            <p className="text-ink-200">Calibration targets: {answers.calibration_targets}</p>
          )}
          <p className="text-ink-200">
            Uncertainty handling: {formatAnswer('parameter_uncertainty', answers?.parameter_uncertainty) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Parameter documentation: {formatAnswer('param_documentation', answers?.param_documentation) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Model Specification</h2>
          <p className="text-ink-200">
            Model type: {formatAnswer('model_type', answers?.model_type) || 'TBD'}.
          </p>
          {answers?.theoretical_foundation && (
            <p className="text-ink-200">{answers.theoretical_foundation}</p>
          )}
          {answers?.key_equations && (
            <pre className="text-ink-200 bg-ink-900/40 border border-ink-800/60 rounded-xl p-4 whitespace-pre-wrap">
              {answers.key_equations}
            </pre>
          )}
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Outputs</h2>
          <p className="text-ink-200">
            Output types: {formatAnswer('output_types', answers?.output_types) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Figure formats: {formatAnswer('figure_formats', answers?.figure_formats) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Table formats: {formatAnswer('table_format', answers?.table_format) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Validation & Verification</h2>
          <p className="text-ink-200">
            Validation approach: {formatAnswer('validation_approach', answers?.validation_approach) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Verification tests: {formatAnswer('verification_tests', answers?.verification_tests) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Sensitivity Analysis</h2>
          <p className="text-ink-200">
            Methods: {formatAnswer('sensitivity_type', answers?.sensitivity_type) || 'TBD'}.
          </p>
          {answers?.sensitivity_parameters && (
            <p className="text-ink-200">Parameters analyzed: {answers.sensitivity_parameters}</p>
          )}
          {answers?.sensitivity_outputs && (
            <p className="text-ink-200">
              Outputs analyzed: {formatAnswer('sensitivity_outputs', answers?.sensitivity_outputs)}
            </p>
          )}
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Uncertainty Quantification</h2>
          <p className="text-ink-200">
            Approach: {formatAnswer('uq_approach', answers?.uq_approach) || 'TBD'}.
          </p>
          {answers?.uncertainty_sources && (
            <p className="text-ink-200">
              Sources considered: {formatAnswer('uncertainty_sources', answers?.uncertainty_sources)}
            </p>
          )}
          {answers?.confidence_reporting && (
            <p className="text-ink-200">
              Reporting format: {formatAnswer('confidence_reporting', answers?.confidence_reporting)}
            </p>
          )}
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Reproducibility</h2>
          <p className="text-ink-200">
            Standard: {formatAnswer('reproducibility_standard', answers?.reproducibility_standard) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Master script: {formatAnswer('code_structure', answers?.code_structure) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Random seeds: {formatAnswer('random_seed', answers?.random_seed) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Environment: {formatAnswer('environment_management', answers?.environment_management) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Version control: {formatAnswer('version_control', answers?.version_control) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Documentation</h2>
          <p className="text-ink-200">
            Documentation types: {formatAnswer('documentation_types', answers?.documentation_types) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            README template: {formatAnswer('readme_template', answers?.readme_template) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Technical Stack</h2>
          <p className="text-ink-200">
            Language: {formatAnswer('programming_language', answers?.programming_language) || 'TBD'}.
          </p>
          {answers?.python_libraries && (
            <p className="text-ink-200">
              Libraries: {formatAnswer('python_libraries', answers?.python_libraries)}
            </p>
          )}
          <p className="text-ink-200">
            Computational requirements: {formatAnswer('computational_requirements', answers?.computational_requirements) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Parallelization: {formatAnswer('parallelization', answers?.parallelization) || 'TBD'}.
          </p>
        </section>

        <section className="mt-6 space-y-2">
          <h2 className="text-lg font-display font-semibold text-ink-200">Project Management</h2>
          <p className="text-ink-200">
            Team size: {formatAnswer('team_size', answers?.team_size) || 'TBD'}.
          </p>
          <p className="text-ink-200">
            Timeline: {answers?.timeline || 'TBD'}.
          </p>
        </section>
      </div>
    </div>
  )
}

export default DocumentPreview
