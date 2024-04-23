'use client'
import { MouseEvent, useCallback, useMemo, useState } from 'react'
import BN from 'bn.js'

import { Info, X } from 'lucide-react'
import { MintLogo } from '@/components/mint'
import Modal from '@/components/modal'

import { useNftsBoosted, useUnstakeNft } from '@/hooks/farming.hook'
import { useBoostingByFarmAddress } from '@/providers/farming.provider'
import { numeric } from '@/helpers/utils'
import { undecimalize } from '@/helpers/decimals'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

type UnstakeNftProps = {
  farmAddress: string
}

export default function UnstakeNft({ farmAddress }: UnstakeNftProps) {
  const [loading, setLoading] = useState(false)
  const [nftSelected, setNftSelect] = useState('')

  const nftsBoosted = useNftsBoosted(farmAddress)
  const boosting = useBoostingByFarmAddress(farmAddress)
  const pushMessage = usePushMessage()

  const collectionBoosted = useMemo(
    () => nftsBoosted.map(({ collection }) => collection?.address.toBase58()),
    [nftsBoosted],
  )
  const nftAddresses = useMemo(
    () =>
      nftsBoosted.map((nft: any) => ({
        nft: nft.mintAddress.toBase58(),
        collection: nft.collection?.address.toBase58(),
      })),
    [nftsBoosted],
  )

  const unstake = useUnstakeNft(farmAddress, nftSelected)
  const onUnstake = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      try {
        e.preventDefault()
        setLoading(true)
        const txId = await unstake()
        pushMessage(
          'alert-success',
          'Successfully unstake nft. Click here to view on explorer.',
          {
            onClick: () => window.open(solscan(txId), '_blank'),
          },
        )
        setNftSelect('')
      } catch (er: any) {
        pushMessage('alert-error', er.message)
      } finally {
        setLoading(false)
      }
    },
    [unstake, pushMessage],
  )

  const { totalBoosted, percentage } = useMemo(() => {
    let totalBoosted = new BN(0)
    const percentage: Record<string, string> = {}
    for (const { boostingCollection, boostingCoefficient } of boosting) {
      if (collectionBoosted.includes(boostingCollection.toBase58())) {
        totalBoosted = totalBoosted.add(boostingCoefficient)
        percentage[boostingCollection.toBase58()] = undecimalize(
          boostingCoefficient,
          9,
        )
      }
    }
    return { totalBoosted, percentage }
  }, [boosting, collectionBoosted])

  return (
    <div className="card p-4 bg-base-200 gap-6">
      <p className="font-bold">
        Your locked NFTs{' '}
        <span className="font-light ml-1 border-2 border-primary px-2 rounded-lg text-primary">
          {numeric(undecimalize(totalBoosted, 9)).format('0,0.[00]%')}
        </span>
      </p>
      <div className="flex gap-2 items-center">
        {nftAddresses.map(({ nft, collection }) => (
          <div
            key={nft}
            className="tooltip"
            data-tip={`Boosted ${numeric(percentage[collection]).format(
              '0,0.[00]%',
            )}`}
          >
            <div className="relative group/nft w-16 h-16">
              <MintLogo
                className="w-full h-full rounded-lg group-hover/nft:opacity-60"
                mintAddress={nft}
              />
              <div className="opacity-0 group-hover/nft:opacity-100 cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary p-0.5 rounded-md">
                <X size={16} onClick={() => setNftSelect(nft)} />
              </div>
            </div>
          </div>
        ))}
        <Modal open={!!nftSelected} onCancel={() => setNftSelect('')}>
          <div className="grid grid-cols-12 gap-2">
            <p className="col-span-full font-bold flex gap-2 items-center">
              <Info className="text-[#FA8C16]" size={12} /> Are you sure to
              Unstake NFTs?
            </p>
            <p className="col-span-full text-sm opacity-60">
              Your staked LP will be reduced in proportion with the unstake
              NFTs.
            </p>
            <div className="col-span-full flex gap-2 items-center justify-end mt-2">
              <button
                onClick={() => setNftSelect('')}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                disabled={!nftSelected}
                onClick={onUnstake}
                className="btn btn-primary btn-sm"
              >
                {loading && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Unstake
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
