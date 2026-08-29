'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Building2,
  Trash2,
  ChevronRight,
  CalendarRange,
  ClipboardCheck,
  MapPin,
  CheckCheck,
  Info,
} from 'lucide-react'
import { TabNav } from '@/components/ui/tab-nav'
import { DetailShell } from '@/components/ui/detail-shell'
import { CreateDialogShell } from '@/components/ui/add-dialog-layout'
import { DialogField } from '@/components/ui/dialog-field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { mjopQueries } from '@/lib/supabase/queries'
import {
  useMjopBuildings,
  useMjopElements,
  useMjopInspections,
  useMjopElementTypes,
  useQueryClient,
  QK,
} from '@/lib/hooks/use-dashboard-queries'

type Tab = 'elementen' | 'inspecties' | 'plan'

// NEN 2767 conditiescore lookup (client-side mirror of the DB trigger)
const NEN2767: Record<string, number> = {
  '1-1-1': 1, '1-1-2': 1, '1-1-3': 2,
  '1-2-1': 1, '1-2-2': 2, '1-2-3': 2,
  '1-3-1': 2, '1-3-2': 2, '1-3-3': 3,
  '1-4-1': 2, '1-4-2': 3, '1-4-3': 3,
  '1-5-1': 3, '1-5-2': 3, '1-5-3': 3,
  '2-1-1': 2, '2-1-2': 2, '2-1-3': 3,
  '2-2-1': 2, '2-2-2': 3, '2-2-3': 3,
  '2-3-1': 3, '2-3-2': 3, '2-3-3': 4,
  '2-4-1': 3, '2-4-2': 4, '2-4-3': 4,
  '2-5-1': 4, '2-5-2': 4, '2-5-3': 5,
  '3-1-1': 3, '3-1-2': 3, '3-1-3': 4,
  '3-2-1': 3, '3-2-2': 4, '3-2-3': 4,
  '3-3-1': 4, '3-3-2': 4, '3-3-3': 5,
  '3-4-1': 4, '3-4-2': 5, '3-4-3': 5,
  '3-5-1': 5, '3-5-2': 5, '3-5-3': 6,
}

const lookupScore = (e: number, o: number, i: number): number | null =>
  NEN2767[`${e}-${o}-${i}`] ?? null

const CONDITION_COLORS: Record<number, { bg: string; text: string; dot: string; label: string }> = {
  1: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Uitstekend' },
  2: { bg: 'bg-green-100 dark:bg-green-900/30',    text: 'text-green-700 dark:text-green-400',    dot: 'bg-green-500',   label: 'Goed' },
  3: { bg: 'bg-yellow-100 dark:bg-yellow-900/30',  text: 'text-yellow-700 dark:text-yellow-400',  dot: 'bg-yellow-500',  label: 'Redelijk' },
  4: { bg: 'bg-orange-100 dark:bg-orange-900/30',  text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-500',  label: 'Matig' },
  5: { bg: 'bg-red-100 dark:bg-red-900/30',        text: 'text-red-700 dark:text-red-400',        dot: 'bg-red-500',     label: 'Slecht' },
  6: { bg: 'bg-red-200 dark:bg-red-900/50',        text: 'text-red-800 dark:text-red-300',        dot: 'bg-red-700',     label: 'Zeer slecht' },
}

function ConditionDot({ score }: { score: number | null }) {
  if (!score) return <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-neutral-700 inline-block shrink-0" />
  return (
    <span className={cn('h-2.5 w-2.5 rounded-full inline-block shrink-0', CONDITION_COLORS[score]?.dot)} title={CONDITION_COLORS[score]?.label} />
  )
}

function ConditionBadge({ score }: { score: number | null }) {
  if (!score) return <span className="text-xs text-gray-400">—</span>
  const c = CONDITION_COLORS[score]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', c.bg, c.text)}>
      {score} · {c.label}
    </span>
  )
}

const EENHEDEN = ['m2', 'ml', 'st', 'm3', 'kg', 'lm']

