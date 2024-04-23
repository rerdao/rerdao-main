'use client'
import { Fragment, RefObject, useEffect } from 'react'

type ElementIObsProps = {
  querySelector: RefObject<HTMLElement | null>
  threshold?: IntersectionObserverInit['threshold']
  force?: boolean
}

const ElementIObs = ({
  querySelector,
  threshold = 0.5,
  force = false,
}: ElementIObsProps) => {
  useEffect(() => {
    if (!querySelector.current) return
    const observer = new IntersectionObserver(
      ([e]) => {
        if (force) return e.isIntersecting && e.target.classList.add('active')
        return e.target.classList.toggle('active', e.isIntersecting)
      },
      {
        threshold,
      },
    )

    observer.observe(querySelector.current)
  }, [force, querySelector, threshold])

  return <Fragment />
}

export default ElementIObs
