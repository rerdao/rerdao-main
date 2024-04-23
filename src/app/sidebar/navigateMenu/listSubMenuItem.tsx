'use client'
import Link from 'next/link'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react'

import { MenuItemData } from './index'

type SubMenuItemProps = {
  menuItemData: MenuItemData
}

type ListSubMenuItemProps = {
  menuItemData: MenuItemData
  open: boolean
}

const DropdownSubMenuItem = ({ menuItemData }: SubMenuItemProps) => {
  const {
    refs: { setReference, setFloating },
    floatingStyles,
  } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'right-start',
    strategy: 'fixed',
    middleware: [offset(7), flip(), shift()],
  })
  const pathname = usePathname()
  const { route, name, Logo, disabled, children } = menuItemData

  return (
    <div className="static dropdown p-0 flex rounded-lg">
      <label
        tabIndex={0}
        ref={setReference}
        className={classNames('menu-item gap-2', {
          focus: pathname.includes(route),
        })}
      >
        {Logo && <Logo className="menu-logo" />}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-md p-2 shadow-xl bg-base-100 rounded-box z-10 m-0"
        style={floatingStyles}
        ref={setFloating}
      >
        <li>
          <p className="menu-title">{name}</p>
        </li>
        {children &&
          children.map(({ route, name: subName }) => (
            <li key={route}>
              <Link
                href={disabled ? '#' : route}
                className={classNames('pl-8 opacity-60 hover:opacity-100', {
                  '!opacity-100': pathname.includes(route),
                })}
              >
                {subName}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}

const SubMenuItem = ({ menuItemData }: SubMenuItemProps) => {
  const pathname = usePathname()
  const { name, Logo, children } = menuItemData
  return (
    <details>
      <summary className="px-4 py-3">
        {Logo && <Logo className="menu-logo" />}
        <p className="menu-option menu-text">{name}</p>
      </summary>
      <ul className="ml-0 pl-0 before:w-0">
        {children &&
          children.map(({ route, disabled, name: subName }) => (
            <li key={route} className={classNames({ disabled })}>
              <Link
                href={disabled ? '#' : route}
                className={classNames('py-3 pl-11', {
                  focus: pathname.includes(route),
                })}
              >
                <p className="menu-option menu-text">{subName}</p>
              </Link>
            </li>
          ))}
      </ul>
    </details>
  )
}

export default function ListSubMenuItem({
  menuItemData,
  open,
}: ListSubMenuItemProps) {
  if (open) return <SubMenuItem menuItemData={menuItemData} />
  return <DropdownSubMenuItem menuItemData={menuItemData} />
}
