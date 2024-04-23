'use client'
import { useCallback, useMemo } from 'react'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import useSWR from 'swr'
import BN from 'bn.js'

import { Wallet2 } from 'lucide-react'
import HeroCard from '../heroCard'

import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { usePrices } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { numeric } from '@/helpers/utils'
import { useLamports } from '@/providers/wallet.provider'
import { useMints } from '@/hooks/spl.hook'

export default function TotalBalance() {
  const myAccounts = useAllTokenAccounts()
  const lamports = useLamports()

  const mintAddresses = useMemo(() => {
    const solAddress = WRAPPED_SOL_MINT.toBase58()
    const myMints = Object.values(myAccounts).map(({ mint }) => mint.toBase58())
    return [solAddress, ...myMints]
  }, [myAccounts])

  const mints = useMints(mintAddresses)
  const prices = usePrices(mintAddresses)
  const decimals = mints.map((mint) => mint?.decimals || 0)

  const fetchTotal = useCallback(
    async ([prices, decimals]: [number[], number[]]) => {
      if (!prices || !prices.length) return 0
      let total = Number(undecimalize(new BN(lamports), 9)) * prices[0]
      let mintIdx = 1
      for (const address in myAccounts) {
        const { amount } = myAccounts[address]
        const numAmount = Number(undecimalize(amount, decimals[mintIdx]))
        total += numAmount * prices[mintIdx]
        mintIdx++
      }
      return total
    },
    [lamports, myAccounts],
  )

  const { data: totalUSD, isLoading } = useSWR(
    [prices, decimals, 'totalBalance'],
    fetchTotal,
  )

  return (
    <HeroCard
      Icon={Wallet2}
      label="Total balance"
      loading={isLoading}
      value={numeric(totalUSD || 0).format('$0,0.[0000]')}
    />
  )
}
