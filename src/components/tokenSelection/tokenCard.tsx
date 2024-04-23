'use client'
import BN from 'bn.js'
import classNames from 'classnames'

import {
  MintAmount,
  MintLogo,
  MintName,
  MintSymbol,
  MintValue,
} from '@/components/mint'
import Clipboard from '@/components/clipboard'
import NewWindow from '@/components/newWindow'

import { solscan } from '@/helpers/explorers'
import { useTokenAccountByMintAddress } from '@/providers/tokenAccount.provider'

export type TokenCardProps = {
  mintAddress: string
  onClick?: () => void
  active?: boolean
  showBalance?: boolean
}

export default function TokenCard({
  mintAddress,
  onClick = () => {},
  active = false,
  showBalance = false,
}: TokenCardProps) {
  const { amount } = useTokenAccountByMintAddress(mintAddress) || {
    amount: new BN(0),
  }

  return (
    <div
      className={classNames(
        'group card w-full p-2 hover:bg-base-200 cursor-pointer',
        { 'bg-accent': active },
      )}
      onClick={onClick}
    >
      <div className="flex gap-2">
        <MintLogo mintAddress={mintAddress} />
        <div className="flex-auto">
          <p className="font-semibold">
            <MintSymbol mintAddress={mintAddress} />
          </p>
          <p className="text-sm opacity-60">
            <MintName mintAddress={mintAddress} />
          </p>
        </div>
        <div className="invisible group-hover:visible">
          <Clipboard content={mintAddress} idleText="Copy Token Address" />
          <NewWindow href={solscan(mintAddress)} />
        </div>
        {showBalance && (
          <div className="flex flex-col gap-1 items-end group-hover:hidden">
            <div className="flex flex-row gap-1">
              <p className="text-xs">
                <MintAmount mintAddress={mintAddress} amount={amount} />
              </p>
              <p className="text-xs opacity-60">
                <MintSymbol mintAddress={mintAddress} />
              </p>
            </div>
            <div className="text-sm opacity-60">
              <MintValue mintAddress={mintAddress} amount={amount} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
