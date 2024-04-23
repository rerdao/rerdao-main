'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

import Modal from '@/components/modal'
import { Settings2 } from 'lucide-react'

import { useMints, useSpl } from '@/hooks/spl.hook'
import { isAddress } from '@/helpers/utils'
import { usePushMessage } from '@/components/message/store'

type UpdateAuthorityProps = {
  mintAddress: string
}
export default function UpdateAuthority({ mintAddress }: UpdateAuthorityProps) {
  const [mintAuthority, setMintAuthority] = useState<string>()
  const [loading, setLoading] = useState(false)
  const { publicKey } = useWallet()
  const spl = useSpl()
  const pushMessage = usePushMessage()
  const [mint] = useMints([mintAddress])
  const [open, setOpen] = useState(false)

  const isOwner =
    !!publicKey &&
    !!mint?.mintAuthority &&
    publicKey.equals(mint.mintAuthority as PublicKey)

  const onUpdate = useCallback(async () => {
    try {
      if (!publicKey) throw new Error('Wallet is not connected.')
      if (!isAddress(mintAddress) || !isAddress(mintAuthority))
        throw new Error('Invalid parameters.')
      setLoading(true)

      const txId = await spl.methods
        .setAuthority({ mintTokens: {} }, new PublicKey(mintAuthority))
        .accounts({
          owned: mintAddress,
          owner: publicKey,
          signer: publicKey,
        })
        .rpc({ skipPreflight: true })

      pushMessage(
        'alert-success',
        'Successfully updated mint authority. Click here to view on explorer.',
        { onClick: () => window.open(txId, '_blank') },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }, [mintAddress, mintAuthority, publicKey, pushMessage, spl.methods])

  useEffect(() => {
    if (mint?.mintAuthority)
      setMintAuthority((mint.mintAuthority as PublicKey).toBase58())
  }, [mint?.mintAuthority])

  return (
    <Fragment>
      <div className="col-span-full flex items-center justify-between">
        <p className="text-sm font-bold">Mint Authority</p>
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
          mint?.mintAuthority
            ? (mint?.mintAuthority as PublicKey).toBase58()
            : undefined
        }
      />

      <Modal open={open} onCancel={() => setOpen(false)}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-full flex flex-col gap-2">
            <p className="text-sm font-bold">Mint Authority</p>
            <input
              className="input bg-base-200 w-full"
              type="text"
              name="mint-authority"
              placeholder="Mint Authority"
              value={mintAuthority}
              onChange={(e) => setMintAuthority(e.target.value)}
            />
          </div>
          <button
            disabled={
              !isAddress(mintAuthority) ||
              mintAuthority === (mint?.mintAuthority as PublicKey).toBase58() ||
              loading
            }
            onClick={onUpdate}
            className="btn btn-primary col-span-full"
          >
            {loading && <span className="loading loading-spinner" />}
            Update mint authority
          </button>
        </div>
      </Modal>
    </Fragment>
  )
}
