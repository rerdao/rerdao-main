'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  updateV1,
  fetchMetadataFromSeeds,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  MetaplexFile,
  UploadMetadataInput,
  toMetaplexFileFromBrowser,
} from '@metaplex-foundation/js'
import { publicKey as umiPubKey } from '@metaplex-foundation/umi'
import { encode } from 'bs58'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

import MintLogoUpload from '../imgUpload'

import { numeric } from '@/helpers/utils'
import { useMpl, useNfts, useUmi } from '@/hooks/mpl.hook'
import { useMints } from '@/hooks/spl.hook'
import { undecimalize } from '@/helpers/decimals'
import { usePushMessage } from '@/components/message/store'
import { solscan } from '@/helpers/explorers'

type UploadMetadataProp = {
  mintAddress: string
}

export default function UploadMetadata({ mintAddress }: UploadMetadataProp) {
  const [mintSymbol, setMintSymbol] = useState<string>()
  const [mintName, setMintName] = useState<string>()
  const [logo, setLogo] = useState<File>()
  const [urlImg, setUrlImg] = useState<string>()
  const [loading, setLoading] = useState(false)
  const pushMessage = usePushMessage()
  const mpl = useMpl()
  const umi = useUmi()
  const { publicKey } = useWallet()
  const [nft] = useNfts([mintAddress])
  const [mint] = useMints([mintAddress])

  const isOwner =
    !!publicKey &&
    !!mint?.mintAuthority &&
    publicKey.equals(mint.mintAuthority as PublicKey)

  const onUpdateMetadata = useCallback(async () => {
    if (!mintName || !mintSymbol) return
    try {
      setLoading(true)
      const metadata = await fetchMetadataFromSeeds(umi, {
        mint: umiPubKey(mintAddress),
      })
      let image: string | MetaplexFile = urlImg || ''
      if (logo) image = await toMetaplexFileFromBrowser(logo)

      const tokenMetadata: UploadMetadataInput = {
        name: mintName,
        symbol: mintSymbol,
        image: image ? image : nft?.json?.image,
      }
      const { uri } = await mpl.nfts().uploadMetadata(tokenMetadata)
      const { signature } = await updateV1(umi, {
        mint: umiPubKey(mintAddress),
        data: { ...metadata, name: mintName, symbol: mintSymbol, uri },
      }).sendAndConfirm(umi)
      pushMessage(
        'alert-success',
        'Successfully updated token. Click here to view on explorer.',
        {
          onClick: () => window.open(solscan(encode(signature)), '_blank'),
        },
      )
    } catch (er: any) {
      pushMessage('alert-error', er.message)
    } finally {
      setLoading(false)
    }
  }, [
    logo,
    mintAddress,
    mintName,
    mintSymbol,
    mpl,
    nft?.json?.image,
    pushMessage,
    umi,
    urlImg,
  ])

  useEffect(() => {
    if (nft?.name) setMintName(nft.name)
    if (nft?.symbol) setMintSymbol(nft.symbol)
  }, [nft?.name, nft?.symbol])

  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full ">
        <MintLogoUpload
          setLogo={setLogo}
          logo={logo}
          mintAddress={mintAddress}
          urlImg={urlImg}
          setUrlImg={setUrlImg}
        />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <span className="flex flex-row items-center gap-2">
          <p className="flex-auto text-sm font-bold">Total Supply</p>
          <p className="text-sm font-bold">Decimals</p>
          <span className="badge badge-neutral font-bold">
            {mint?.decimals}
          </span>
        </span>
        <input
          className="input bg-base-200 w-full"
          type="text"
          name="supply"
          placeholder="Supply"
          value={numeric(
            mint ? undecimalize(mint.supply, mint.decimals) : 0,
          ).format('0,0')}
          readOnly
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
          onClick={onUpdateMetadata}
          disabled={loading || !isOwner}
        >
          {loading && <span className="loading loading-spinner" />} Update
          Metadata
        </button>
      </div>
    </div>
  )
}
