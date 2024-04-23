'use client'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  MouseEvent,
} from 'react'
import BN from 'bn.js'
import classNames from 'classnames'
import { WRAPPED_SOL_MINT } from '@metaplex-foundation/js'
import { utils } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'

import Modal from '@/components/modal'
import MintInput from '../../mintInput'

import { useAllTokenAccounts } from '@/providers/tokenAccount.provider'
import { usePoolByAddress } from '@/providers/pools.provider'
import { useDeposit, useOracles } from '@/hooks/pool.hook'
import { numeric } from '@/helpers/utils'
import { useMints } from '@/hooks/spl.hook'
import { decimalize, undecimalize } from '@/helpers/decimals'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'
import { useLamports } from '@/providers/wallet.provider'

export default function Deposit({ poolAddress }: { poolAddress: string }) {
  const pool = usePoolByAddress(poolAddress)
  const [open, setOpen] = useState(false)
  const [acceptAnyway, setAcceptAnyway] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amounts, setAmounts] = useState<string[]>([])
  const [activeIndx, setActiveIndx] = useState<number>()

  const { calcLptOut, calcLpForTokensZeroPriceImpact } = useOracles()
  const accounts = useAllTokenAccounts()
  const { publicKey } = useWallet()
  const mints = useMints(pool.mints.map((mint) => mint.toBase58()))
  const decimals = mints.map((mint) => mint?.decimals || 0)
  const [mintLpt] = useMints([pool.mintLpt.toBase58()])
  const lamports = useLamports()
  const pushMessage = usePushMessage()

  const deposit = useDeposit(poolAddress, amounts)
  const onDeposit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      try {
        setLoading(true)
        const txId = await deposit()
        pushMessage(
          'alert-success',
          'Successfully deposit token. Click here to view on explorer.',
          {
            onClick: () => window.open(solscan(txId || ''), '_blank'),
          },
        )
        setOpen(false)
      } catch (er: any) {
        pushMessage('alert-error', er.message)
      } finally {
        setLoading(false)
      }
    },
    [deposit, pushMessage],
  )

  const onAmounts = (index: number, amount: string) => {
    const nextAmounts = [...amounts]
    nextAmounts[index] = amount
    setActiveIndx(index)
    setAmounts(nextAmounts)
  }

  const amountsSuggestion = useMemo(() => {
    if (activeIndx === undefined) return []
    const result = pool.reserves.map((reserve, index) => {
      if (index === activeIndx) return ''
      const activeBalance = Number(
        undecimalize(pool.reserves[activeIndx], decimals[activeIndx]),
      )
      const reserveBalance = Number(undecimalize(reserve, decimals[index]))
      const balanceRatio =
        (activeBalance + Number(amounts[activeIndx])) / activeBalance
      const suggestedAmount = (reserveBalance * (balanceRatio - 1)).toFixed(
        decimals[index],
      )
      return suggestedAmount
    })
    return result
  }, [activeIndx, amounts, decimals, pool.reserves])

  const { lptOut, priceImpact } = useMemo(() => {
    const { reserves, weights, fee, tax } = pool
    const amountIns = amounts.map((amount, index) =>
      decimalize(amount, decimals[index]),
    )
    const out = calcLptOut(
      amountIns,
      reserves,
      weights,
      mintLpt?.supply || new BN(0),
      decimals,
      fee.add(tax),
    )

    const lpOutZeroPriceImpact = Number(
      calcLpForTokensZeroPriceImpact(
        amountIns,
        reserves,
        weights,
        mintLpt?.supply || new BN(0),
        decimals,
      ).toFixed(9),
    )
    const priceImpact = 1 - out / lpOutZeroPriceImpact

    return { lptOut: out, priceImpact: priceImpact || 0 }
  }, [
    amounts,
    calcLpForTokensZeroPriceImpact,
    calcLptOut,
    decimals,
    mintLpt?.supply,
    pool,
  ])

  const ok = useMemo(() => {
    if (!publicKey) return false
    for (const index in amounts) {
      const mint = pool.mints[index]
      const ataAddress = utils.token.associatedAddress({
        mint,
        owner: publicKey,
      })
      let { amount: mintAmount } = accounts[ataAddress.toBase58()] || {
        amount: new BN(0),
      }

      if (WRAPPED_SOL_MINT.equals(mint))
        mintAmount = mintAmount.add(new BN(lamports))

      const amount = decimalize(amounts[index], decimals[index])
      if (mintAmount.lt(amount)) return false
    }
    return !!lptOut && (priceImpact <= 0.05 || acceptAnyway)
  }, [
    accounts,
    amounts,
    decimals,
    lamports,
    lptOut,
    pool.mints,
    priceImpact,
    publicKey,
    acceptAnyway,
  ])

  useEffect(() => {
    if (pool.mints.length) setAmounts(new Array(pool.mints.length).fill('0'))
  }, [pool.mints.length])

  return (
    <Fragment>
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm">
        Deposit
      </button>
      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-6">
          <h5 className="col-span-full">Deposit</h5>
          <div className="col-span-full flex flex-col gap-2  max-h-96 overflow-y-auto overflow-x-hidden no-scrollbar">
            {pool.mints.map((mint, index) => (
              <MintInput
                key={mint.toBase58()}
                amount={amounts[index]}
                mintAddress={mint.toBase58()}
                onAmount={(amount) => onAmounts(index, amount)}
                index={index}
                weights={pool.weights}
                suggestAmount={amountsSuggestion[index]}
                visibleSuggest={
                  activeIndx !== undefined &&
                  !!amounts[activeIndx] &&
                  !!amountsSuggestion[index] &&
                  Number(amountsSuggestion[index]) > Number(amounts[index])
                }
              />
            ))}
          </div>
          <div className="col-span-full flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="flex-auto text-sm opacity-60">Price Impact</p>
              <p
                className={classNames('text-[#FA8C16]', {
                  '!text-[#14E041]': !priceImpact || priceImpact < 0.01,
                  '!text-[#D72311]': priceImpact > 0.05,
                })}
              >
                {numeric(priceImpact).format('0,0.[0000]%')}
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="flex-auto text-sm opacity-60">You will receive</p>
              <p>
                {lptOut > 0 && lptOut < 0.0001
                  ? 'LP < 0.0001'
                  : numeric(lptOut).format('0,0.[0000]')}{' '}
                LP
              </p>
            </div>
          </div>
          {priceImpact > 0.05 && (
            <div
              onClick={() => setAcceptAnyway(!acceptAnyway)}
              className="col-span-12 flex gap-2 items-center cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox"
                checked={acceptAnyway}
              />
              <p className="text-sm">
                I agree to execute this trade with the high price impact.
              </p>
            </div>
          )}
          <button
            onClick={onDeposit}
            disabled={!ok}
            className="btn btn-primary col-span-12"
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            Deposit
          </button>
        </div>
      </Modal>
    </Fragment>
  )
}
