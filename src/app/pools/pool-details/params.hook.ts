import { useSearchParams } from 'next/navigation'

export function usePoolAddress() {
  const searchParams = useSearchParams()
  const poolAddress = searchParams.get('poolAddress') || ''
  return poolAddress
}
