// src/app/page.tsx
import fs from "fs/promises"
import path from "path"
import Papa from "papaparse"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// Merk: Denne komponenten er en server-komponent, så vi kan bruke async/await.
export default async function Page() {
  // Filbaner
  const ernaeringCsvPath = path.join(process.cwd(), "src", "data", "ernaering.csv")
  const treningsdataCsvPath = path.join(process.cwd(), "src", "data", "treningsdata.csv")

  // Les filer asynkront
  const ernaeringCsv = await fs.readFile(ernaeringCsvPath, "utf8")
  const treningsdataCsv = await fs.readFile(treningsdataCsvPath, "utf8")

  // Parse CSV-dataene med header: true
  const ernaeringData = Papa.parse(ernaeringCsv, { header: true }).data
  const treningsData = Papa.parse(treningsdataCsv, { header: true }).data

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Viser kortkomponenter med data */}
              <SectionCards
                ernaeringData={ernaeringData}
                treningsData={treningsData}
              />
              <div className="px-4 lg:px-6">
                {/* Viser et interaktivt diagram */}
                <ChartAreaInteractive
                  ernaeringData={ernaeringData}
                  treningsData={treningsData}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
