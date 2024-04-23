'use client'
import Image from 'next/image'
import { CSSProperties } from 'react'

export type BrandLogoProps = {
  size?: number
}

export function BrandLogo({ size = 32 }: BrandLogoProps) {
  return (
    <div className="avatar">
      <div className="mask mask-squircle" style={{ width: size }}>
        <Image
          className="!object-contain"
          src="/web.svg"
          alt="rerdao"
          width={size}
          height={size}
        />
      </div>
    </div>
  )
}

export type BrandProps = {
  style?: CSSProperties
  onClick?: () => void
  size?: number
  named?: boolean
}

export default function Brand({
  style = {},
  onClick = () => { },
  size = 32,
  named = true,
}: BrandProps) {
  return (
    <div
      style={style}
      className="flex flex-row items-center gap-2 cursor-pointer"
      onClick={onClick}
    >
      <BrandLogo size={size} />
      {named && <p className="font-semibold text-2xl">RER DAO</p>}
    </div>
  )
}
