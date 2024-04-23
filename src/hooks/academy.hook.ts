import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'
import { ExtendedRecordMap } from 'notion-types'
import axios from 'axios'

export const LIMIT = 9
export const TAGS = [
  {
    title: '🔥 Recent',
    tag: '',
  },
  {
    title: 'Ecosystem',
    tag: 'Ecosystem',
  },
  {
    title: '💎 DeFi Series',
    tag: 'DeFi Series',
  },
  {
    title: '🧑‍💻 Coding Camp II',
    tag: 'Camp 2',
  },
  {
    title: 'Coding Camp I',
    tag: 'Camp 1',
  },
  {
    title: 'Others',
    tag: 'Others',
  },
]

export const useAcademyPaging = (pageIds: string[], metadata: PageMap) => {
  const params = useSearchParams()
  const tag = params.get('tag') || ''
  const page = Number(params.get('page')) || 1
  const availableIds = useMemo(
    () =>
      pageIds.filter((pageId) => {
        const { publishedAt } = metadata[pageId] || { publishedAt: Date.now() }
        return publishedAt < Date.now()
      }),
    [pageIds, metadata],
  )

  const pinnedIds = useMemo(() => {
    return availableIds.filter((pageId) => {
      const { pinned } = metadata[pageId] || { pinned: false }
      return pinned
    })
  }, [availableIds, metadata])

  const taggedIds = useMemo(
    () =>
      availableIds.filter((pageId) => {
        const { tags } = metadata[pageId] || { tags: [] }
        if (!tag) return true
        if (tag === 'Others')
          return !TAGS.map(({ tag }) => tags.includes(tag)).reduce(
            (a, b) => a || b,
            false,
          )
        return tags.includes(tag)
      }),
    [availableIds, tag, metadata],
  )
  const total = useMemo(() => taggedIds.length, [taggedIds])
  const thumbnailIds = useMemo(() => {
    return taggedIds.slice((page - 1) * LIMIT, Math.min(page * LIMIT, total))
  }, [taggedIds, page, total])

  return {
    tag,
    page,
    total,
    limit: LIMIT,
    pinnedIds,
    thumbnailIds,
  }
}

export const useAcademyPage = (
  pageId: string,
): {
  data: Partial<{
    map: ExtendedRecordMap
    recommends: string[]
    metadata: PageMetadata
  }>
  error: Error | undefined
} => {
  const { data, error } = useSWR<
    { map: ExtendedRecordMap; recommends: string[] },
    Error
  >([pageId, 'blog'], async ([pageId]: [string]) => {
    const { data } = await axios.get(`/api/blogs/${pageId}`)
    return data
  })

  return { data: data || {}, error }
}
