'use client'
import { ReactNode, useState } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'

type ExpandCardProps = {
  header: ReactNode
  children: ReactNode
  isExpand?: boolean
}

const ExpandCard = ({
  header,
  children,
  isExpand = false,
}: ExpandCardProps) => {
  const [expand, setExpand] = useState(isExpand)

  const Arrow = !expand ? ChevronDown : ChevronUp

  return (
    <div className="collapse bg-base-100 border-b border-bg-base-200 rounded-none !pb-4">
      <input
        onChange={(e) => setExpand(e.target.checked)}
        type="checkbox"
        className="peer"
        checked={expand}
      />
      <div className="collapse-title min-h-0 !px-2 !pt-0">{header}</div>

      <div className="collapse-content !px-2 ">{children}</div>
      <Arrow
        onClick={() => setExpand(!expand)}
        size={20}
        className="cursor-pointer absolute bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}

export default ExpandCard
