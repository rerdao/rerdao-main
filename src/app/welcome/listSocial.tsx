'use client'
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import axios from 'axios'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

import { ArrowUpRightFromCircle } from 'lucide-react'
import Island from '@/components/island'
import ElementIObs from '@/components/IntersectionObserver'

import { numeric } from '@/helpers/utils'
import {
  twitterIcon,
  telegramIcon,
  youtubeIcon,
  discordIcon,
} from '@/static/images/welcome/socials'

type SocialProps = {
  icon: ReactNode
  name: string
  community: string
  url: string
}

function GitHubIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 65 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32.6 5.3335C17.8738 5.3335 5.93335 17.5835 5.93335 32.6787C5.93335 44.7621 13.5762 55.0002 24.1714 58.6192C24.3201 58.6515 24.4718 58.6675 24.6238 58.6668C25.6119 58.6668 25.9929 57.9406 25.9929 57.3097C25.9929 56.6549 25.9691 54.9406 25.9572 52.6549C25.0751 52.8617 24.1727 52.9695 23.2667 52.9764C18.1357 52.9764 16.9691 48.9883 16.9691 48.9883C15.7548 45.8335 14.0048 44.9883 14.0048 44.9883C11.6834 43.3573 13.9929 43.3097 14.1714 43.3097H14.1834C16.8619 43.5478 18.2667 46.143 18.2667 46.143C19.6 48.4764 21.3857 49.1311 22.981 49.1311C24.0358 49.11 25.0743 48.8666 26.0286 48.4168C26.2667 46.6549 26.9572 45.4525 27.7191 44.7621C21.8024 44.0716 15.5762 41.7264 15.5762 31.2502C15.5762 28.2621 16.6119 25.8216 18.3143 23.9168C18.0405 23.2264 17.1238 20.4406 18.5762 16.6787C18.771 16.6321 18.9713 16.6121 19.1714 16.6192C20.1357 16.6192 22.3143 16.9883 25.9095 19.4883C30.278 18.266 34.8982 18.266 39.2667 19.4883C42.8619 16.9883 45.0405 16.6192 46.0048 16.6192C46.205 16.6121 46.4052 16.6321 46.6 16.6787C48.0524 20.4406 47.1357 23.2264 46.8619 23.9168C48.5643 25.8335 49.6 28.274 49.6 31.2502C49.6 41.7502 43.3619 44.0597 37.4214 44.7383C38.3738 45.5835 39.231 47.2502 39.231 49.7978C39.231 53.4525 39.1953 56.4049 39.1953 57.2978C39.1953 57.9406 39.5643 58.6668 40.5524 58.6668C40.7124 58.6675 40.8719 58.6516 41.0286 58.6192C51.6357 55.0002 59.2667 44.7502 59.2667 32.6787C59.2667 17.5835 47.3262 5.3335 32.6 5.3335Z"
        fill="currentColor"
      />
    </svg>
  )
}

const SOCIALS: SocialProps[] = [
  {
    icon: <Image src={twitterIcon} className="h-8 w-8" alt="twitter" />,
    name: 'twitter',
    community: 'followers',
    url: 'https://twitter.com/rerdao',
  },

  {
    icon: <Image src={telegramIcon} className="h-8 w-8" alt="telegram" />,
    name: 'telegram',
    community: 'joiners',
    url: 'https://t.me/Rerdao',
  },
  {
    icon: <Image src={discordIcon} className="h-8 w-8" alt="discord" />,
    name: 'discord',
    community: 'joiners',
    url: 'https://discord.com/invite/VD7UBAp2HN',
  },
  {
    icon: <Image src={youtubeIcon} className="h-8 w-8" alt="youtube" />,
    name: 'youtube',
    community: 'subscribers',
    url: 'https://www.youtube.com/channel/UC7P7lwc-6sLEr0yLzWfFUyg',
  },
  {
    icon: <GitHubIcon />,
    name: 'github',
    community: 'repositories',
    url: 'https://github.com/DescartesNetwork',
  },
]

function Social({ icon, name, url, community }: SocialProps) {
  const cardSocialRef = useRef<HTMLDivElement | null>(null)

  const fetcher = useCallback(async ([name]: [string]) => {
    const {
      data: { numInteraction },
    } = await axios.get(`/api/socials/${name}`)
    if (numInteraction)
      localStorage.setItem(name, JSON.stringify(numInteraction))
    return numInteraction
  }, [])

  const { data: numInteractSocial } = useSWR(
    [name, 'numInteractSocial'],
    fetcher,
  )

  const metric = useMemo(() => {
    if (numInteractSocial) return numInteractSocial
    const cacheData = localStorage.getItem(name)
    return cacheData
  }, [numInteractSocial, name])

  return (
    <div
      onClick={() => window.open(url, '_blank')}
      ref={cardSocialRef}
      className="card-social flex flex-col gap-5 px-6 py-4 w-full h-full bg-base-100 hover:border-primary border-2 border-base-100 rounded-3xl cursor-pointer"
    >
      <div className="flex flex-row justify-between md:flex-col md:justify-start gap-5">
        <div className="flex flex-row justify-between items-center">
          <p className="capitalize">{name}</p>
          <ArrowUpRightFromCircle className="direction-icon" size={16} />
        </div>
        {icon}
      </div>
      <div className="flex flex-row justify-between items-center">
        <h5>{numeric(metric).format('+0a')}</h5>
        <p className="opacity-60 md:text-xs">{community}</p>
      </div>

      <ElementIObs threshold={0.08} force querySelector={cardSocialRef} />
    </div>
  )
}

export default function ListSocial() {
  const listSocialRef = useRef<HTMLDivElement | null>(null)
  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    const animationSocial = gsap.to(listSocialRef.current, {
      scrollTrigger: {
        trigger: listSocialRef.current,
        scroller: '.welcome-container',
        onEnter: () => listSocialRef.current?.classList.add('active'),
        onLeaveBack: () => listSocialRef.current?.classList.remove('active'),
      },
    })
    return () => {
      animationSocial.kill()
    }
  }, [])

  return (
    <div
      ref={listSocialRef}
      className="socials pos-center h-full w-full gap-16 px-8 py-32"
    >
      <h3 className="title-socials text-center text-black">Get in touch</h3>
      <div className="list-social text-center text-secondary-content w-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {SOCIALS.map((social) => (
          <Island key={social.name}>
            <Social {...social} />
          </Island>
        ))}
      </div>
    </div>
  )
}
