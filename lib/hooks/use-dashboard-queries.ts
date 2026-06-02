'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  contactQueries,
  propertyQueries,
  mjopQueries,
  ticketQueries,
  leaseQueries,
} from '@/lib/supabase/queries'

// ── Query key factory ──────────────────────────────────────────────────────
export const QK = {
  contacts:       (ownerId: string) => ['contacts', ownerId]       as const,
  properties:     (ownerId: string) => ['properties', ownerId]     as const,
  tickets:        (ownerId: string) => ['tickets', ownerId]        as const,
  leases:         (ownerId: string) => ['leases', ownerId]         as const,
  mjopBuildings:  (ownerId: string) => ['mjop-buildings', ownerId] as const,
  mjopElements:   (bId: string)     => ['mjop-elements', bId]      as const,
  mjopInspections:(bId: string)     => ['mjop-inspections', bId]   as const,
  mjopElementTypes: ()              => ['mjop-element-types']      as const,
}

const STALE = 60_000 // 1 minute

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useContacts(ownerId: string | undefined) {
  return useQuery({
    queryKey: QK.contacts(ownerId ?? ''),
    queryFn:  () => contactQueries.getByOwner(ownerId!),
    enabled:  !!ownerId,
    staleTime: STALE,
  })
}

export function useProperties(ownerId: string | undefined) {
  return useQuery({
    queryKey: QK.properties(ownerId ?? ''),
    queryFn:  () => propertyQueries.getByOwner(ownerId!),
    enabled:  !!ownerId,
    staleTime: STALE,
  })
}

export function useTickets(ownerId: string | undefined) {
  return useQuery({
    queryKey: QK.tickets(ownerId ?? ''),
    queryFn:  () => ticketQueries.getByOwner(ownerId!),
    enabled:  !!ownerId,
    staleTime: 30_000,
  })
}

export function useLeases(ownerId: string | undefined) {
  return useQuery({
    queryKey: QK.leases(ownerId ?? ''),
    queryFn:  () => leaseQueries.getByOwner(ownerId!),
    enabled:  !!ownerId,
    staleTime: STALE,
  })
}

export function useMjopBuildings(ownerId: string | undefined) {
  return useQuery({
    queryKey: QK.mjopBuildings(ownerId ?? ''),
    queryFn:  () => mjopQueries.getBuildings(ownerId!),
    enabled:  !!ownerId,
    staleTime: STALE,
  })
}

export function useMjopElements(buildingId: string | undefined) {
  return useQuery({
    queryKey: QK.mjopElements(buildingId ?? ''),
    queryFn:  () => mjopQueries.getElements(buildingId!),
    enabled:  !!buildingId,
    staleTime: STALE,
  })
}

export function useMjopInspections(buildingId: string | undefined) {
  return useQuery({
    queryKey: QK.mjopInspections(buildingId ?? ''),
    queryFn:  () => mjopQueries.getInspections(buildingId!),
    enabled:  !!buildingId,
    staleTime: STALE,
  })
}

export function useMjopElementTypes() {
  return useQuery({
    queryKey: QK.mjopElementTypes(),
    queryFn:  () => mjopQueries.getElementTypes(),
    staleTime: 10 * 60_000, // catalogus verandert zelden
  })
}

export { useQueryClient }
