'use client'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

import { usePushMessage } from '@/components/message/store'
import { isAddress } from '@/helpers/utils'
import { useMints, useSpl } from '@/hooks/spl.hook'

type UpdateAuthorityProps = {
  mintAddress: string
}

export default function UpdateAuthority({ mintAddress }: UpdateAuthorityProps) {
  const [loading, setLoading] = useState(false)
  const [freezeAuthority, setFreezeAuthority] = useState<string>()
  const [mint] = useMints([mintAddress])
  const spl = useSpl()
  const { publicKey } = useWallet()
  const pushMessage = usePushMessage()

  const onUpdate = useCallback(async () => {
    try {
      if (!publicKey) throw new Error('Wallet is not connected.')
      if (!isAddress(mintAddress) || !isAddress(freezeAuthority))
        throw new Error('Invalid parameters.')
      setLoading(true)
      const txId = await spl.methods
        .setAuthority({ freezeAccount: {} }, new PublicKey(freezeAuthority))
        .accounts({
          owned: new PublicKey(mintAddress),
          owner: publicKey,
          signer: publicKey,
        })
        .rpc()

      pushMessage(
        'alert-success',
        'Successfully created a new token. Click here to view on explorer.',
        { onClick: () => window.open(txId, '_blank') },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [freezeAuthority, mintAddress, publicKey, pushMessage, spl.methods])

  useEffect(() => {
    if (mint?.freezeAuthority)
      setFreezeAuthority((mint.freezeAuthority as PublicKey).toBase58())
  }, [mint?.freezeAuthority])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold cursor-pointer text-error ">
          Update Freeze Authority
        </p>
        <p className="text-sm opacity-60">
          You will no longer be able to activate the Freeze Authority since it
          is unauthorized (i.e. when the field is empty).
        </p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="update-freeze-authority"
          placeholder={
            !mint?.freezeAuthority ? 'Deactivated' : 'Freeze Authority'
          }
          value={freezeAuthority}
          onChange={(e) => setFreezeAuthority(e.target.value)}
          disabled={!mint?.freezeAuthority}
        />
      </div>
      <button
        disabled={
          !isAddress(freezeAuthority) ||
          freezeAuthority === (mint?.freezeAuthority as PublicKey).toBase58() ||
          loading
        }
        onClick={onUpdate}
        className="btn col-span-full btn-primary btn-block"
      >
        {loading && <span className="loading loading-spinner" />} Update
      </button>
    </div>
  )
}
