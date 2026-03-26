import type { TemplateKey, Widget } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'

const CHANNEL_DATA = [
  { name: 'Organic', value: 4200 },
  { name: 'Paid', value: 2800 },
  { name: 'Social', value: 1900 },
  { name: 'Direct', value: 1400 },
  { name: 'Email', value: 900 },
]

const CATEGORY_DATA = [
  { name: 'Electronics', value: 38 },
  { name: 'Apparel', value: 24 },
  { name: 'Home', value: 19 },
  { name: 'Sports', value: 12 },
  { name: 'Other', value: 7 },
]

const DAILY_REVENUE = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-03-26')
  date.setDate(date.getDate() - (30 - i))
  return {
    name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: 3000 + Math.round(800 * Math.sin(i * 0.4 + 1)) + i * 80,
  }
})

const ACTIVITY_EVENTS = [
  { id: '1', label: 'New signup: alex@example.com', time: '2 min ago' },
  { id: '2', label: 'Conversion: starter → pro', time: '8 min ago' },
  { id: '3', label: 'New signup: morgan@acme.co', time: '15 min ago' },
  { id: '4', label: 'Trial started: widget-co.com', time: '31 min ago' },
  { id: '5', label: 'Conversion: trial → starter', time: '1 hr ago' },
  { id: '6', label: 'New signup: taylor@corp.io', time: '2 hr ago' },
  { id: '7', label: 'Upgrade: starter → pro', time: '3 hr ago' },
  { id: '8', label: 'New signup: drew@startup.dev', time: '5 hr ago' },
]

interface TemplateDef {
  name: string
  widgets: Widget[]
  layout: LayoutItem[]
}

