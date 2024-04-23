'use client'

import { MintLogo, useMintSymbol } from '@/components/mint'

import { useRewardsByFarmAddress } from '@/providers/farming.provider'

function FarmRewardMintBase({ mintAddress }: { mintAddress: string }) {
  const symbol = useMintSymbol(mintAddress)
  return (
    <span className="tooltip" data-tip={symbol}>
      <MintLogo
        key={mintAddress}
        mintAddress={mintAddress}
        className="w-6 h-6 rounded-full bg-base-300"
        iconClassName="w-4 h-4 text-base-content"
      />
    </span>
  )
}

export type FarmRewardMintProps = {
  farmAddress: string
}

export default function FarmRewardMint({ farmAddress }: FarmRewardMintProps) {
  const rewards = useRewardsByFarmAddress(farmAddress) || {}

  return (
    <span className="flex flex-row gap-1">
      {rewards.map(({ rewardMint }) => (
        <FarmRewardMintBase
          key={rewardMint.toBase58()}
          mintAddress={rewardMint.toBase58()}
        />
      ))}
    </span>
  )
}
