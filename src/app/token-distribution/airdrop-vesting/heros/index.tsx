'use client'
import TotalBalance from './balance'
import TotalDistribution from './distribution'
import TotalReceived from './received'

export default function Heros() {
  return (
    <div className="grid md:grid-cols-3 grid-col-1 gap-6">
      <TotalBalance />
      <TotalDistribution />
      <TotalReceived />
    </div>
  )
}
