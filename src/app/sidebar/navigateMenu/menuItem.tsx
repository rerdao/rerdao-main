'use client'
import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

import ListSubMenuItem from './listSubMenuItem'

import { MenuItemData } from './index'

type MenuItemProps = {
  menuItemData: MenuItemData
  open: boolean
}

export default function MenuItem({ menuItemData, open }: MenuItemProps) {
  const { route, name, Logo, disabled, children } = menuItemData
  const pathname = usePathname()

  const isFocus = route === '/' ? route === pathname : pathname.includes(route)

  if (children && !!children.length) {
    return <ListSubMenuItem menuItemData={menuItemData} open={open} />
  }

  return (
    <Link
      href={disabled ? '#' : route}
      className={classNames('px-4 py-3', {
        focus: isFocus,
      })}
    >
      {Logo && <Logo className="menu-logo" />}
      <p className="menu-option menu-text">{name}</p>
    </Link>
  )
}
