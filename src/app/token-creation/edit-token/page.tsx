import { redirect } from 'next/navigation'

export default async function EditToken() {
  return redirect('/token-creation/edit-token/search')
}
