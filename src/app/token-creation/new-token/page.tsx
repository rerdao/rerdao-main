'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  createV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata'
import { percentAmount, KeypairSigner } from '@metaplex-foundation/umi'
import {
  UploadMetadataInput,
  toMetaplexFileFromBrowser,
} from '@metaplex-foundation/js'
import { encode } from 'bs58'

import TokenKeypair from './tokenKeypair'
import MintLogoUpload from '../edit-token/imgUpload'
import NewWindow from '@/components/newWindow'

import { usePushMessage } from '@/components/message/store'
import { TOKEN_20202_PROGRAM_ID } from '@/hooks/spl.hook'
import { solscan } from '@/helpers/explorers'
import { useMpl, useUmi } from '@/hooks/mpl.hook'

export default function NewToken() {
  const [mint, setMint] = useState<KeypairSigner>()
  const [logo, setLogo] = useState<File>()
  const [urlImg, setUrlImg] = useState<string>()
  const [decimals, setDecimals] = useState(9)
  const [mintSymbol, setMintSymbol] = useState<string>()
  const [mintName, setMintName] = useState<string>()
  const [isToken2022, setIsToken2022] = useState(false)
  const [loading, setLoading] = useState(false)
  const { wallet } = useWallet()
  const { push } = useRouter()
  const pushMessage = usePushMessage()
  const mpl = useMpl()
  const umi = useUmi()

  const err = useMemo(() => {
    if (decimals < 0 || decimals > 18) return 'Invalid decimals.'
    if (!logo && !urlImg) return 'Please select logo.'
    if (!mintName) return 'Please input mint name.'
    if (!mint) return 'Please input mint address.'
    return ''
  }, [decimals, mint, logo, mintName, urlImg])

  const onCreate = useCallback(async () => {
    try {
      setLoading(true)
      if (!wallet) throw new Error('Please connect wallet first.')
      if (err) throw new Error(err)
      if (!mint || !mintName) return

      const tokenMetadata: UploadMetadataInput = {
        name: mintName,
        symbol: mintSymbol,
        image: urlImg ? urlImg : await toMetaplexFileFromBrowser(logo!),
      }
      const { uri } = await mpl.nfts().uploadMetadata(tokenMetadata)

      const { signature } = await createV1(umi, {
        mint,
        uri: uri,
        name: mintName,
        symbol: mintSymbol,
        decimals: decimals,
        isMutable: true,
        sellerFeeBasisPoints: percentAmount(0),
        tokenStandard: TokenStandard.Fungible,
      }).sendAndConfirm(umi)

      pushMessage(
        'alert-success',
        'Successfully created a new token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(encode(signature)), '_blank'),
        },
      )
      push(`/token-creation/edit-token/details?mintAddress=${mint.publicKey}`)
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [
    wallet,
    err,
    mint,
    mintName,
    mintSymbol,
    urlImg,
    logo,
    mpl,
    umi,
    decimals,
    pushMessage,
    push,
  ])

  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full flex justify-end">
        <div className="tooltip" data-tip="Token 2022 (Coming soon)">
          <input
            type="checkbox"
            className="toggle toggle-xs"
            checked={isToken2022}
            onChange={(e) => setIsToken2022(e.target.checked)}
            disabled
          />
        </div>
      </div>
      <div className="col-span-full">
        <MintLogoUpload
          urlImg={urlImg}
          setUrlImg={setUrlImg}
          logo={logo}
          setLogo={setLogo}
        />
      </div>
      <div className="col-span-full">
        <TokenKeypair keypair={mint} onChange={setMint} />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <p className="text-sm font-bold">Token Decimals</p>
        <input
          className="input w-full bg-base-200"
          type="number"
          step={1}
          min={0}
          max={18}
          name="decimals"
          placeholder="Decimals"
          value={decimals}
          onChange={(e) => setDecimals(Number(e.target.value))}
        />
      </div>
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm font-bold">Token Name</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="token-name"
          placeholder="Token Name"
          value={mintName}
          onChange={(e) => setMintName(e.target.value)}
        />
      </div>
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm font-bold">Token Symbol</p>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="token-symbol"
          placeholder="Token Symbol"
          value={mintSymbol}
          onChange={(e) => setMintSymbol(e.target.value)}
        />
      </div>

      <div className="col-span-full">
        <button
          className="btn btn-primary w-full"
          onClick={onCreate}
          disabled={loading || !!err}
        >
          {loading && <div className="loading loading-spinner" />}
          {err ? err : 'Create'}
        </button>
      </div>
      {isToken2022 && (
        <div
          onClick={() =>
            window.open(solscan(TOKEN_20202_PROGRAM_ID.toBase58()), '_blank')
          }
          className="col-span-full hover:cursor-pointer flex items-center gap-1"
        >
          <p className="text-sm opacity-60">
            * You are working with Token-2022 Program
          </p>
          <NewWindow href={solscan(TOKEN_20202_PROGRAM_ID.toBase58())} />
        </div>
      )}
    </div>
  )
}
