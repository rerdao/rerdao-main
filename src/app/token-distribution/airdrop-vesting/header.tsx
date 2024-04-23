'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import classNames from 'classnames'

import Link from 'next/link'
import {
  ChevronLeft,
  DownloadCloud,
  LayoutDashboard,
  ScrollText,
} from 'lucide-react'

enum MenuKey {
  Dashboard,
  Airdrop,
  Vesting,
}

const menus = [
  {
    route: '/token-distribution/airdrop-vesting',
    name: 'Main',
    key: MenuKey.Dashboard,
    Logo: LayoutDashboard,
  },
  {
    route: '/token-distribution/airdrop-vesting/airdrop',
    name: 'Airdrop',
    key: MenuKey.Airdrop,
    Logo: DownloadCloud,
  },
  {
    route: '/token-distribution/airdrop-vesting/vesting',
    name: 'Vesting',
    key: MenuKey.Vesting,
    Logo: ScrollText,
  },
]

export default function MerkleDistributionHeader() {
  const pathname = usePathname()
  const { push } = useRouter()

  const onBack = useCallback(() => {
    const hops = pathname.split('/')
    hops.pop()
    return push(hops.join('/'))
  }, [push, pathname])

  const activeKey = useMemo(() => {
    if (pathname === '/token-distribution/airdrop-vesting')
      return MenuKey.Dashboard
    const hops = pathname.split('/')
    if (hops.slice(2, hops.length).includes('airdrop')) return MenuKey.Airdrop
    return MenuKey.Vesting
  }, [pathname])

  return (
    <div className="card bg-base-100 py-4 px-2 flex flex-row items-center">
      <div className="flex-auto">
        <button className="btn btn-sm btn-circle btn-ghost" onClick={onBack}>
          <ChevronLeft />
        </button>
      </div>
      <div className="tabs">
        {menus.map(({ Logo, name, route, key }, i) => (
          <Link
            key={i}
            href={route}
            className={classNames('tab', {
              'tab-active': activeKey === key,
            })}
          >
            <Logo className="w-4 h-4" />
            <p className="ml-2">{name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
