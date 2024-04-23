'use client'
import { useEffect, useState } from 'react'

import { Search } from 'lucide-react'
import Modal from '@/components/modal'
import Island from '@/components/island'
import TokenList from './tokenList'

import { useSearchMint } from '@/providers/mint.provider'

export type TokenSelectionType = {
  open?: boolean
  onCancel?: () => void
  mintAddress?: string
  onChange?: (mintAddress: string) => void
}

export default function TokenSelection({
  open,
  onCancel,
  mintAddress,
  onChange = () => {},
}: TokenSelectionType) {
  const [text, setText] = useState('')
  const [mints, setMints] = useState<MintMetadata[] | undefined>()
  const search = useSearchMint()

  useEffect(() => {
    if (!text.length) setMints(undefined)
    else if (text.length <= 2) setMints([])
    else setMints(search(text).map(({ item }) => item))
  }, [text, search])

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  return (
    <Modal open={open} onCancel={onCancel}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <h5>Search your token</h5>
        </div>
        <div className="col-span-12 relative flex flex-row items-center">
          <Search className="pointer-events-none w-4 h-4 absolute left-3" />
          <input
            type="search"
            name="search"
            placeholder="Search"
            className="input rounded-xl w-full pl-10 bg-base-200"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="col-span-12">
          <Island>
            <TokenList
              mints={mints}
              mintAddress={mintAddress}
              onChange={onChange}
            />
          </Island>
        </div>
      </div>
    </Modal>
  )
}
