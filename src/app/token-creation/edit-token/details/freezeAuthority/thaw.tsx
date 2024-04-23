import { MouseEvent, useCallback, useState } from 'react'
import { utils } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

import { ThermometerSun } from 'lucide-react'

import { useSpl } from '@/hooks/spl.hook'
import { usePushMessage } from '@/components/message/store'
import { isAddress } from '@/helpers/utils'

type ThawProps = {
  mintAddress: string
}

export default function Thaw({ mintAddress }: ThawProps) {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const { publicKey } = useWallet()
  const spl = useSpl()
  const pushMessage = usePushMessage()

  const onThaw = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (!publicKey) return
      try {
        setLoading(true)
        const ataAddress = utils.token.associatedAddress({
          mint: new PublicKey(mintAddress),
          owner: new PublicKey(address),
        })

        const accountInfo = await spl.account.mint.getAccountInfo(ataAddress)
        if (!accountInfo) throw new Error('Token account not found.')

        const data = spl.coder.accounts.decode('account', accountInfo.data)
        if (Object.keys(data.state)[0] === 'initialized')
          throw new Error('The token account is already thaw.')
        const txId = await spl.methods
          .thawAccount()
          .accounts({
            account: ataAddress,
            mint: mintAddress,
            owner: publicKey,
          })
          .rpc()
        pushMessage(
          'alert-success',
          'Successfully thawed token. Click here to view on explorer.',
          { onClick: () => window.open(txId, '_blank') },
        )
      } catch (er: any) {
        pushMessage('alert-error', er.message)
      } finally {
        setLoading(false)
      }
    },
    [
      address,
      mintAddress,
      publicKey,
      pushMessage,
      spl.account.mint,
      spl.coder.accounts,
      spl.methods,
    ],
  )

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold text-error ">Thaw token account</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="thaw-account"
          placeholder="Input wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <button
        onClick={onThaw}
        className="btn col-span-full btn-secondary btn-block"
        disabled={!isAddress(address)}
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          <ThermometerSun size={16} />
        )}
        Thaw
      </button>
    </div>
  )
}