export const templates: Record<TemplateKey, TemplateDef> = {
  analytics: {
    name: 'SaaS Analytics Dashboard',
    widgets: [
      { id: 'kpi-revenue', type: 'kpi', config: { title: 'Total Revenue', value: '$124,592', change: 12, changeLabel: 'vs last month', prefix: '$' } },
      { id: 'kpi-users', type: 'kpi', config: { title: 'Active Users', value: '8,421', change: 5, changeLabel: 'vs last month' } },
      { id: 'kpi-cvr', type: 'kpi', config: { title: 'Conversion Rate', value: '3.2%', change: -0.4, changeLabel: 'vs last month', suffix: '%' } },
      { id: 'kpi-session', type: 'kpi', config: { title: 'Avg Session', value: '4m 32s', change: 8, changeLabel: 'vs last month' } },
      { id: 'chart-revenue', type: 'line-chart', config: { title: 'Daily Revenue', dataKey: 'value', color: '#6366f1', data: DAILY_REVENUE } },
      { id: 'chart-channels', type: 'bar-chart', config: { title: 'Traffic by Channel', dataKey: 'value', data: CHANNEL_DATA } },
      { id: 'feed-activity', type: 'activity-feed', config: { title: 'Recent Activity', events: ACTIVITY_EVENTS } },
    ],
    layout: [
      { i: 'kpi-revenue', x: 0, y: 0, w: 3, h: 2 },
      { i: 'kpi-users', x: 3, y: 0, w: 3, h: 2 },
      { i: 'kpi-cvr', x: 6, y: 0, w: 3, h: 2 },
      { i: 'kpi-session', x: 9, y: 0, w: 3, h: 2 },
      { i: 'chart-revenue', x: 0, y: 2, w: 6, h: 4 },
      { i: 'chart-channels', x: 6, y: 2, w: 6, h: 4 },
      { i: 'feed-activity', x: 0, y: 6, w: 6, h: 4 },
    ],
  },

  inventory: {
    name: 'Inventory Dashboard',
    widgets: [
      { id: 'kpi-skus', type: 'kpi', config: { title: 'Total SKUs', value: '1,284', change: 3, changeLabel: 'this month' } },
      { id: 'kpi-lowstock', type: 'kpi', config: { title: 'Low Stock Items', value: '23', change: -15, changeLabel: 'vs last week', color: '#ef4444' } },
      { id: 'kpi-value', type: 'kpi', config: { title: 'Inventory Value', value: '$892,441', change: 2, changeLabel: 'vs last month' } },
      { id: 'kpi-turnover', type: 'kpi', config: { title: 'Turnover Rate', value: '4.2x', change: 0.3, changeLabel: 'vs last quarter' } },
      { id: 'chart-category', type: 'donut-chart', config: { title: 'Inventory by Category', dataKey: 'value', data: CATEGORY_DATA } },
      { id: 'tracker-stock', type: 'progress-tracker', config: { title: 'Top Product Stock Levels', items: [
        { label: 'iPhone 15 Pro', value: 847, max: 1000, color: '#6366f1' },
        { label: 'MacBook Air M3', value: 234, max: 500, color: '#8b5cf6' },
        { label: 'AirPods Pro', value: 1203, max: 1500, color: '#a78bfa' },
        { label: 'iPad Air', value: 89, max: 400, color: '#ef4444' },
        { label: 'Apple Watch S9', value: 567, max: 800, color: '#f59e0b' },
        { label: 'Magic Keyboard', value: 412, max: 600, color: '#10b981' },
      ] } },
      { id: 'table-sku', type: 'data-table', config: { title: 'SKU Overview', columns: [
        { key: 'sku', label: 'SKU' }, { key: 'name', label: 'Product Name' },
        { key: 'stock', label: 'Stock', sortable: true }, { key: 'reorder', label: 'Reorder Point' },
        { key: 'status', label: 'Status' },
      ], rows: [
        { sku: 'APPL-001', name: 'iPhone 15 Pro', stock: 847, reorder: 200, status: 'In Stock' },
        { sku: 'APPL-002', name: 'MacBook Air M3', stock: 234, reorder: 100, status: 'In Stock' },
        { sku: 'APPL-003', name: 'AirPods Pro', stock: 1203, reorder: 300, status: 'In Stock' },
        { sku: 'APPL-004', name: 'iPad Air', stock: 89, reorder: 150, status: 'Low Stock' },
        { sku: 'APPL-005', name: 'Apple Watch S9', stock: 567, reorder: 200, status: 'In Stock' },
        { sku: 'APPL-006', name: 'Magic Keyboard', stock: 412, reorder: 100, status: 'In Stock' },
        { sku: 'APPL-007', name: 'Magic Mouse', stock: 18, reorder: 100, status: 'Critical' },
        { sku: 'APPL-008', name: 'Studio Display', stock: 203, reorder: 50, status: 'In Stock' },
      ] } },
    ],
    layout: [
      { i: 'kpi-skus', x: 0, y: 0, w: 3, h: 2 },
      { i: 'kpi-lowstock', x: 3, y: 0, w: 3, h: 2 },
      { i: 'kpi-value', x: 6, y: 0, w: 3, h: 2 },
      { i: 'kpi-turnover', x: 9, y: 0, w: 3, h: 2 },
      { i: 'chart-category', x: 0, y: 2, w: 6, h: 4 },
      { i: 'tracker-stock', x: 6, y: 2, w: 6, h: 4 },
      { i: 'table-sku', x: 0, y: 6, w: 12, h: 4 },
    ],
  },

  purchasing: {
    name: 'Purchasing Dashboard',
    widgets: [
      { id: 'kpi-openpos', type: 'kpi', config: { title: 'Open POs', value: '34', change: 6, changeLabel: 'vs last month' } },
      { id: 'kpi-pending', type: 'kpi', config: { title: 'Pending Approval', value: '$128,400', change: 12, changeLabel: 'vs last month' } },
      { id: 'kpi-leadtime', type: 'kpi', config: { title: 'Avg Lead Time', value: '12 days', change: -2, changeLabel: 'vs last quarter' } },
      { id: 'kpi-ontime', type: 'kpi', config: { title: 'On-Time Delivery', value: '94%', change: 1, changeLabel: 'vs last quarter' } },
      { id: 'chart-spend', type: 'bar-chart', config: { title: 'Monthly Spend by Vendor', dataKey: 'value', data: [
        { name: 'Acme Corp', value: 48200 }, { name: 'GlobalTech', value: 31500 },
        { name: 'SupplyPro', value: 22800 }, { name: 'FastShip', value: 18400 },
        { name: 'MegaVend', value: 12100 },
      ] } },
      { id: 'gauge-budget', type: 'gauge', config: { title: 'Q2 Budget Utilization', value: 68, max: 100, unit: '%' } },
      { id: 'table-pos', type: 'data-table', config: { title: 'Purchase Orders', columns: [
        { key: 'po', label: 'PO Number' }, { key: 'vendor', label: 'Vendor' },
        { key: 'amount', label: 'Amount', sortable: true }, { key: 'status', label: 'Status' },
        { key: 'expected', label: 'Expected Date' },
      ], rows: [
        { po: 'PO2024001', vendor: 'Acme Corp', amount: '$12,400', status: 'Approved', expected: 'Mar 28' },
        { po: 'PO2024002', vendor: 'GlobalTech', amount: '$8,750', status: 'Pending', expected: 'Apr 2' },
        { po: 'PO2024003', vendor: 'SupplyPro', amount: '$3,200', status: 'Approved', expected: 'Mar 25' },
        { po: 'PO2024004', vendor: 'FastShip', amount: '$21,000', status: 'Under Review', expected: 'Apr 10' },
        { po: 'PO2024005', vendor: 'MegaVend', amount: '$6,800', status: 'Approved', expected: 'Mar 30' },
        { po: 'PO2024006', vendor: 'Acme Corp', amount: '$15,300', status: 'Pending', expected: 'Apr 5' },
        { po: 'PO2024007', vendor: 'GlobalTech', amount: '$4,500', status: 'Approved', expected: 'Mar 27' },
        { po: 'PO2024008', vendor: 'SupplyPro', amount: '$9,100', status: 'Pending', expected: 'Apr 8' },
      ] } },
      { id: 'tracker-dept', type: 'progress-tracker', config: { title: 'Budget by Department', items: [
        { label: 'Engineering', value: 142000, max: 200000, color: '#6366f1' },
        { label: 'Marketing', value: 89000, max: 120000, color: '#8b5cf6' },
        { label: 'Operations', value: 67000, max: 80000, color: '#f59e0b' },
        { label: 'Sales', value: 54000, max: 100000, color: '#10b981' },
        { label: 'HR', value: 28000, max: 40000, color: '#ef4444' },
      ] } },
    ],
    layout: [
      { i: 'kpi-openpos', x: 0, y: 0, w: 3, h: 2 },
      { i: 'kpi-pending', x: 3, y: 0, w: 3, h: 2 },
      { i: 'kpi-leadtime', x: 6, y: 0, w: 3, h: 2 },
      { i: 'kpi-ontime', x: 9, y: 0, w: 3, h: 2 },
      { i: 'chart-spend', x: 0, y: 2, w: 8, h: 4 },
      { i: 'gauge-budget', x: 8, y: 2, w: 4, h: 4 },
      { i: 'table-pos', x: 0, y: 6, w: 12, h: 4 },
      { i: 'tracker-dept', x: 0, y: 10, w: 6, h: 4 },
    ],
  },
}
