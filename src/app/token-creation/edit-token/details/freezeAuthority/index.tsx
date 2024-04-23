'use client'
import { Fragment, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import classNames from 'classnames'

import Modal from '@/components/modal'
import UpdateAuthority from './update'
import Freeze from './freeze'
import Thaw from './thaw'

import { useMints } from '@/hooks/spl.hook'
import { Settings2 } from 'lucide-react'

enum FreezeAction {
  UpdateAuthority = 'Update Authority',
  Freeze = 'Freeze',
  Thaw = 'Thaw',
}

type FreezeAuthorityProps = {
  mintAddress: string
}

export default function FreezeAuthority({ mintAddress }: FreezeAuthorityProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(FreezeAction.UpdateAuthority)
  const { publicKey } = useWallet()
  const [mint] = useMints([mintAddress])

  const isOwner =
    !!publicKey &&
    !!mint?.freezeAuthority &&
    publicKey.equals(mint.freezeAuthority as PublicKey)

  return (
    <Fragment>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-full flex items-center justify-between">
          <p className="text-sm font-bold">Freeze Authority</p>
          {isOwner && (
            <button
              onClick={() => setOpen(true)}
              className="btn btn-primary btn-sm "
              disabled={!isOwner}
            >
              <Settings2 size={16} />
            </button>
          )}
        </div>
        <input
          className="col-span-full input bg-base-200 w-full"
          type="text"
          readOnly
          value={
            mint?.freezeAuthority
              ? (mint?.freezeAuthority as PublicKey).toBase58()
              : undefined
          }
        />
      </div>

      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-full tabs border-b-2">
            {Object.values(FreezeAction).map((value) => (
              <a
                key={value}
                className={classNames('tab ', {
                  'tab-active': tab === value,
                })}
                onClick={() => setTab(value)}
              >
                {value}
              </a>
            ))}
          </div>
          <div className="col-span-full">
            {tab === FreezeAction.UpdateAuthority ? (
              <UpdateAuthority mintAddress={mintAddress} />
            ) : tab === FreezeAction.Freeze ? (
              <Freeze mintAddress={mintAddress} />
            ) : (
              <Thaw mintAddress={mintAddress} />
            )}
          </div>
        </div>
      </Modal>
    </Fragment>
  )
}
