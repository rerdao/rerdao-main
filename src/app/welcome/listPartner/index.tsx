'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

import Island from '@/components/island'
import ElementIObs from '@/components/IntersectionObserver'

import { useTheme } from '@/providers/ui.provider'
import { LIST_PARTNER } from '@/app/welcome/listPartner/partners'

type PartnerProps = {
  logo: string
  description: string
}

function Partner({ logo, description }: PartnerProps) {
  const cardPartnerRef = useRef<HTMLDivElement | null>(null)
  return (
    <div
      ref={cardPartnerRef}
      className="card-partner flex flex-col items-center gap-6 p-6 h-full w-full bg-base-100 rounded-3xl"
    >
      <Island>
        <Image src={logo} height={36} alt="" />
      </Island>
      <p className="opacity-60 text-center md:text-sm">{description}</p>
      <ElementIObs threshold={0.08} querySelector={cardPartnerRef} />
    </div>
  )
}
export default function ListPartner() {
  const listPartnerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()
  gsap.registerPlugin(ScrollTrigger)

  const partners = LIST_PARTNER.map((partner) => ({
    logo: theme === 'light' ? partner.logoLight : partner.logoDark,
    description: partner.description,
  }))

  useEffect(() => {
    const animationApp = gsap.to(listPartnerRef.current, {
      scrollTrigger: {
        trigger: listPartnerRef.current,
        scroller: '.welcome-container',
        onEnter: () => listPartnerRef.current?.classList.add('active'),
        onLeaveBack: () => listPartnerRef.current?.classList.remove('active'),
      },
    })
    return () => {
      animationApp.kill()
    }
  }, [])

  return (
    <div className="partners">
      <div ref={listPartnerRef} className="pos-center gap-16 px-8 pt-32 w-full">
        <div className="pos-center gap-4">
          <h3 className="title-partners text-center text-black">Our Partner</h3>
          <p className="desc-partners text-center text-black text-2xl opacity-60">
            Let&apos;s achieve incredible things together
          </p>
        </div>
        <div className="list-partner grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 place-items-center">
          {partners.map(({ logo, description }) => (
            <Partner key={description} logo={logo} description={description} />
          ))}
        </div>
      </div>
    </div>
  )
}
