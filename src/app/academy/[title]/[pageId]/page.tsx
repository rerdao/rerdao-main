'use client'
import { useEffect } from 'react'
import { PageBlock } from 'notion-types'
import { useRouter } from 'next/navigation'

import { NotionRenderer } from 'react-notion-x'
import { Tweet } from 'react-tweet'
import { Equation } from './equation'
import { Code } from './code'
import Skeleton from './skeleton'
import PageHeader from './header'
import PageCollection from './collection'
import PageFooter from './footer'

import { usePushMessage } from '@/components/message/store'
import { useTheme } from '@/providers/ui.provider'
import { useAcademyPage } from '@/hooks/academy.hook'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'

export default function Page({
  params: { pageId },
}: {
  params: { pageId: string }
}) {
  const { push } = useRouter()
  const { theme } = useTheme()
  const pushMessage = usePushMessage()
  const {
    data: { map, recommends },
    error,
  } = useAcademyPage(pageId)

  useEffect(() => {
    if (error) {
      pushMessage('alert-error', error.message)
      push('/academy')
    }
  }, [error, pushMessage, push])

  if (!map || !recommends) return <Skeleton />
  return (
    <NotionRenderer
      recordMap={map}
      fullPage={true}
      darkMode={theme === 'dark'}
      className="col-span-full overflow-clip rounded-3xl border border-base-200"
      components={{
        Header: ({ block }: { block: PageBlock }) => (
          <PageHeader block={block} map={map} />
        ),
        Collection: ({ block }: { block: PageBlock }) => (
          <PageCollection block={block} map={map} />
        ),
        Tweet,
        Code,
        Equation,
      }}
      footer={<PageFooter pageIds={recommends} />}
    />
  )
}
