import type { ActiveFlow } from '@/components/flows/flow-builder-sheet'

// A flow as stored/returned without the React icon component.
export type StoredActiveFlow = Omit<ActiveFlow, 'icon'>

/** Whether a flow applies to a given property — scoped to all panden or this one. */
export function flowAppliesToProperty(
  flow: { propertyScope?: { type?: string; propertyIds?: string[] } },
  propertyId: string,
): boolean {
  return (
    flow.propertyScope?.type === 'all' ||
    !!flow.propertyScope?.propertyIds?.includes(propertyId)
  )
}
