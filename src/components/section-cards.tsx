// src/components/section-cards.tsx
"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React from "react"

// Definer props for komponenten – data kan gjerne typet mer presist
interface SectionCardsProps {
  ernaeringData: any[]
  treningsData: any[]
}

export function SectionCards({ ernaeringData, treningsData }: SectionCardsProps) {
  // -----------------------------
  // 1. Vekt
  // Bruk siste målte verdi (forutsetter at ernæringsdata har feltet "vekt")
  const latestWeight = ernaeringData.length
    ? Number(ernaeringData[ernaeringData.length - 1].vekt)
    : 72
  const previousWeight =
    ernaeringData.length > 1
      ? Number(ernaeringData[ernaeringData.length - 2].vekt)
      : latestWeight
  const weightChangePercent =
    previousWeight && previousWeight !== 0
      ? (((latestWeight - previousWeight) / previousWeight) * 100).toFixed(1)
      : "0"

  // -----------------------------
  // 2. PR i benkpress
  const benchData = treningsData.filter(
    (row) =>
      row.øvelse &&
      row.øvelse.toString().toLowerCase() === "benkpress"
  )
  const benchPressPR = benchData.length
    ? Math.max(...benchData.map((row) => Number(row.pr || 0)))
    : 100
  const benchChange = benchData.length ? 5 : 0

  // -----------------------------
  // 3. Gj.snittlig ukentlig kaloriinntak
  const averageCalories =
    ernaeringData.length > 0
      ? Math.round(
          ernaeringData.reduce((acc, row) => acc + Number(row.kalorier || 0), 0) /
            ernaeringData.length
        )
      : 2300
  const caloriesChange = -150 // Dummy-verdi; oppdater etter behov

  // -----------------------------
  // 4. Gj.snittlig proteininntak siste 7 dager
  // Først filtrer ut rader med ugyldig dato
  const validErnaeringData = React.useMemo(() => {
    return ernaeringData.filter((row) => row.Dato && row.Dato.trim() !== "")
  }, [ernaeringData])
  
  // Sorter de gyldige dataene etter dato (stigende)
  const sortedErnaeringData = React.useMemo(() => {
    if (!validErnaeringData || validErnaeringData.length === 0) return []
    return [...validErnaeringData].sort(
      (a, b) => new Date(a.Dato).getTime() - new Date(b.Dato).getTime()
    )
  }, [validErnaeringData])
  console.log("sortedErnaeringData:", sortedErnaeringData)

  // Bruk den siste gyldige datoen som referanse
  const refDate = sortedErnaeringData.length
    ? new Date(sortedErnaeringData[sortedErnaeringData.length - 1].Dato)
    : new Date()
  console.log("refDate:", refDate)

  const startDateProtein = new Date(refDate)
  startDateProtein.setDate(refDate.getDate() - 7)
  console.log("startDateProtein:", startDateProtein)

  // Filtrer ut rader med dato innenfor de siste 7 dagene
  const proteinDataLast7 = sortedErnaeringData.filter((row) => {
    console.log("Row Dato:", row.Dato, "parsed:", new Date(row.Dato))
    return new Date(row.Dato) >= startDateProtein
  })
  console.log("proteinDataLast7:", proteinDataLast7)

  const averageProtein =
    proteinDataLast7.length > 0
      ? Math.round(
          proteinDataLast7.reduce(
            (acc, row) => acc + Number(row["Protein (g)"]?.trim() || 0),
            0
          ) / proteinDataLast7.length
        )
      : 0
  console.log("averageProtein:", averageProtein)
  const proteinChange = 0 // Dummy-verdi; oppdater etter behov

  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {/* Card 1: Vekt */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Vekt</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {latestWeight} kg
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {Number(weightChangePercent) >= 0 ? (
                <>
                  <TrendingUpIcon className="size-3" />
                  +{weightChangePercent}%
                </>
              ) : (
                <>
                  <TrendingDownIcon className="size-3" />
                  {weightChangePercent}%
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            Opp fra forrige uke{" "}
            {Number(weightChangePercent) >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Fortsett å loggføre daglig</div>
        </CardFooter>
      </Card>

      {/* Card 2: PR i benkpress */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>PR Benkpress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {benchPressPR} kg
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +{benchChange} kg
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            Du økte fra {benchPressPR - benchChange} kg{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Fantastisk fremgang!</div>
        </CardFooter>
      </Card>

      {/* Card 3: Kalori-inntak */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Kalori-inntak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {averageCalories} kcal
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {caloriesChange >= 0 ? (
                <>
                  <TrendingUpIcon className="size-3" />
                  +{caloriesChange}
                </>
              ) : (
                <>
                  <TrendingDownIcon className="size-3" />
                  {caloriesChange}
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            Litt lavere enn forrige uke{" "}
            {caloriesChange < 0 && <TrendingDownIcon className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Sjekk matinntak og juster om nødvendig
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Gj.snittlig proteininntak siste 7 dager */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Protein-inntak (siste 7 dager)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {averageProtein} g
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {proteinChange >= 0 ? (
                <>
                  <TrendingUpIcon className="size-3" />
                  +{proteinChange} g
                </>
              ) : (
                <>
                  <TrendingDownIcon className="size-3" />
                  {proteinChange} g
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            Gj.snittlig proteininntak de siste 7 dager
          </div>
          <div className="text-muted-foreground">
            Evaluer proteininntaket og juster kostholdet etter behov
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
