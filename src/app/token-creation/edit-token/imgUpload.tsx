'use client'
import { ChangeEvent, useCallback, useMemo, useRef } from 'react'
import classNames from 'classnames'

import { MintLogo } from '@/components/mint'
import { ImagePlus, X } from 'lucide-react'

type MintLogoUploadProp = {
  logo?: File
  setLogo?: (logo?: File) => void
  mintAddress?: string
  urlImg?: string
  setUrlImg?: (img?: string) => void
}
export default function MintLogoUpload({
  mintAddress = '',
  urlImg,
  setUrlImg,
  logo,
  setLogo,
}: MintLogoUploadProp) {
  const ref = useRef<HTMLInputElement>(null)

  const onClearLogo = useCallback(() => {
    if (!setLogo || !setUrlImg) return
    if (ref.current?.value) ref.current.value = ''
    if (urlImg) setUrlImg('')
    return setLogo(undefined)
  }, [setLogo, setUrlImg, urlImg])

  const onUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!setLogo) return
      const [logo] = Array.from(e.target.files || [])
      return setLogo(logo)
    },
    [setLogo],
  )

  const mintLogoFallback = useMemo(() => {
    if (logo) return URL.createObjectURL(logo)
    if (urlImg) return urlImg
    return ''
  }, [urlImg, logo])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full flex flex-row justify-center">
        <div className="group relative cursor-pointer">
          <MintLogo
            mintAddress={mintAddress}
            className="w-24 h-24 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2"
            fallback={mintLogoFallback}
          />
          <button
            className="invisible group-hover:visible btn btn-circle btn-sm btn-neutral absolute -right-1 -top-1"
            onClick={onClearLogo}
            disabled={!logo && !urlImg}
          >
            <X className="w-4 h-4" />
          </button>
          <label
            className={classNames(
              'btn btn-circle btn-sm btn-secondary absolute -right-1 -bottom-1',
              {
                ' grayscale cursor-not-allowed': !!urlImg,
              },
            )}
          >
            <ImagePlus className="w-4 h-4" />
            <input
              type="file"
              name="token-logo"
              accept="image/*"
              className="invisible absolute"
              onChange={onUpload}
              ref={ref}
              disabled={!!urlImg}
            />
          </label>
        </div>
      </div>

      <div className="col-span-full">
        <input
          className="input bg-base-200 w-full"
          type="text"
          placeholder="Input url image"
          value={urlImg}
          onChange={(e) => {
            if (setUrlImg) setUrlImg(e.target.value)
          }}
          disabled={!!logo}
        />
      </div>
    </div>
  )
}
