'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarData {
  name: string
  expected: number
  received: number
}

const formatEur = (value: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-gray-600 dark:text-gray-400">
          <span
            className="inline-block h-2 w-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatEur(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function FinanceBarChart({ data }: { data: BarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50 + 60)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barGap={2}
        barSize={14}
      >
        <XAxis
          type="number"
          tickFormatter={(v) => formatEur(v)}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="expected" name="Verwacht" fill="#93c5fd" radius={[0, 4, 4, 0]} />
        <Bar dataKey="received" name="Ontvangen" fill="#2F5711" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
