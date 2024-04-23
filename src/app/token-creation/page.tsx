import { redirect } from 'next/navigation'

export default async function TokenCreation() {
  redirect('/token-creation/new-token')
}
