'use client'
import { useCallback, useMemo, useState } from 'react'
import { Wallet } from '@solana/wallet-adapter-react'
import copy from 'copy-to-clipboard'
import { BN } from 'bn.js'
import { useFloating, offset, flip, shift } from '@floating-ui/react'
import classNames from 'classnames'

import { ArrowUpRightSquare, Copy, LogOut } from 'lucide-react'
import { WalletIcon } from '@solana/wallet-adapter-react-ui'

import { asyncWait, numeric, shortenAddress } from '@/helpers/utils'
import { solscan } from '@/helpers/explorers'
import solConfig from '@/configs/sol.config'
import { useLamports } from '@/providers/wallet.provider'
import { undecimalize } from '@/helpers/decimals'

export type WalletInfoProps = {
  wallet: Wallet
  onDisconnect?: () => void
}

export default function WalletInfo({
  wallet,
  onDisconnect = () => {},
}: WalletInfoProps) {
  const [copied, setCopied] = useState(false)
  const {
    refs: { setReference, setFloating },
    floatingStyles,
  } = useFloating({
    middleware: [offset(5), flip(), shift()],
  })
  const lamports = useLamports()

  const address = useMemo(
    () => wallet.adapter.publicKey?.toBase58() || '',
    [wallet.adapter.publicKey],
  )

  const onCopy = useCallback(async () => {
    copy(address)
    setCopied(true)
    await asyncWait(1500)
    return setCopied(false)
  }, [address])

  return (
    <div className="dropdown p-0 flex">
      <label tabIndex={0} ref={setReference} className="menu-item gap-2 w-full">
        <WalletIcon className="avatar h-5 w-5" wallet={wallet} />
        <p className="menu-option font-semibold">{shortenAddress(address)}</p>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-md p-2 shadow-xl bg-base-100 rounded-box !w-64 z-10 m-0"
        style={floatingStyles}
        ref={setFloating}
      >
        <li>
          <div className="active flex flex-col gap-1">
            <div className="flex flex-row gap-1 w-full items-center">
              <p className="flex-auto text-xs font-bold opacity-60">
                {shortenAddress(address)}
              </p>
              <span className="badge badge-accent">{solConfig.network}</span>
            </div>
            <div className="flex flex-row gap-1 w-full items-center">
              <p className="font-bold">
                {numeric(undecimalize(new BN(lamports), 9)).format(
                  '0,0.[0000]',
                )}
              </p>
              <p className="text-info">◎</p>
            </div>
          </div>
        </li>
        <li>
          <a className="flex" onClick={onCopy} href="#">
            <span className="flex-auto">Copy Address</span>
            <span
              className={classNames('tooltip', {
                'tooltip-open': copied,
              })}
              data-tip={copied ? 'Copied' : 'Copy'}
            >
              <Copy className="h-4 w-4" />
            </span>
          </a>
        </li>
        <li>
          <a
            className="flex"
            href={solscan(address)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex-auto">View on Explorer</span>
            <ArrowUpRightSquare className="h-4 w-4" />
          </a>
        </li>
        <li>
          <a className="flex link-error" onClick={onDisconnect} href="#">
            <span className="flex-auto">Disconnect</span>
            <LogOut className="h-4 w-4" />
          </a>
        </li>
      </ul>
    </div>
  )
}
