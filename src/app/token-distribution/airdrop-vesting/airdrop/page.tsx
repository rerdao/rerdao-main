'use client'
import { useRouter } from 'next/navigation'

import { Plus } from 'lucide-react'
import History from '../history'
import Heros from './heros'

import { Distribute } from '@/hooks/airdrop.hook'

export default function Airdrop() {
  const { push } = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex">
        <h4 className="flex-auto">Airdrop</h4>
        <button
          className="btn btn-primary"
          onClick={() =>
            push('/token-distribution/airdrop-vesting/airdrop/add-new')
          }
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>
      <Heros />
      <History type={Distribute.Airdrop} />
    </div>
  )
}
