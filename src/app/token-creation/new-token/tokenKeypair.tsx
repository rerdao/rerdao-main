'use client'
import { useEffect, useState } from 'react'
import { KeypairSigner, generateSigner } from '@metaplex-foundation/umi'

import { encode } from 'bs58'
import copy from 'copy-to-clipboard'
import classNames from 'classnames'

import { Copy, Info, Settings, Shuffle } from 'lucide-react'
import { SmActionInput } from './actionInput'

import { useUmi } from '@/hooks/mpl.hook'

export type TokenKeypairProps = {
  keypair?: KeypairSigner
  onChange: (keypair: KeypairSigner) => void
}

export default function TokenKeypair({ keypair, onChange }: TokenKeypairProps) {
  const [prefix, setPrefix] = useState('')
  const [loading, setLoading] = useState(false)
  const umi = useUmi()

  useEffect(() => {
    if (!keypair) onChange(generateSigner(umi))
    if (loading && keypair) {
      if (keypair.publicKey.toLowerCase().startsWith(prefix.toLowerCase()))
        setLoading(false)
      else onChange(generateSigner(umi))
    }
  }, [loading, keypair, prefix, onChange, umi])

  return (
    <div className="grid-cols-12 gap-2">
      <div className="col-span-12">
        <div className="col-span-12 flex flex-row gap-2 items-center pb-2">
          <p className="flex-auto text-sm font-bold">Token Address</p>
        </div>
      </div>
      <div className="col-span-12">
        <div className="relative flex flex-row items-center">
          <input
            className="input w-full px-12 bg-base-200"
            type="text"
            name="token-keypair"
            value={keypair?.publicKey}
            readOnly
          />
          <button
            className="absolute left-2 btn btn-sm btn-square"
            onClick={() => onChange(generateSigner(umi))}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <div
            className={classNames('absolute right-2 dropdown dropdown-end', {
              'dropdown-open': loading,
            })}
          >
            <label tabIndex={0} className="btn btn-sm btn-square">
              <Settings className="h-4 w-4" />
            </label>
            <div tabIndex={0} className="dropdown-content z-10">
              <div className="card bg-base-100 shadow-xl p-4 flex flex-col gap-2 w-[256px]">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Public Key</span>
                  </label>
                  <SmActionInput
                    type="text"
                    name="token-keypair"
                    value={keypair?.publicKey}
                    onClick={() => copy(keypair?.publicKey || '')}
                    readOnly
                  >
                    <Copy className="w-4 h-4" />
                  </SmActionInput>
                </div>
                <div className="form-control w-full">
                  <label
                    className="label cursor-pointer"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="label-text text-error">
                      <span
                        className="tooltip flex flex-row gap-1 items-center"
                        data-tip="DO NOT LEAK THIS SECRET KEY!"
                      >
                        Secret Key
                      </span>
                    </span>
                    <button
                      className="label-text-alt btn btn-xs"
                      onClick={() => onChange(generateSigner(umi))}
                      disabled={loading}
                    >
                      Shuffle
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </label>
                  <SmActionInput
                    type="text"
                    name="token-keypair"
                    value={encode(keypair?.secretKey || [])}
                    onClick={() => copy(encode(keypair?.secretKey || []))}
                    readOnly
                  >
                    <Copy className="w-4 h-4" />
                  </SmActionInput>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text cursor-pointer">
                      <span
                        className="tooltip flex flex-row gap-1 items-center"
                        data-tip="The process is quite computationally heavy and takes time as long as the length of the prefix. To limit the computation under 15 minutes, the prefix is 3 characters of maximum."
                      >
                        <Info className="w-3 h-3" />
                        Find a prefixed address?
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="prefix"
                    placeholder="The prefix (i.e. USD)"
                    className="input input-sm w-full bg-base-200"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    maxLength={3}
                    disabled={loading}
                  />
                </div>
                <button
                  className={
                    'btn btn-sm ' + (loading ? 'btn-neutral' : 'btn-primary ')
                  }
                  onClick={() => setLoading(!loading)}
                  disabled={!prefix}
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {loading ? 'Stop' : 'Bruce Force'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
