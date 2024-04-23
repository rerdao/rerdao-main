'use client'
import { Fragment } from 'react'

import Brand from '@/components/brand'
import { BadgeInfo } from 'lucide-react'

import deplConfig from '@/configs/depl.config'

export default function Maintainance() {
  if (!deplConfig.maintaining) return <Fragment />
  return (
    <div className="h-[100dvh] w-[100dvw] fixed top-0 left-0 bg-base-100 flex flex-col gap-8 justify-center items-center z-[9999]">
      <Brand />
      <div className="w-full grid grid-cols-12 gap-4">
        <h3 className="col-span-full text-center">
          RER DAO is under construction.
        </h3>
        <p className="col-span-full text-center opacity-60">
          Thank you for your patience. A big thing is coming in Reverion
          Hub.
        </p>
      </div>
      <div className="flex flex-row justify-center items-center gap-2">
        <BadgeInfo className="h-5 w-5" />
        <a
          className="font-bold"
          href="https://twitter.com/"
          target="_blank"
          rel="noreferrer"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}
