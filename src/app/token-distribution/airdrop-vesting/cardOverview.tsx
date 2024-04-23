import { BN } from 'bn.js'
import dayjs from 'dayjs'

import { MintAmount, MintSymbol } from '@/components/mint'

import {
  useDistributeConfigs,
  useAirdropMintAddress,
} from '@/providers/airdrop.provider'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'
import { useTotalDistribute } from '@/hooks/airdrop.hook'

type CardOverviewProps = {
  showTotal?: boolean
  showUnlock?: boolean
}

export default function CardOverview({
  showTotal,
  showUnlock,
}: CardOverviewProps) {
  const { mintAddress } = useAirdropMintAddress()
  const {
    configs: { unlockTime, expiration },
  } = useDistributeConfigs()
  const { quantity, total } = useTotalDistribute()
  const { amount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }

  return (
    <div className="rounded-lg p-4 bg-base-200 grid md:grid-cols-2">
      <div className="flex flex-col md:flex-row gap-5 md:gap-12">
        <div className="flex flex-row md:flex-col justify-between md: md:gap-2">
          <p className="text-sm opacity-60">Recipients</p>
          <p>{quantity}</p>
        </div>
        {showUnlock && (
          <div className="flex flex-row md:flex-col justify-between md:gap-2">
            <p className="text-sm opacity-60">Unlock time</p>
            <p> {dayjs(unlockTime).format('DD/MM/YYYY, HH:mm')}</p>
          </div>
        )}

        <div className="flex flex-row md:flex-col justify-between md:gap-2">
          <p className="text-sm opacity-60">Expiration time</p>
          <p>
            {!expiration
              ? 'Unlimited'
              : dayjs(expiration).format('DD/MM/YYYY, HH:mm')}
          </p>
        </div>
      </div>

      <div className="bg-base-300 h-[1px] my-4 md:hidden" />

      <div className="flex flex-col md:flex-row gap-5 md:gap-12">
        <div className="flex flex-row md:flex-col justify-between md:gap-2">
          <p className="text-sm opacity-60">Your balance</p>
          <p>
            {<MintAmount amount={amount} mintAddress={mintAddress} />}{' '}
            <MintSymbol mintAddress={mintAddress} />
          </p>
        </div>
        {showTotal && (
          <div className="flex flex-row md:flex-col justify-between md:gap-2">
            <p className="text-sm opacity-60">Total</p>
            <p>
              <MintAmount amount={total} mintAddress={mintAddress} />{' '}
              <MintSymbol mintAddress={mintAddress} />
            </p>
          </div>
        )}
        <div className="flex flex-row md:flex-col justify-between md:gap-2">
          <p className="text-sm opacity-60">Remaining</p>
          <p>
            <MintAmount
              amount={amount.sub(total).isNeg() ? new BN(0) : amount.sub(total)}
              mintAddress={mintAddress}
            />{' '}
            <MintSymbol mintAddress={mintAddress} />
          </p>
        </div>
      </div>
    </div>
  )
}