const ERNST_OPTIONS = [
  { value: 1, label: 'Gering' },
  { value: 2, label: 'Serieus' },
  { value: 3, label: 'Ernstig' },
]
const OMVANG_OPTIONS = [
  { value: 1, label: '<2%' },
  { value: 2, label: '2–10%' },
  { value: 3, label: '10–30%' },
  { value: 4, label: '30–70%' },
  { value: 5, label: '>70%' },
]
const INTENSITEIT_OPTIONS = [
  { value: 1, label: 'Begin' },
  { value: 2, label: 'Gevorderd' },
  { value: 3, label: 'Vergevorderd' },
]

export function MjopBuildingSheet({
  open,
  buildingId: buildingIdProp,
  onClose,
}: {
  open: boolean
  buildingId: string | null
  onClose: () => void
}) {
  const buildingId = buildingIdProp ?? ''
  const { user } = useDashboardUser()

  const queryClient = useQueryClient()
  const { data: allBuildings = [], isLoading: buildingsLoading } = useMjopBuildings(user?.id)
  const building = useMemo(() => allBuildings.find((b: any) => b.id === buildingId) ?? null, [allBuildings, buildingId])
  const { data: elements = [], isLoading: elementsLoading } = useMjopElements(buildingId)
  const { data: elementTypes = [] } = useMjopElementTypes()
  const { data: inspections = [], isLoading: inspectionsLoading } = useMjopInspections(buildingId)
  const loading = buildingsLoading || elementsLoading || inspectionsLoading
  const [tab, setTab] = useState<Tab>('elementen')

  // Element dialog state
  const [elemDialogOpen, setElemDialogOpen] = useState(false)
  const [elemStep, setElemStep] = useState(1)
  const [selectedType, setSelectedType] = useState<any>(null)
  const [elemForm, setElemForm] = useState({ naam: '', locatie: '', hoeveelheid: '', eenheid: 'm2', bouwjaar: '', conditiescore_huidig: '' })
  const [elemSaving, setElemSaving] = useState(false)

  // Element detail sheet
  const [detailElement, setDetailElement] = useState<any>(null)

  // Inspectie dialog state
  const [inspDialogOpen, setInspDialogOpen] = useState(false)
  const [inspForm, setInspForm] = useState({ inspecteur: '', datum: new Date().toISOString().split('T')[0], notes: '' })
  const [inspSaving, setInspSaving] = useState(false)

  // Inspectie detail sheet
  const [detailInspection, setDetailInspection] = useState<any>(null)
  const [inspDefects, setInspDefects] = useState<any[]>([])
  const [inspDefectsLoading, setInspDefectsLoading] = useState(false)

  // Gebrek dialog state
  const [defectDialogOpen, setDefectDialogOpen] = useState(false)
  const [defectTargetElement, setDefectTargetElement] = useState<any>(null)
  const [defectForm, setDefectForm] = useState({ ernst: 0, omvang: 0, intensiteit: 0, omschrijving: '' })
  const [defectSaving, setDefectSaving] = useState(false)

  // Grouped element types for step 1 of the element dialog
  const groupedTypes = elementTypes.reduce((acc: Record<string, any[]>, t: any) => {
    if (!acc[t.nlsfb_group]) acc[t.nlsfb_group] = []
    acc[t.nlsfb_group].push(t)
    return acc
  }, {})

  const openElemDialog = () => {
    setSelectedType(null)
    setElemStep(1)
    setElemForm({ naam: '', locatie: '', hoeveelheid: '', eenheid: 'm2', bouwjaar: '', conditiescore_huidig: '' })
    setElemDialogOpen(true)
  }

  const handleSelectType = (type: any) => {
    setSelectedType(type)
    setElemForm(f => ({ ...f, naam: type.name, eenheid: type.standard_unit ?? 'm2' }))
    setElemStep(2)
  }

  const handleSaveElement = async () => {
    if (!user || !selectedType) return
    setElemSaving(true)
    try {
      const created = await mjopQueries.createElement({
        building_id: buildingId,
        element_type_id: selectedType.id,
        owner_id: user.id,
        naam: elemForm.naam.trim() || selectedType.name,
        locatie: elemForm.locatie.trim() || null,
        hoeveelheid: elemForm.hoeveelheid ? parseFloat(elemForm.hoeveelheid) : null,
        eenheid: elemForm.eenheid,
        bouwjaar: elemForm.bouwjaar ? parseInt(elemForm.bouwjaar) : null,
        conditiescore_huidig: elemForm.conditiescore_huidig ? parseInt(elemForm.conditiescore_huidig) : null,
      })
      queryClient.setQueryData(QK.mjopElements(buildingId), (old: any[] = []) => [...old, created])
      setElemDialogOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setElemSaving(false)
    }
  }

  const handleDeleteElement = async (id: string) => {
    try {
      await mjopQueries.deleteElement(id)
      queryClient.setQueryData(QK.mjopElements(buildingId), (old: any[] = []) => old.filter(e => e.id !== id))
      if (detailElement?.id === id) setDetailElement(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveInspection = async () => {
    if (!user) return
    setInspSaving(true)
    try {
      const created = await mjopQueries.createInspection({
        building_id: buildingId,
        owner_id: user.id,
        inspecteur: inspForm.inspecteur.trim() || null,
        datum: inspForm.datum,
        notes: inspForm.notes.trim() || null,
      })
      queryClient.setQueryData(QK.mjopInspections(buildingId), (old: any[] = []) => [created, ...old])
      setInspDialogOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setInspSaving(false)
    }
  }

  const openInspectionDetail = async (ins: any) => {
    setDetailInspection(ins)
    setInspDefects([])
    setInspDefectsLoading(true)
    try {
      const defects = await mjopQueries.getDefectsByInspection(ins.id)
      setInspDefects(defects)
    } catch (err) {
      console.error(err)
    } finally {
      setInspDefectsLoading(false)
    }
  }

  const handleMarkInspectionComplete = async () => {
    if (!detailInspection) return
    try {
      const updated = await mjopQueries.updateInspection(detailInspection.id, { status: 'afgerond' })
      setDetailInspection(updated)
      queryClient.setQueryData(QK.mjopInspections(buildingId), (old: any[] = []) =>
        old.map(i => i.id === updated.id ? updated : i)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const openDefectDialog = (element: any) => {
    setDefectTargetElement(element)
    setDefectForm({ ernst: 0, omvang: 0, intensiteit: 0, omschrijving: '' })
    setDefectDialogOpen(true)
  }

  const handleSaveDefect = async () => {
    if (!user || !detailInspection || !defectTargetElement) return
    if (!defectForm.ernst || !defectForm.omvang || !defectForm.intensiteit) return
    setDefectSaving(true)
    try {
      const created = await mjopQueries.createDefect({
        inspection_id: detailInspection.id,
        element_id: defectTargetElement.id,
        owner_id: user.id,
        ernst: defectForm.ernst,
        omvang: defectForm.omvang,
        intensiteit: defectForm.intensiteit,
        omschrijving: defectForm.omschrijving.trim() || null,
      })
      setInspDefects(prev => [...prev, created])
      // Update element's current condition if this defect is worse
      const newScore: number = created.conditiescore ?? lookupScore(defectForm.ernst, defectForm.omvang, defectForm.intensiteit) ?? 0
      if (newScore && (!defectTargetElement.conditiescore_huidig || newScore > defectTargetElement.conditiescore_huidig)) {
        await mjopQueries.updateElement(defectTargetElement.id, { conditiescore_huidig: newScore })
        queryClient.setQueryData(QK.mjopElements(buildingId), (old: any[] = []) =>
          old.map(e => e.id === defectTargetElement.id ? { ...e, conditiescore_huidig: newScore } : e)
        )
        setDefectTargetElement((prev: any) => ({ ...prev, conditiescore_huidig: newScore }))
      }
      setDefectDialogOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setDefectSaving(false)
    }
  }

  const handleDeleteDefect = async (defectId: string) => {
    try {
      await mjopQueries.deleteDefect(defectId)
      setInspDefects(prev => prev.filter(d => d.id !== defectId))
    } catch (err) {
      console.error(err)
    }
  }

  // Defects grouped by element for the inspection sheet
  const defectsByElement = inspDefects.reduce((acc: Record<string, any[]>, d: any) => {
    if (!acc[d.element_id]) acc[d.element_id] = []
    acc[d.element_id].push(d)
    return acc
  }, {})

  // Preview conditiescore in the defect dialog
  const previewCondition = defectForm.ernst && defectForm.omvang && defectForm.intensiteit
    ? lookupScore(defectForm.ernst, defectForm.omvang, defectForm.intensiteit)
    : null

  if (loading) {
    return (
      <DetailShell open={open} onClose={onClose} title="MJOP" footer={null}>
        <div className="flex flex-col gap-4 p-6">
          <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          <div className="h-32 rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
        </div>
      </DetailShell>
    )
  }

  if (!building) {
    return (
      <DetailShell open={open} onClose={onClose} title="MJOP" footer={null}>
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-gray-500">Gebouw niet gevonden.</p>
          <button type="button" onClick={onClose} className="mt-4 text-sm text-[#1d3014] underline">Sluiten</button>
        </div>
      </DetailShell>
    )
  }

  return (
    <>
      <DetailShell
        open={open}
        onClose={onClose}
        title={building.name}
        subtitle={building.address ?? undefined}
        headerLeft={
          <div className="h-10 w-10 rounded-xl bg-[#1d3014]/8 dark:bg-[#c8e957]/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-[#1d3014] dark:text-[#c8e957]" />
          </div>
        }
        footer={null}
        className="max-w-3xl"
      >
        {/* Stats + tabs */}
        <div className="px-6 pt-5 pb-4">
          {/* Stats row */}
          <div className="flex items-center gap-6 mb-4 flex-wrap">
          {building.bouwjaar && <Stat label="Bouwjaar" value={building.bouwjaar} />}
          {building.gebruiksoppervlak && <Stat label="Oppervlak" value={`${building.gebruiksoppervlak} m²`} />}
          {building.herbouwwaarde && <Stat label="Herbouwwaarde" value={`€${Number(building.herbouwwaarde).toLocaleString('nl-NL')}`} />}
          <Stat label="Elementen" value={elements.length} />
          <Stat label="Inspecties" value={inspections.length} />
        </div>

        <TabNav
          tabs={[
            { id: 'elementen', label: 'Elementen', count: elements.length },
            { id: 'inspecties', label: 'Inspecties', count: inspections.length },
            { id: 'plan', label: 'Plan' },
          ]}
          activeTab={tab}
          onChange={(t) => setTab(t as Tab)}
        />
      </div>

        {/* Tab content */}
        <div className="px-6 py-5">

        {/* ── ELEMENTEN ── */}
        {tab === 'elementen' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Bouwdelen conform NL-SfB classificatie
              </p>
              <button
                type="button"
                onClick={openElemDialog}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c8e957] text-[#1d3014] px-4 py-2 text-sm font-semibold hover:bg-[#c8e957]/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Element toevoegen
              </button>
            </div>

            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">Nog geen elementen</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 max-w-xs">
                  Voeg bouwdelen toe uit de NL-SfB catalogus om conditiescores bij te houden
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {elements.map((el: any) => (
                  <div
                    key={el.id}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 hover:border-[#1d3014]/25 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setDetailElement(el)}
                  >
                    <ConditionDot score={el.conditiescore_huidig} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold text-gray-400 dark:text-neutral-500 shrink-0">
                          {el.mjop_element_types?.nlsfb_code ?? '??'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{el.naam}</span>
                      </div>
                      {el.locatie && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate">{el.locatie}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {el.hoeveelheid && (
                        <span className="text-xs text-gray-500 dark:text-neutral-400">
                          {el.hoeveelheid} {el.eenheid}
                        </span>
                      )}
                      {el.conditiescore_huidig ? (
                        <span className={cn(
                          'text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shrink-0',
                          CONDITION_COLORS[el.conditiescore_huidig]?.bg,
                          CONDITION_COLORS[el.conditiescore_huidig]?.text,
                        )}>
                          {el.conditiescore_huidig}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDeleteElement(el.id) }}
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INSPECTIES ── */}
        {tab === 'inspecties' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Conditiemetingen conform NEN 2767
              </p>
              <button
                type="button"
                onClick={() => setInspDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c8e957] text-[#1d3014] px-4 py-2 text-sm font-semibold hover:bg-[#c8e957]/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Inspectie plannen
              </button>
            </div>

            {inspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                  <ClipboardCheck className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">Nog geen inspecties</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                  Plan een inspectie om de conditie van elementen te meten
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {inspections.map((ins: any) => (
                  <div
                    key={ins.id}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 hover:border-[#1d3014]/25 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => openInspectionDetail(ins)}
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      ins.status === 'afgerond' ? 'bg-green-500' : 'bg-yellow-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Inspectie {new Date(ins.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {ins.inspecteur && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{ins.inspecteur}</p>
                      )}
                    </div>
                    <span className={cn(
                      'text-[11px] font-medium rounded-full px-2 py-0.5 shrink-0',
                      ins.status === 'afgerond'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    )}>
                      {ins.status === 'afgerond' ? 'Afgerond' : 'Concept'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 dark:text-neutral-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLAN ── */}
        {tab === 'plan' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-xl bg-[#1d3014]/8 dark:bg-[#c8e957]/10 flex items-center justify-center mb-3">
              <CalendarRange className="h-6 w-6 text-[#1d3014] dark:text-[#c8e957]" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Meerjarenplan</p>
            <p className="text-xs text-gray-400 dark:text-neutral-500 max-w-xs mb-4">
              Maak een planversie aan om onderhoudstaken, cycli en kosten over de jaren in te plannen.
            </p>
            <p className="text-xs text-gray-300 dark:text-neutral-600">Beschikbaar in de volgende fase</p>
          </div>
        )}
        </div>
      </DetailShell>

      {/* ── ELEMENT TOEVOEGEN — 2-staps dialoog ── */}
      <CreateDialogShell
        open={elemDialogOpen}
        onOpenChange={open => { if (!open) setElemDialogOpen(false) }}
        title={elemStep === 1 ? 'Element toevoegen' : selectedType?.name ?? 'Element toevoegen'}
        subtitle={elemStep === 2
          ? `NL-SfB ${selectedType?.nlsfb_code} · ${selectedType?.nlsfb_group}`
          : 'Kies een bouwdeeltype uit de NL-SfB catalogus'}
        primaryLabel={elemStep === 1 ? 'Volgende' : 'Toevoegen'}
        onPrimary={elemStep === 1 ? () => { if (selectedType) setElemStep(2) } : handleSaveElement}
        primaryDisabled={elemStep === 1 ? !selectedType : elemSaving}
        primaryLoading={elemSaving}
        step={elemStep}
        totalSteps={2}
        onBack={() => setElemStep(1)}
      >
        {elemStep === 1 ? (
          <div className="max-h-[50vh] overflow-y-auto space-y-4 -mx-1 px-1">
            {Object.entries(groupedTypes).map(([group, types]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">{group}</p>
                <div className="space-y-1">
                  {(types as any[]).map((t: any) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectType(t)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        selectedType?.id === t.id
                          ? 'bg-[#1d3014] text-white'
                          : 'hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700'
                      )}
                    >
                      <span className={cn('text-[11px] font-mono font-bold shrink-0 w-7', selectedType?.id === t.id ? 'text-[#c8e957]' : 'text-gray-400 dark:text-neutral-500')}>
                        {t.nlsfb_code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', selectedType?.id === t.id ? 'text-white' : 'text-gray-900 dark:text-white')}>
                          {t.name}
                        </p>
                        {t.levensduur && (
                          <p className={cn('text-xs mt-0.5', selectedType?.id === t.id ? 'text-white/60' : 'text-gray-400 dark:text-neutral-500')}>
                            ~{t.levensduur} jaar · {t.standard_unit}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Naam / omschrijving" className="col-span-2">
              <Input className="rounded-xl" value={elemForm.naam}
                onChange={e => setElemForm(f => ({ ...f, naam: e.target.value }))} />
            </DialogField>
            <DialogField label="Locatie" optional className="col-span-2">
              <Input className="rounded-xl" placeholder="bijv. dakrand noord, 3e verdieping"
                value={elemForm.locatie} onChange={e => setElemForm(f => ({ ...f, locatie: e.target.value }))} />
            </DialogField>
            <DialogField label="Hoeveelheid" optional>
              <Input type="number" className="rounded-xl" placeholder="bijv. 120"
                value={elemForm.hoeveelheid} onChange={e => setElemForm(f => ({ ...f, hoeveelheid: e.target.value }))} />
            </DialogField>
            <DialogField label="Eenheid">
              <Select value={elemForm.eenheid} onValueChange={v => setElemForm(f => ({ ...f, eenheid: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{EENHEDEN.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </DialogField>
            <DialogField label="Bouwjaar element" optional>
              <Input type="number" className="rounded-xl" placeholder="bijv. 1998"
                value={elemForm.bouwjaar} onChange={e => setElemForm(f => ({ ...f, bouwjaar: e.target.value }))} />
            </DialogField>
            <DialogField label="Huidige conditie" optional>
              <Select value={elemForm.conditiescore_huidig} onValueChange={v => setElemForm(f => ({ ...f, conditiescore_huidig: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="1 – 6" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} — {CONDITION_COLORS[n].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DialogField>
          </div>
        )}
      </CreateDialogShell>

      {/* ── INSPECTIE AANMAKEN ── */}
      <CreateDialogShell
        open={inspDialogOpen}
        onOpenChange={open => { if (!open) setInspDialogOpen(false) }}
        title="Inspectie plannen"
        subtitle={building.name}
        primaryLabel="Aanmaken"
        onPrimary={handleSaveInspection}
        primaryDisabled={inspSaving}
        primaryLoading={inspSaving}
      >
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="Inspecteur" optional>
            <Input className="rounded-xl" placeholder="Naam inspecteur"
              value={inspForm.inspecteur} onChange={e => setInspForm(f => ({ ...f, inspecteur: e.target.value }))} />
          </DialogField>
          <DialogField label="Datum">
            <Input type="date" className="rounded-xl"
              value={inspForm.datum} onChange={e => setInspForm(f => ({ ...f, datum: e.target.value }))} />
          </DialogField>
        </div>
        <DialogField label="Notities" optional>
          <Textarea rows={3} className="rounded-xl resize-none"
            value={inspForm.notes} onChange={e => setInspForm(f => ({ ...f, notes: e.target.value }))} />
        </DialogField>
      </CreateDialogShell>

      {/* ── GEBREK TOEVOEGEN ── */}
      <CreateDialogShell
        open={defectDialogOpen}
        onOpenChange={open => { if (!open) setDefectDialogOpen(false) }}
        title="Gebrek registreren"
        subtitle={defectTargetElement?.naam}
        primaryLabel="Registreren"
        onPrimary={handleSaveDefect}
        primaryDisabled={!defectForm.ernst || !defectForm.omvang || !defectForm.intensiteit || defectSaving}
        primaryLoading={defectSaving}
      >
        {/* Ernst */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Ernst</p>
          <div className="flex gap-2">
            {ERNST_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDefectForm(f => ({ ...f, ernst: o.value }))}
                className={cn(
                  'flex-1 rounded-xl px-2 py-2.5 text-center transition-colors border',
                  defectForm.ernst === o.value
                    ? 'bg-[#1d3014] border-[#1d3014] text-white'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-gray-300'
                )}
              >
                <span className="block text-base font-bold leading-none">{o.value}</span>
                <span className="block text-[10px] mt-0.5 font-normal opacity-80">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Omvang */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Omvang</p>
          <div className="flex gap-1.5">
            {OMVANG_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDefectForm(f => ({ ...f, omvang: o.value }))}
                className={cn(
                  'flex-1 rounded-xl px-1 py-2.5 text-center transition-colors border',
                  defectForm.omvang === o.value
                    ? 'bg-[#1d3014] border-[#1d3014] text-white'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-gray-300'
                )}
              >
                <span className="block text-base font-bold leading-none">{o.value}</span>
                <span className="block text-[10px] mt-0.5 font-normal opacity-80">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensiteit */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">Intensiteit</p>
          <div className="flex gap-2">
            {INTENSITEIT_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDefectForm(f => ({ ...f, intensiteit: o.value }))}
                className={cn(
                  'flex-1 rounded-xl px-2 py-2.5 text-center transition-colors border',
                  defectForm.intensiteit === o.value
                    ? 'bg-[#1d3014] border-[#1d3014] text-white'
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:border-gray-300'
                )}
              >
                <span className="block text-base font-bold leading-none">{o.value}</span>
                <span className="block text-[10px] mt-0.5 font-normal opacity-80">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conditiescore preview */}
        {previewCondition ? (
          <div className={cn(
            'flex items-center justify-between rounded-xl px-3 py-2.5',
            CONDITION_COLORS[previewCondition].bg
          )}>
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className={cn('text-sm font-medium', CONDITION_COLORS[previewCondition].text)}>
                Conditiescore (NEN 2767)
              </span>
            </div>
            <span className={cn('text-xl font-bold', CONDITION_COLORS[previewCondition].text)}>
              {previewCondition}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800 px-3 py-2.5">
            <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 dark:text-neutral-500">
              Selecteer ernst, omvang en intensiteit voor de NEN 2767 conditiescore
            </span>
          </div>
        )}

        <DialogField label="Omschrijving" optional>
          <Textarea rows={2} className="rounded-xl resize-none" placeholder="Toelichting op het gebrek"
            value={defectForm.omschrijving} onChange={e => setDefectForm(f => ({ ...f, omschrijving: e.target.value }))} />
        </DialogField>
      </CreateDialogShell>

      {/* ── ELEMENT DETAIL SHEET ── */}
      <DetailShell
        open={!!detailElement}
        onClose={() => setDetailElement(null)}
        title={detailElement?.naam ?? ''}
        subtitle={detailElement ? `NL-SfB ${detailElement.mjop_element_types?.nlsfb_code} · ${detailElement.mjop_element_types?.nlsfb_group}` : undefined}
        footer={null}
      >
        {detailElement && (
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <DetailStat
                label="Conditiescore"
                value={detailElement.conditiescore_huidig
                  ? `${detailElement.conditiescore_huidig} · ${CONDITION_COLORS[detailElement.conditiescore_huidig]?.label}`
                  : '—'}
                accent={!!detailElement.conditiescore_huidig}
              />
              <DetailStat label="Hoeveelheid" value={detailElement.hoeveelheid ? `${detailElement.hoeveelheid} ${detailElement.eenheid}` : '—'} />
              <DetailStat label="Locatie" value={detailElement.locatie ?? '—'} />
              <DetailStat label="Bouwjaar element" value={detailElement.bouwjaar ?? '—'} />
              {detailElement.mjop_element_types?.levensduur && (
                <DetailStat label="Standaard levensduur" value={`~${detailElement.mjop_element_types.levensduur} jaar`} />
              )}
            </div>
            {detailElement.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Notities</p>
                <p className="text-sm text-gray-700 dark:text-neutral-300">{detailElement.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailShell>

      {/* ── INSPECTIE DETAIL SHEET ── */}
      <DetailShell
        open={!!detailInspection}
        onClose={() => setDetailInspection(null)}
        title={detailInspection
          ? `Inspectie ${new Date(detailInspection.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`
          : ''}
        subtitle={detailInspection?.inspecteur ?? building.name}
        headerLeft={
          <div className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
            detailInspection?.status === 'afgerond'
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-yellow-100 dark:bg-yellow-900/30'
          )}>
            <ClipboardCheck className={cn('h-4 w-4', detailInspection?.status === 'afgerond' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400')} />
          </div>
        }
        headerActions={
          detailInspection?.status !== 'afgerond' ? (
            <button
              type="button"
              onClick={handleMarkInspectionComplete}
              title="Markeer als afgerond"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Afronden
            </button>
          ) : undefined
        }
        footer={
          <div className="border-t border-gray-100 dark:border-neutral-800 p-4 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setDetailInspection(null)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1 py-1"
            >
              Sluiten
            </button>
          </div>
        }
      >
        {detailInspection && (
          <div className="px-6 py-5 space-y-4">
            {/* Status info */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[11px] font-medium rounded-full px-2.5 py-1',
                detailInspection.status === 'afgerond'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              )}>
                {detailInspection.status === 'afgerond' ? 'Afgerond' : 'Concept'}
              </span>
              {detailInspection.notes && (
                <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{detailInspection.notes}</p>
              )}
            </div>

            {/* Elements header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Gebreken per element
              </p>
              <span className="text-xs text-gray-400 dark:text-neutral-500">
                {inspDefects.length} geregistreerd
              </span>
            </div>

            {/* Elements list */}
            {inspDefectsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
                ))}
              </div>
            ) : elements.length === 0 ? (
              <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 px-4 py-5 text-center">
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  Voeg eerst elementen toe aan dit gebouw om gebreken te registreren.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {elements.map((el: any) => {
                  const elDefects = defectsByElement[el.id] ?? []
                  return (
                    <div key={el.id} className="rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
                      {/* Element header */}
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-neutral-800">
                        <ConditionDot score={el.conditiescore_huidig} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-semibold text-gray-400 shrink-0">
                              {el.mjop_element_types?.nlsfb_code}
                            </span>
                            <span className="text-xs font-medium text-gray-800 dark:text-white truncate">{el.naam}</span>
                          </div>
                          {el.locatie && <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5 truncate">{el.locatie}</p>}
                        </div>
                        {detailInspection.status !== 'afgerond' && (
                          <button
                            type="button"
                            onClick={() => openDefectDialog(el)}
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 px-2 py-1 text-[11px] font-medium hover:border-[#1d3014]/30 hover:text-[#1d3014] dark:hover:text-[#c8e957] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Gebrek
                          </button>
                        )}
                      </div>

                      {/* Defects for this element */}
                      {elDefects.length > 0 && (
                        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                          {elDefects.map((d: any) => (
                            <div key={d.id} className="group flex items-center gap-3 px-3 py-2 bg-white dark:bg-neutral-900">
                              <ConditionDot score={d.conditiescore} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <ParamBadge label="E" value={d.ernst} />
                                  <ParamBadge label="O" value={d.omvang} />
                                  <ParamBadge label="I" value={d.intensiteit} />
                                  {d.conditiescore && (
                                    <span className={cn(
                                      'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                                      CONDITION_COLORS[d.conditiescore]?.bg,
                                      CONDITION_COLORS[d.conditiescore]?.text,
                                    )}>
                                      CS {d.conditiescore}
                                    </span>
                                  )}
                                </div>
                                {d.omschrijving && (
                                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate">{d.omschrijving}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteDefect(d.id)}
                                className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </DetailShell>
    </>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wide leading-none">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  )
}

function DetailStat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 px-3 py-2.5">
      <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className={cn('text-sm font-semibold mt-0.5', accent ? 'text-[#1d3014] dark:text-[#c8e957]' : 'text-gray-900 dark:text-white')}>
        {value}
      </p>
    </div>
  )
}

function ParamBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-neutral-400">
      {label}<span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </span>
  )
}
