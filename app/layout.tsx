import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Investigación Estadística de Dados - Distribución Binomial",
  description:
    "Herramienta interactiva para análisis probabilístico de juegos de dados con simulación 3D y cálculos estadísticos avanzados",
  keywords: "estadística, probabilidad, dados, distribución binomial, simulación, análisis",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
