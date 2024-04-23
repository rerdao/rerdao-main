import { ReactNode } from 'react'

export default function NewFarmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-row justify-center items-center">
      <div className="max-w-[664px] w-full card p-6 bg-base-100">
        {children}
      </div>
    </div>
  )
}
