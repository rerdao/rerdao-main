'use client'
import Link from 'next/link'
import dayjs from 'dayjs'

import { useAcademyPage } from '@/hooks/academy.hook'
import { normalizePageTitle } from '@/app/api/blogs/[pageId]/utils'

function Recommend({ pageId }: { pageId: string }) {
  const {
    data: { metadata: { thumbnail, publishedAt, title, description } = {} },
  } = useAcademyPage(pageId)

  if (!title)
    return <div className="w-full h-64 bg-base-300 rounded-xl animate-pulse" />
  return (
    <Link
      className="card h-full image-full rounded-xl"
      href={`/academy/${normalizePageTitle(title)}/${pageId}`}
    >
      <figure>
        <img src={thumbnail} alt={pageId} className="blur-sm" />
      </figure>
      <div className="card-body">
        <p>{dayjs(publishedAt).format('MMM DD, YYYY')}</p>
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
      </div>
    </Link>
  )
}

export type PageFooterProps = {
  pageIds: string[]
}

export default function PageFooter({ pageIds }: PageFooterProps) {
  return (
    <div className="w-full flex flex-row justify-center p-4">
      <div className="w-full max-w-[720px] grid grid-cols-12 gap-4 @container">
        <div className="col-span-full divider">
          <h5 className="opacity-60">Only For You</h5>
        </div>
        {pageIds.map((pageId) => (
          <div
            key={pageId}
            className="col-span-full @xl:col-span-6 @4xl:col-span-4"
          >
            <Recommend pageId={pageId} />
          </div>
        ))}
      </div>
    </div>
  )
}
