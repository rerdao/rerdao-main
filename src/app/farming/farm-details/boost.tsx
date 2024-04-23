'use client'
import { useState } from 'react'

import { Plus, Trash2 } from 'lucide-react'
import { MintLogo } from '@/components/mint'
import NFTSelection from '@/components/nftSelection'

import { useBoostingByFarmAddress } from '@/providers/farming.provider'

type BoostNftProps = {
  farmAddress: string
  nfts: string[]
  onNfts: (value: string[]) => void
}

export default function BoostNft({ farmAddress, nfts, onNfts }: BoostNftProps) {
  const [open, setOpen] = useState(false)
  const boosting = useBoostingByFarmAddress(farmAddress)
  const collections = boosting.map(({ boostingCollection }) =>
    boostingCollection.toBase58(),
  )

  const onChangeNft = (mintAddress: string) => {
    const nextNfts = [...nfts]
    nextNfts.push(mintAddress)
    setOpen(false)
    return onNfts(nextNfts)
  }

  const onDelete = (mintAddress: string) => {
    const nextNfts = [...nfts]
    return onNfts(nextNfts.filter((mint) => mint !== mintAddress))
  }

  return (
    <div className="grid grid-cols-12 gap-2 mt-4">
      <p className="col-span-full">Use NFTs to increase LP</p>
      <div className="col-span-full flex gap-2 items-center">
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer flex w-16 h-16 border border-dashed border-primary justify-center items-center rounded-lg"
        >
          <Plus size={12} className="text-primary" />
        </div>
        {nfts.map((nftAddress) => (
          <div key={nftAddress} className="relative group/nft w-16 h-16">
            <MintLogo
              className="w-full h-full rounded-lg group-hover/nft:opacity-60"
              mintAddress={nftAddress}
            />
            <div className="opacity-0 group-hover/nft:opacity-100 cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary p-0.5 rounded-md">
              <Trash2 size={16} onClick={() => onDelete(nftAddress)} />
            </div>
          </div>
        ))}
      </div>
      <NFTSelection
        open={open}
        onCancel={() => setOpen(false)}
        collections={collections}
        onChange={onChangeNft}
        mintAddresses={nfts}
      />
    </div>
  )
}
