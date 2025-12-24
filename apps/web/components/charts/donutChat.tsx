"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { normalizeEnum } from "@/utils/normalizeEnum"

interface DonutChartProps {
  title: string
  data: Array<{ name: string; value: number }>
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { name: string; value: number } }>
  onDataChange: (data: { name: string; value: number } | null) => void
}

function CustomTooltip({ active, payload, onDataChange }: CustomTooltipProps) {
  useEffect(() => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      onDataChange({
        name: data.name,
        value: data.value
      })
    } else {
      onDataChange(null)
    }
  }, [active, payload, onDataChange])

  return null
}

export function DonutChart({ title, data }: DonutChartProps) {
  const [activeData, setActiveData] = useState<{ name: string; value: number } | null>(null)

  const handleDataChange = useCallback((data: { name: string; value: number } | null) => {
    setActiveData(data)
  }, [])

  // Find the highest value index
  const highestValueIndex = useMemo(() => {
    if (data.length === 0) return -1
    let maxIndex = 0
    let maxValue = data[0].value
    data.forEach((item, index) => {
      if (item.value > maxValue) {
        maxValue = item.value
        maxIndex = index
      }
    })
    return maxIndex
  }, [data])

  return (
    <div className="p-5 col-span-1">
      <div className="flex justify-between items-center mb-5">
        <p>{title}</p>
        {activeData && (
          <span>{activeData.value} @ {normalizeEnum(activeData.name)}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Tooltip
            content={({ active, payload }) => (
              <CustomTooltip
                active={active}
                payload={payload as Array<{ payload: { name: string; value: number } }>}
                onDataChange={handleDataChange}
              />
            )}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                stroke="none"
                fill={index === highestValueIndex ? "#a1a1aa" : "#27272a"}
                strokeWidth={index === highestValueIndex ? 2 : 0}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
