"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Vi definerer chartConfig for kaloridata
const chartConfig = {
  calories: {
    label: "Kalorier",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Forventer at ernaeringData er et array med objekter med feltene "Dato" og "kalorier"
export function ChartAreaInteractive({ ernaeringData }: { ernaeringData: any[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filtrer ut rader med tom "Dato" før sortering og mapping
  const validData = React.useMemo(() => {
    return ernaeringData.filter(row => row.Dato && row.Dato.trim() !== "")
  }, [ernaeringData])

  // Transformer CSV-data til chartData med kun "date" og "calories"
  const chartData = React.useMemo(() => {
    if (!validData || validData.length === 0) return []
    const sorted = [...validData].sort(
      (a, b) => new Date(a.Dato).getTime() - new Date(b.Dato).getTime()
    )
    return sorted.map(row => ({
      date: row.Dato,
      calories: Number(row.kalorier) || 0,
    }))
  }, [validData])

  const referenceDate = React.useMemo(() => {
    if (chartData.length > 0) {
      return new Date(chartData[chartData.length - 1].date)
    }
    return new Date()
  }, [chartData])

  const filteredData = React.useMemo(() => {
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [chartData, timeRange, referenceDate])

  console.log("chartData:", chartData)
  console.log("filteredData:", filteredData)

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>{chartConfig.calories.label} logg</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Viser alle individuelle kalori-dagslogger for valgt periode
          </span>
          <span className="@[540px]/card:hidden">Kalori-logg</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 90 days
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 90 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.calories.color}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.calories.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="calories"
              type="natural"
              fill="url(#fillCalories)"
              stroke={chartConfig.calories.color}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
