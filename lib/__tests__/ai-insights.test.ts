import {
  WIDGET_INSIGHT_SYSTEM_PROMPT,
  DASHBOARD_INSIGHT_SYSTEM_PROMPT,
  buildWidgetUserMessage,
  buildDashboardUserMessage,
} from '../ai-insights'

describe('WIDGET_INSIGHT_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof WIDGET_INSIGHT_SYSTEM_PROMPT).toBe('string')
    expect(WIDGET_INSIGHT_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })

  it('contains key instruction about Plain English', () => {
    expect(WIDGET_INSIGHT_SYSTEM_PROMPT).toContain('Plain English only')
  })
})

describe('DASHBOARD_INSIGHT_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof DASHBOARD_INSIGHT_SYSTEM_PROMPT).toBe('string')
    expect(DASHBOARD_INSIGHT_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })

  it('contains key instruction about Plain English', () => {
    expect(DASHBOARD_INSIGHT_SYSTEM_PROMPT).toContain('Plain English only')
  })
})

describe('buildWidgetUserMessage', () => {
  it('includes widget type', () => {
    const msg = buildWidgetUserMessage('kpi', { title: 'Revenue', value: 84200 })
    expect(msg).toContain('kpi')
  })

  it('includes config values', () => {
    const msg = buildWidgetUserMessage('kpi', { title: 'Revenue', value: 84200 })
    expect(msg).toContain('Revenue')
    expect(msg).toContain('84200')
  })

  it('trims whitespace from widget type', () => {
    const msg = buildWidgetUserMessage(' kpi ', {})
    expect(msg).toContain('kpi')
    expect(msg).not.toContain(' kpi ')
  })
})

describe('buildDashboardUserMessage', () => {
  it('includes dashboard name', () => {
    const msg = buildDashboardUserMessage('Sales Q1', [
      { type: 'kpi', config: { title: 'Revenue' } },
    ])
    expect(msg).toContain('Sales Q1')
  })

  it('includes widget types', () => {
    const msg = buildDashboardUserMessage('Sales Q1', [
      { type: 'kpi', config: { title: 'Revenue' } },
      { type: 'line-chart', config: { title: 'Trend' } },
    ])
    expect(msg).toContain('kpi')
    expect(msg).toContain('line-chart')
  })

  it('falls back to Untitled when name is empty', () => {
    const msg = buildDashboardUserMessage('', [{ type: 'kpi', config: {} }])
    expect(msg).toContain('Untitled')
  })
})
