import { NextRequest, NextResponse } from 'next/server'

import { DATA_SOCIAL, getNumInteractSocials } from './service'

export async function GET(
  _req: NextRequest,
  { params: { socialName } }: { params: { socialName: string } },
) {
  const numInteraction = await getNumInteractSocials(socialName)

  return NextResponse.json({ numInteraction })
}

export async function generateStaticParams() {
  const params = DATA_SOCIAL.map(({ name }) => ({ socialName: name }))
  return params
}
