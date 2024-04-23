import { ReactNode } from 'react'
import type { Metadata } from 'next'

import { getDatabase } from '@/app/api/blogs/[pageId]/service'
import deplConfig from '@/configs/depl.config'
import { normalizePageTitle } from '@/app/api/blogs/[pageId]/utils'

export async function generateMetadata({
  params: { pageId },
}: {
  params: { pageId: string }
}): Promise<Metadata> {
  const { metadata } = await getDatabase()
  const {
    title = '',
    description = '',
    thumbnail = '',
  } = metadata[pageId] || {}
  return {
    title: `RER Academy | ${title}`,
    description,
    metadataBase: new URL(deplConfig.host),
    openGraph: {
      title,
      description,
      images: [thumbnail],
    },
  }
}

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-full">{children}</div>
    </div>
  )
}

export async function generateStaticParams() {
  const { pageIds, metadata } = await getDatabase()
  const params = pageIds.map((pageId) => ({
    pageId,
    title: normalizePageTitle(metadata[pageId].title),
  }))
  return params
}
