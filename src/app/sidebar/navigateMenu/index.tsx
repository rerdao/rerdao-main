'use client'
import classNames from 'classnames'

import {
  // BookPlus,
  // Repeat,
  // Droplets,
  GraduationCap,
  // BarChartBig,
  // Leaf,
  Rocket,
  Home,
  LucideIcon,
} from 'lucide-react'
import MenuItem from './menuItem'

export type MenuItemData = {
  route: string
  name: string
  Logo?: LucideIcon
  disabled?: boolean
  children?: MenuItemData[]
}

type NavigateMenuProps = {
  open: boolean
}

const ROUTES: MenuItemData[] = [
  { route: '/', name: 'Home', Logo: Home },
  { route: '/academy', name: 'Learn', Logo: GraduationCap },
  // { route: '/swap', name: 'Swap', Logo: Repeat },
  // {
  //   route: '/pools',
  //   name: 'Pools',
  //   Logo: BarChartBig,
  // },
  // { route: '/farming', name: 'Farming', Logo: Leaf },
  // {
  //   route: '/token-distribution',
  //   name: 'Token Distribution',
  //   Logo: Droplets,
  //   children: [
  //     {
  //       route: '/token-distribution/bulk-sender',
  //       name: 'Bulk Sender',
  //     },
  //     {
  //       route: '/token-distribution/airdrop-vesting',
  //       name: 'Airdrop & Vesting',
  //     },
  //   ],
  // },
  { route: '/dao', name: 'Create DAO', Logo: Rocket },
  // { route: '/token-creation', name: 'Token Creation', Logo: BookPlus },
]

export default function NavigateMenu({ open }: NavigateMenuProps) {
  return (
    <ul className="flex flex-nowrap overflow-y-auto menu menu-vertical menu-md sidebar-menu">
      {ROUTES.map((route) => (
        <li
          key={route.name}
          className={classNames({ disabled: route.disabled })}
        >
          <MenuItem menuItemData={route} open={open} />
        </li>
      ))}
    </ul>
  )
}
