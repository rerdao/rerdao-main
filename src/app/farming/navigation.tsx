'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Plus } from 'lucide-react'

function Tab({
  title,
  to,
  active = false,
  disabled = false,
}: {
  title: string
  to: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Link
      className={classNames('btn btn-ghost btn-sm', {
        'btn-active': active,
        'btn-disabled': disabled,
      })}
      href={!disabled ? to : '#'}
    >
      {title}
    </Link>
  )
}

const TABS = [
  {
    title: 'All',
    route: '/farming',
    auth: false,
  },
  {
    title: 'My Farms',
    route: '/farming/my-farms',
    auth: true,
  },
  {
    title: 'Expired Farms',
    route: '/farming/expired-farms',
    auth: false,
  },
  {
    title: 'Upcoming Farms',
    route: '/farming/upcoming-farms',
    auth: false,
  },
]

export default function FarmingNavigation() {
  const pathname = usePathname()
  const { publicKey } = useWallet()

  return (
    <div className="flex items-center w-full md:flex-row flex-col gap-2">
      <div className="flex-auto flex gap-2">
        {TABS.map(({ title, route, auth }, i) => (
          <Tab
            key={i}
            title={title}
            to={route}
            active={pathname === route}
            disabled={auth && !publicKey}
          />
        ))}
      </div>
      <Link href="/farming/new-farm" className="btn btn-sm md:w-auto w-full">
        <Plus size={16} />
        New Farm
      </Link>
    </div>
  )
}
