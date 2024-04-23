'use client'
import { useState } from 'react'
import Link from 'next/link'
import classNames from 'classnames'

import { isAddress } from '@/helpers/utils'

export default function SearchToken() {
  const [mintAddress, setMintAddress] = useState('')

  return (
    <div className="grid grid-cols-12 gap-2 justify-center gap-x-2 gap-y-4">
      <div className="col-span-full">
        <input
          type="text"
          name="token-address"
          placeholder="Token Address"
          className={classNames('input w-full bg-base-200', {
            'ring-2 ring-error': !!mintAddress && !isAddress(mintAddress),
          })}
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
        />
      </div>
      <div className="col-span-full">
        <Link
          className={classNames('btn btn-primary w-full', {
            'btn-disabled': !isAddress(mintAddress),
          })}
          href={
            isAddress(mintAddress)
              ? `/token-creation/edit-token/details?mintAddress=${mintAddress}`
              : '#'
          }
        >
          Enter
        </Link>
      </div>
    </div>
  )
}
