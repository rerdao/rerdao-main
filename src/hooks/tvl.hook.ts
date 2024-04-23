import BN from 'bn.js'
import { useMemo } from 'react'

import { usePrices } from '@/providers/mint.provider'
import { undecimalize } from '@/helpers/decimals'
import { useMints } from './spl.hook'

export const useTvl = (
  mintAddressToAmount: Array<{
    mintAddress: string
    amount: BN
  }>,
) => {
  const mintAddresses = useMemo(
    () => mintAddressToAmount.map(({ mintAddress }) => mintAddress),
    [mintAddressToAmount],
  )
  const amounts = useMemo(
    () => mintAddressToAmount.map(({ amount }) => amount),
    [mintAddressToAmount],
  )
  const prices = usePrices(mintAddresses)
  const mints = useMints(mintAddresses)
  const decimals = useMemo(() => mints.map((mint) => mint?.decimals), [mints])

  const tvl = useMemo(() => {
    if (!prices) return 0
    return decimals.reduce<number>((s, d, i) => {
      if (d === undefined) return s
      return s + Number(undecimalize(amounts[i], d)) * prices[i]
    }, 0)
  }, [amounts, prices, decimals])

  return tvl
}
