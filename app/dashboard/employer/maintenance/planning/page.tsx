'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardCardClass } from '@/app/dashboard/employer/dashboard-ui'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Calendar, ClipboardCheck, Ticket, Plus, Euro,
  Wrench, Paintbrush, Zap, Droplets, TreePine, ChevronRight,
} from 'lucide-react'
import { MetricCard } from '@/components/finance/MetricCard'
import { SectionNavDashboard } from '@/components/dashboard/section-nav-dashboard'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { cn } from '@/lib/utils'
import { mockProperties } from '@/lib/mock-data/vastgoed'

const getMaintenanceNav = (basePath: string) => [
  { label: 'Tickets', href: `${basePath}/maintenance`, icon: Ticket },
  { label: 'Inspecties', href: `${basePath}/maintenance/inspecties`, icon: ClipboardCheck },
  { label: 'Planning', href: `${basePath}/maintenance/planning`, icon: Calendar },
]

type TaskCategory = 'schilderwerk' | 'installaties' | 'dak' | 'tuin' | 'elektra' | 'loodgieter' | 'overig'
type TaskStatus = 'gepland' | 'in_uitvoering' | 'afgerond'

interface PlanningTask {
  id: string
  title: string
  address: string
  category: TaskCategory
  status: TaskStatus
  plannedYear: number
  budget: number
  description?: string
}

const CAT_LABELS: Record<TaskCategory, string> = {
  schilderwerk: 'Schilderwerk',
  installaties: 'Installaties',
  dak: 'Dak',
  tuin: 'Tuin',
  elektra: 'Elektra',
  loodgieter: 'Loodgieter',
  overig: 'Overig',
}

const CAT_ICONS: Record<TaskCategory, React.ComponentType<{ className?: string }>> = {
  schilderwerk: Paintbrush,
  installaties: Zap,
  dak: Wrench,
  tuin: TreePine,
  elektra: Zap,
  loodgieter: Droplets,
  overig: Wrench,
}

const mockTasks: PlanningTask[] = [
  { id: '1', title: 'Buitenschilderwerk', address: 'Keizersgracht 12', category: 'schilderwerk', status: 'gepland', plannedYear: 2026, budget: 8500 },
  { id: '2', title: 'Dakonderhoud + vogelnetten', address: 'Herengracht 45', category: 'dak', status: 'gepland', plannedYear: 2027, budget: 15000 },
  { id: '3', title: 'CV-ketel vervangen', address: 'Prinsengracht 8-1', category: 'installaties', status: 'in_uitvoering', plannedYear: 2026, budget: 4200, description: 'Huidge ketel 18 jaar oud' },
  { id: '4', title: 'Kozijnen vernieuwen', address: 'Singel 88', category: 'schilderwerk', status: 'gepland', plannedYear: 2028, budget: 12000 },
  { id: '5', title: 'Tuinaanleg gemeenschappelijk', address: 'Rozengracht 14', category: 'tuin', status: 'afgerond', plannedYear: 2025, budget: 3500 },
  { id: '6', title: 'Elektrische installatie keuring', address: 'Vondelstraat 22', category: 'elektra', status: 'gepland', plannedYear: 2026, budget: 950 },
  { id: '7', title: 'Rioolreiniging', address: 'Westerstraat 67', category: 'loodgieter', status: 'gepland', plannedYear: 2026, budget: 600 },
]

function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case 'gepland': return <Badge className="bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 border-0">Gepland</Badge>
    case 'in_uitvoering': return <Badge className="bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 border-0">In uitvoering</Badge>
    case 'afgerond': return <Badge className="bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-500 border-0 line-through">Afgerond</Badge>
  }
}

