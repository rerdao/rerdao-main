'use client'
import { useRouter, useSearchParams } from 'next/navigation'

import MintToken from './mintToken'
import UpdateAuthority from './authority'
import UploadMetadata from './metadata'
import FreezeAuthority from './freezeAuthority'

import { isAddress } from '@/helpers/utils'

export default function TokenDetails() {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const mintAddress = searchParams.get('mintAddress') || ''

  if (!isAddress(mintAddress)) return push('/token-creation/edit-token/search')
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-4">
      <div className="col-span-full">
        <UploadMetadata mintAddress={mintAddress} />
      </div>
      <div className="col-span-full flex flex-col gap-2">
        <UpdateAuthority mintAddress={mintAddress} />
      </div>
      <div className="col-span-full">
        <FreezeAuthority mintAddress={mintAddress} />
      </div>
      <div className="col-span-full">
        <MintToken mintAddress={mintAddress} />
      </div>
    </div>
  )
}
