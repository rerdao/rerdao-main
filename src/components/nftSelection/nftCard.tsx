'use client'
import classNames from 'classnames'

import { solscan } from '@/helpers/explorers'
import { shortenAddress } from '@/helpers/utils'
import { MintLogo, MintName } from '../mint'

type NftCardProps = {
  nftAddress: string
  onChange?: (mintAddress: string) => void
  active?: boolean
}

const NftCard = ({ nftAddress, active, onChange = () => {} }: NftCardProps) => {
  const onChangeNft = (nftAddress: string) => {
    if (active) return
    onChange(nftAddress)
  }
  return (
    <div
      className={classNames(
        'flex flex-col gap-2 bg-base-200 p-2 rounded-lg cursor-pointer',
        {
          '!bg-accent': active,
        },
      )}
      onClick={() => onChangeNft(nftAddress)}
    >
      <MintLogo className="rounded-lg w-full h-full" mintAddress={nftAddress} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm truncate ... cursor-default">
          <MintName mintAddress={nftAddress} />
        </p>
        <p
          onClick={() => window.open(solscan(nftAddress), '_blank')}
          className="text-sm opacity-60 cursor-pointer"
        >
          {shortenAddress(nftAddress)}
        </p>
      </div>
    </div>
  )
}

export default NftCard
