'use client'
import Welcome from './welcome'
import ScrollButton from '@/components/scrollButton'

export default function Home() {
  return (
    <div className="w-full h-full home-page rounded-3xl bg-cover bg-swap-light dark:bg-swap-dark">
      <Welcome />
      <div id="btn-scroll" className="pos-center">
        <ScrollButton />
      </div>
    </div>
  )
}
