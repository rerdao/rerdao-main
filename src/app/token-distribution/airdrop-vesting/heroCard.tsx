'use client'
import { LucideIcon } from 'lucide-react'

type HeroCardProps = {
  label: string
  value: string
  Icon: LucideIcon
  loading?: boolean
}

export default function HeroCard({
  Icon,
  label,
  value,
  loading,
}: HeroCardProps) {
  return (
    <div className="card flex flex-row py-4 px-6 rounded-xl bg-base-100 items-center">
      <div className="flex-auto flex flex-col gap-2">
        <p className="text-sm opacity-60">{label}</p>
        {loading ? (
          <span className="loading loading-bars loading-xs" />
        ) : (
          <h5>{value}</h5>
        )}
      </div>
      <div className="bg-[#f9575e1a] p-3 rounded-xl">
        <Icon className="text-primary" />
      </div>
    </div>
  )
}
