'use client'
import { ChangeEvent, useState } from 'react'

import { MintLogo, MintName } from '@/components/mint'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import NFTSelection from '@/components/nftSelection'

import { BoostData } from '@/hooks/farming.hook'

export const EMPTY_COLLECTION = { collection: '', percentage: 0 }

type RewardCardProps = {
  boostData: BoostData
  index: number
  collectionSelected: string[]
  onDelete: (index: number) => void
  onChange: (index: number, name: keyof BoostData, value: string) => void
}
const BoostCard = ({
  boostData,
  index,
  collectionSelected,
  onChange,
  onDelete,
}: RewardCardProps) => {
  const [open, setOpen] = useState(false)

  const onMintChange = (index: number, collection: string) => {
    onChange(index, 'collection', collection)
    setOpen(false)
  }

  return (
    <div className=" grid grid-cols-12 gap-2">
      <div className="col-span-full flex items-center">
        <p className="text-sm flex-auto">NFT Collection #{index + 1}</p>
        {!!index && (
          <button
            onClick={() => onDelete(index)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div
        onClick={() => setOpen(true)}
        className="col-span-6 card rounded-xl bg-base-200 px-3 py-2 flex-row gap-2 items-center cursor-pointer"
      >
        <MintLogo
          className="w-6 h-6 rounded-lg"
          mintAddress={boostData.collection}
        />
        <p className="font-bold">
          {boostData.collection ? (
            <MintName mintAddress={boostData.collection} />
          ) : (
            'Select a collection'
          )}
        </p>
        <ChevronDown size={16} />
      </div>
      <input
        type="number"
        value={boostData.percentage ? boostData.percentage : undefined}
        onChange={(e) => onChange(index, 'percentage', e.target.value)}
        className="ml-2 col-span-6 rounded-xl bg-base-200 px-3 py-2 after:content-['%']"
        placeholder="Enter boost rate"
      />

      <NFTSelection
        open={open}
        mintAddresses={collectionSelected}
        onChange={(val) => onMintChange(index, val)}
        onCancel={() => setOpen(false)}
        onlyCollection
      />
    </div>
  )
}

type BoostNFTProps = {
  boostsData: BoostData[]
  onBoostsData: (boostsData: BoostData[]) => void
}
export default function BoostNFT({ boostsData, onBoostsData }: BoostNFTProps) {
  const [isBoost, setIsBoost] = useState(false)

  const onToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    onBoostsData([EMPTY_COLLECTION])
    setIsBoost(checked)
  }

  const onAddBoost = () => {
    const next = [...boostsData]
    next.push(EMPTY_COLLECTION)
    return onBoostsData(next)
  }

  const onDelete = (index: number) => {
    const next = [...boostsData]
    next.splice(index, 1)
    return onBoostsData(next)
  }

  const onChange = (index: number, name: keyof BoostData, value: string) => {
    const next = [...boostsData]
    next[index] = { ...next[index], [name]: value }
    return onBoostsData(next)
  }

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full flex items-center justify-between">
        <p className="font-bold">Boost by NFT</p>
        <input
          onChange={onToggle}
          checked={isBoost}
          type="checkbox"
          className="toggle toggle-sm"
        />
      </div>
      <p className="col-span-full text-sm">
        Enable <span className="text-primary">Boost</span> means that you will
        allow users to use NFTs to increase their contribution. You need to set
        the corresponding plus boost rate for each NFT collection.
      </p>

      {isBoost && (
        <div className="col-span-full mt-2 grid grid-cols-12 gap-4">
          {boostsData.map((boostData, index) => (
            <div key={boostData.collection + index} className="col-span-full">
              <BoostCard
                index={index}
                onChange={onChange}
                onDelete={onDelete}
                boostData={boostData}
                collectionSelected={boostsData.map(
                  ({ collection }) => collection,
                )}
              />
            </div>
          ))}
          <div className="col-span-full">
            <button onClick={onAddBoost} className="btn btn-block btn-sm">
              <Plus size={16} /> Add more
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
