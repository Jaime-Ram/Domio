import { redirect } from 'next/navigation'

// Deep-link fallback: open the building sheet over the MJOP overview.
export default async function MjopBuildingRedirect({
  params,
}: {
  params: Promise<{ buildingId: string }>
}) {
  const { buildingId } = await params
  redirect(`/dashboard/landlord/mjop?building=${buildingId}`)
}
