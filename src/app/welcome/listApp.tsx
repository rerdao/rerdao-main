'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

import {
  booster,
  farming,
  launchpad,
  merkleDistribution,
  swap,
} from '@/static/images/welcome/appsIcon'

const TOP_APPS = [
  { route: '/swap', name: 'Swap', icon: swap, disabled: false },
  { route: '/academy', name: 'Booster', icon: booster, disabled: true },
  { route: '/farming', name: 'Farming', icon: farming, disabled: false },
]

const BOTTOM_APPS = [
  {
    route: '/token-distribution/airdrop-vesting',
    name: 'Token Distribution',
    icon: merkleDistribution,
    disabled: false,
  },
  { route: '/launchpad', name: 'Launchpad', icon: launchpad, disabled: true },
]

type AppProps = {
  route: string
  name: string
  icon: string
  disabled: boolean
}

const App = ({ route, name, icon, disabled }: AppProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href={disabled ? '#' : route}
        className={classNames(
          'pos-center rounded-full p-4 md:p-6 bg-base-100 hover:border-primary border-2 transition-all',
          {
            'opacity-60 hover:!border-inherit cursor-not-allowed': disabled,
          },
        )}
      >
        <Image className="h-20 w-20 md:h-36 md:w-36" src={icon} alt="" />
      </Link>
      <p className="text-2xl max-w-[9rem] md:max-w-[12rem] text-black text-center font-semibold">
        {name}
      </p>
    </div>
  )
}

export default function ListApp() {
  const listAppRef = useRef<HTMLDivElement | null>(null)
  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    const animationApp = gsap.to(listAppRef.current, {
      scrollTrigger: {
        trigger: listAppRef.current,
        scroller: '.welcome-container',
        onEnter: () => listAppRef.current?.classList.add('active'),
        onLeaveBack: () => listAppRef.current?.classList.remove('active'),
      },
    })
    return () => {
      animationApp.kill()
    }
  }, [])

  return (
    <div className="list-app">
      <div
        ref={listAppRef}
        className="pos-center h-[80vh] md:h-[100vh] w-full gap-10 "
      >
        <div className="top-apps flex flex-row justify-center gap-5 md:gap-16 ">
          {TOP_APPS.map((app) => (
            <App key={app.route} {...app} />
          ))}
        </div>
        <div className="pos-center gap-4">
          <h3 className="title-apps text-center text-black">
            Let&apos;s explore RER DAO
          </h3>
          <p className="desc-apps text-center opacity-60 text-black">
            The limit breaker for projects on Solana.
          </p>
        </div>
        <div className="bottom-apps flex flex-row justify-center gap-7 md:gap-16">
          {BOTTOM_APPS.map((app) => (
            <App key={app.route} {...app} />
          ))}
        </div>
      </div>
    </div>
  )
}
