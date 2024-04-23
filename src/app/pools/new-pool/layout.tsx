import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-[100dvh] flex justify-center items-center p-6">
      {children}
    </div>
  )
}
