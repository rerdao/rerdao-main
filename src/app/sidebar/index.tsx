'use client'
import { Fragment, ReactNode, useState } from 'react'
import Link from 'next/link'
import { useEffectOnce, useKey } from 'react-use'
import classNames from 'classnames'

import {
  BookOpen,
  ChevronLeftSquare,
  ChevronRightSquare,
  Menu,
  Send,
  Twitter,
} from 'lucide-react'
import Brand from '@/components/brand'
import Island from '@/components/island'
import WalletButton from './walletButton'
import ThemeSwitch from './themeSwitch'
import NavigateMenu from './navigateMenu'

import './index.scss'

export type SidebarProps = { children: ReactNode }

export const MenuLoading = () => {
  return <span className="loading loading-ring loading-xs mx-auto" />
}

export default function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false)

  useKey(
    (e) => e.metaKey && e.key === 'k',
    () => setOpen(!open),
  )

  useEffectOnce(() => {
    setOpen(window.innerWidth > 1024)
  })

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className={classNames('overlay max-md:mobile', { open })}
        onClick={() => setOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={classNames('flex flex-col sidebar vertical max-md:mobile', {
          open,
        })}
      >
        <Link className="p-4" href="/">
          <Brand size={32} style={{ marginLeft: 2 }} named={open} />
        </Link>
        <NavigateMenu open={open} />
        <div className="flex-auto" />
        <ul className="menu menu-vertical menu-md">
          <li>
            <Island Loading={MenuLoading}>
              <WalletButton />
            </Island>
          </li>
          <div className="divider mx-4 my-0" />
          <li>
            <Link
              className="menu-item gap-2"
              href="https://twitter.com/SentreProtocol"
              target="_blank"
              rel="noreferrer"
            >
              <Twitter className="menu-logo" />
              <p className="menu-option">Twitter</p>
            </Link>
          </li>
          <li>
            <Link
              className="menu-item gap-2"
              href="https://t.me/Sentre"
              target="_blank"
              rel="noreferrer"
            >
              <Send className="menu-logo" />
              <p className="menu-option">Telegram</p>
            </Link>
          </li>
          <li>
            <Link
              className="menu-item gap-2"
              href="https://docs.senswap.sentre.io/"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen className="menu-logo" />
              <p className="menu-option">Documents</p>
            </Link>
          </li>
          <li>
            <Island Loading={MenuLoading}>
              <ThemeSwitch />
            </Island>
          </li>
          <li onClick={() => setOpen(!open)}>
            <span className="menu-item gap-1">
              <label className="menu-logo swap swap-rotate">
                <input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  checked={open}
                  readOnly
                />
                <p className="swap-on">
                  <ChevronLeftSquare className="menu-logo" />
                </p>
                <p className="swap-off">
                  <ChevronRightSquare className="menu-logo" />
                </p>
              </label>
              <div className="menu-option pl-2 gap-1">
                <span className="join text-neutral dark:text-neutral-100">
                  <kbd className="join-item kbd !kbd-xs">ctrl</kbd>
                  <kbd className="join-item kbd !kbd-xs">⌘</kbd>
                </span>
                <kbd className="kbd !kbd-xs text-neutral dark:text-neutral-100">
                  K
                </kbd>
              </div>
            </span>
          </li>
        </ul>
      </aside>
      {/* Mobile header & Page content */}
      <main className="flex-auto flex flex-col min-h-[100dvh]">
        <header className="sidebar horizontal pl-3 py-2 md:hidden">
          <ul className="w-full menu menu-horizontal menu-md flex flex-row items-center">
            <li>
              <Link href="/">
                <Brand size={24} />
              </Link>
            </li>
            <div className="flex-auto" />
            <li>
              <Island Loading={MenuLoading}>
                <WalletButton />
              </Island>
            </li>
            <li>
              <div className="menu-item" onClick={() => setOpen(true)}>
                <Menu className="menu-logo" />
              </div>
            </li>
          </ul>
        </header>
        <section className="flex-auto max-md:px-2 max-md:pb-2 md:pr-2 md:py-2">
          {children}
        </section>
      </main>
    </Fragment>
  )
}