export default function PlanningPage() {
  const { basePath, isDemo } = useDashboardUser()
  const MAINTENANCE_NAV = getMaintenanceNav(basePath)
  const [tasks, setTasks] = useState<PlanningTask[]>(isDemo ? mockTasks : [])
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPropertyId, setNewPropertyId] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('overig')
  const [newYear, setNewYear] = useState(String(new Date().getFullYear() + 1))
  const [newBudget, setNewBudget] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const years = Array.from(new Set(tasks.map((t) => t.plannedYear))).sort()
  const totalBudget = tasks.filter((t) => t.status !== 'afgerond').reduce((s, t) => s + t.budget, 0)
  const inUitvoering = tasks.filter((t) => t.status === 'in_uitvoering').length

  const propertyOptions = isDemo ? mockProperties : []
  const selectedProperty = propertyOptions.find((p) => p.id === newPropertyId)

  const handleCreate = () => {
    if (!newTitle.trim() || !newPropertyId) return
    const task: PlanningTask = {
      id: `${Date.now()}`,
      title: newTitle.trim(),
      address: selectedProperty ? `${selectedProperty.name} — ${selectedProperty.address}` : newPropertyId,
      category: newCategory,
      status: 'gepland',
      plannedYear: parseInt(newYear) || new Date().getFullYear(),
      budget: parseFloat(newBudget) || 0,
      description: newDesc.trim() || undefined,
    }
    setTasks((prev) => [...prev, task].sort((a, b) => a.plannedYear - b.plannedYear))
    setCreateOpen(false)
    setNewTitle(''); setNewPropertyId(''); setNewCategory('overig'); setNewYear(String(new Date().getFullYear() + 1)); setNewBudget(''); setNewDesc('')
  }

  return (
    <>
      <SectionNavDashboard title="Onderhoud" items={MAINTENANCE_NAV} titleVariant="hero" />

      {/* Summary */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        <MetricCard label="Geplande taken" value={String(tasks.filter((t) => t.status !== 'afgerond').length)} icon={<Calendar />} />
        <MetricCard label="In uitvoering" value={String(inUitvoering)} icon={<Wrench />} />
        <MetricCard label="Totaalbudget gepland" value={`€${totalBudget.toLocaleString('nl-NL')}`} icon={<Euro />} />
      </div>

      {/* Per year */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}
          className="bg-[#9FE870] hover:bg-[#8AD45F] text-[#163300] rounded-full px-4 h-9 text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Taak inplannen
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card className={dashboardCardClass()}>
          <CardContent className="py-16 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Nog geen onderhoudstaken ingepland.</p>
          </CardContent>
        </Card>
      ) : (
        years.map((year) => {
          const yearTasks = tasks.filter((t) => t.plannedYear === year)
          const yearBudget = yearTasks.reduce((s, t) => s + t.budget, 0)
          return (
            <Card key={year} className={dashboardCardClass()}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#163300] dark:text-[#9FE870]">{year}</CardTitle>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    €{yearBudget.toLocaleString('nl-NL')} budget
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 pb-1">
                <div className="divide-y divide-gray-50 dark:divide-neutral-800/80">
                  {yearTasks.map((task) => {
                    const Icon = CAT_ICONS[task.category]
                    return (
                      <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {task.address} · {CAT_LABELS[task.category]}
                            {task.description ? ` · ${task.description}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {task.budget > 0 && (
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              €{task.budget.toLocaleString('nl-NL')}
                            </span>
                          )}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md border border-gray-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-[#163300] dark:text-[#9FE870]">Onderhoudstaak inplannen</DialogTitle>
            <DialogDescription>Voeg een toekomstige onderhoudstaak toe aan je planning.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Taak</Label>
              <Input placeholder="bijv. Buitenschilderwerk" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Pand</Label>
              {propertyOptions.length > 0 ? (
                <Select value={newPropertyId} onValueChange={setNewPropertyId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies een pand..." /></SelectTrigger>
                  <SelectContent>
                    {propertyOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-400 ml-1.5 text-xs">{p.address}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Geen panden beschikbaar. Voeg eerst panden toe.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categorie</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TaskCategory)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(CAT_LABELS) as [TaskCategory, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jaar</Label>
                <Input type="number" min={2024} max={2040} value={newYear} onChange={(e) => setNewYear(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Budget (€) <span className="text-gray-400 font-normal text-xs">optioneel</span></Label>
              <Input type="number" min={0} placeholder="bijv. 8500" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Omschrijving <span className="text-gray-400 font-normal text-xs">optioneel</span></Label>
              <Textarea rows={2} placeholder="Extra context..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setCreateOpen(false)}>Annuleren</Button>
            <Button className="rounded-full bg-[#9FE870] text-[#163300] hover:bg-[#8AD45F]"
              disabled={!newTitle.trim() || !newPropertyId} onClick={handleCreate}>
              <Calendar className="h-4 w-4 mr-2" />
              Inplannen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
