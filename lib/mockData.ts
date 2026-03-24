import type { ChartDataPoint } from '@/types/dashboard'

export function generateDailyRevenue(days = 30): ChartDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(3000 + Math.random() * 2000 + i * 80),
    }
  })
}

export function generateBarData(
  categories: string[],
  min = 500,
  max = 5000
): ChartDataPoint[] {
  return categories.map((name) => ({
    name,
    value: Math.floor(min + Math.random() * (max - min)),
  }))
}

export const CHANNEL_DATA: ChartDataPoint[] = [
  { name: 'Organic', value: 4200 },
  { name: 'Paid', value: 2800 },
  { name: 'Social', value: 1900 },
  { name: 'Direct', value: 1400 },
  { name: 'Email', value: 900 },
]

export const CATEGORY_DATA = [
  { name: 'Electronics', value: 38, fill: '#6366f1' },
  { name: 'Apparel', value: 24, fill: '#8b5cf6' },
  { name: 'Home', value: 19, fill: '#a78bfa' },
  { name: 'Sports', value: 12, fill: '#c4b5fd' },
  { name: 'Other', value: 7, fill: '#ddd6fe' },
]

export const ACTIVITY_EVENTS = [
  { id: '1', label: 'New signup: alex@example.com', time: '2 min ago' },
  { id: '2', label: 'Conversion: starter → pro', time: '8 min ago' },
  { id: '3', label: 'New signup: morgan@acme.co', time: '15 min ago' },
  { id: '4', label: 'Trial started: widget-co.com', time: '31 min ago' },
  { id: '5', label: 'Conversion: trial → starter', time: '1 hr ago' },
  { id: '6', label: 'New signup: taylor@corp.io', time: '2 hr ago' },
  { id: '7', label: 'Upgrade: starter → pro', time: '3 hr ago' },
  { id: '8', label: 'New signup: drew@startup.dev', time: '5 hr ago' },
]
