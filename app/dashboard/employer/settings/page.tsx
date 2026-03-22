'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  User, Building2, Bell, Upload, Save, Shield, CreditCard, Settings,
  CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff, Mail, Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GekoppeldeRekeningenBlock } from '@/components/dashboard/gekoppelde-rekeningen-block'
import { getProfile, updateProfile, type NotificationPrefs, getDefaultNotificationPrefs } from '@/lib/supabase/profile'
import { demoLinkedAccounts } from '@/lib/mock-data/domio-dashboard'
import { updatePassword, updateEmail, deleteAccount, enrollMfa, verifyMfa, unenrollMfa, listMfaFactors } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type SettingsTab = 'account' | 'beveiliging' | 'abonnement' | 'instellingen'

function StatusBadge({ status, error }: { status: SaveStatus; error?: string }) {
  if (status === 'saving') return <span className="text-sm text-gray-500 flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opslaan…</span>
  if (status === 'saved') return <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Opgeslagen</span>
  if (status === 'error') return <span className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {error || 'Fout'}</span>
  return null
}

function AccountHeaderSkeleton({ cardClass }: { cardClass: string }) {
  return (
    <div
      className={cn(cardClass, 'overflow-hidden')}
      aria-busy="true"
      aria-live="polite"
      aria-label="Accountgegevens laden"
    >
      <div className="h-28 sm:h-32 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      <div className="bg-white dark:bg-neutral-900 px-6 sm:px-8 pt-8 pb-6">
        <div className="-mt-[4.5rem] shrink-0">
          <div className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 w-full max-w-md">
            <div className="h-8 w-52 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="h-4 w-72 max-w-full rounded-md bg-neutral-200 dark:bg-neutral-600/80 animate-pulse" />
            <div className="h-4 w-56 max-w-full rounded-md bg-neutral-200 dark:bg-neutral-600/80 animate-pulse" />
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            <div className="h-4 w-56 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="h-4 w-40 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="h-4 w-48 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-[7.5rem] rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsPillNav({ activeTab, onTabChange }: { activeTab: SettingsTab; onTabChange: (t: SettingsTab) => void }) {
  const tabs: { key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'beveiliging', label: 'Beveiliging', icon: Shield },
    { key: 'abonnement', label: 'Abonnement', icon: CreditCard },
    { key: 'instellingen', label: 'Instellingen', icon: Settings },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = key === activeTab
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              'inline-flex items-center gap-2 px-[1.125rem] py-2 rounded-full text-sm font-medium transition-all',
              active
                ? 'bg-[#9FE870] text-[#163300] hover:bg-[#9FE870]/90'
                : 'bg-[#f4f4f4] dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-[#eaeaea] dark:hover:bg-neutral-600'
            )}
          >
            <Icon className="size-4 shrink-0 text-current" />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function SettingsPage() {
  const { isDemo, user, profile: dashProfile, basePath, loading: userCtxLoading } = useDashboardUser()
  const showLinkedAccounts = isDemo || dashProfile?.full_name?.trim() === 'Jaime Ram'
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '' })
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [emailForm, setEmailForm] = useState({ newEmail: '' })

  const [companyForm, setCompanyForm] = useState({
    companyName: '', address: '', postalCode: '', city: '',
    kvk: '', btw: '', email: '', phone: '', logo: null as File | null,
  })

  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(getDefaultNotificationPrefs())
  const [language, setLanguage] = useState<'nl' | 'en'>('nl')

  const [accountStatus, setAccountStatus] = useState<SaveStatus>('idle')
  const [accountError, setAccountError] = useState('')
  const [pwStatus, setPwStatus] = useState<SaveStatus>('idle')
  const [pwError, setPwError] = useState('')
  const [emailStatus, setEmailStatus] = useState<SaveStatus>('idle')
  const [emailError, setEmailError] = useState('')
  const [companyStatus, setCompanyStatus] = useState<SaveStatus>('idle')
  const [companyError, setCompanyError] = useState('')
  const [notifStatus, setNotifStatus] = useState<SaveStatus>('idle')
  const [langStatus, setLangStatus] = useState<SaveStatus>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [mfaFactors, setMfaFactors] = useState<{ id: string; status: string; friendly_name?: string }[]>([])
  const [mfaEnrolling, setMfaEnrolling] = useState(false)
  const [mfaQr, setMfaQr] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [mfaVerifying, setMfaVerifying] = useState(false)
  const [mfaEmailEnabled, setMfaEmailEnabled] = useState(false)
  const [mfaEmailStatus, setMfaEmailStatus] = useState<SaveStatus>('idle')
  /** Pas echte naam/e-mail tonen als data binnen is — geen tijdelijke placeholders (vertrouwen). */
  const [accountDataReady, setAccountDataReady] = useState(false)

  const loadMfaFactors = useCallback(async () => {
    if (isDemo) return
    const { data } = await listMfaFactors()
    if (data?.totp) setMfaFactors(data.totp.map((f) => ({ id: f.id, status: f.status, friendly_name: f.friendly_name ?? undefined })))
  }, [isDemo])

  const loadProfile = useCallback(async () => {
    if (isDemo) return
    if (!user?.id) {
      setAccountDataReady(true)
      return
    }
    try {
      const p = await getProfile(user.id)
      if (p) {
        setAccountForm({ name: p.full_name || '', email: p.email || '', phone: p.phone || '' })
        setCompanyForm({
          companyName: p.company_name || '', address: p.company_address || '',
          postalCode: p.company_postal_code || '', city: p.company_city || '',
          kvk: p.kvk_number || '', btw: p.btw_number || '',
          email: p.company_email || '', phone: p.company_phone || '', logo: null,
        })
        setNotifPrefs(p.notification_prefs || getDefaultNotificationPrefs())
        setLanguage(p.language || 'nl')
        setMfaEmailEnabled(p.mfa_email_enabled ?? false)
      }
    } finally {
      setAccountDataReady(true)
    }
  }, [user?.id, isDemo])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!isDemo) return
    if (dashProfile) {
      setAccountForm({
        name: dashProfile.full_name || 'Demo Gebruiker',
        email: dashProfile.email || 'demo@domio.nl',
        phone: dashProfile.phone || '',
      })
      setAccountDataReady(true)
    } else if (!userCtxLoading) {
      setAccountDataReady(true)
    }
  }, [isDemo, dashProfile, userCtxLoading])

  useEffect(() => {
    if (!userCtxLoading && !user && !isDemo) setAccountDataReady(true)
  }, [userCtxLoading, user, isDemo])
  useEffect(() => { loadMfaFactors() }, [loadMfaFactors])

  // Initieel tab kiezen op basis van ?tab= in de URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (!tab) return
    if (tab === 'notificaties') {
      setActiveTab('account')
      return
    }
    if (['account', 'beveiliging', 'abonnement', 'instellingen'].includes(tab)) {
      setActiveTab(tab as SettingsTab)
    }
  }, [])

  const handleSaveAccount = async () => {
    if (isDemo || !user?.id) return
    setAccountStatus('saving')
    const { error } = await updateProfile(user.id, { full_name: accountForm.name, phone: accountForm.phone || null })
    if (error) { setAccountStatus('error'); setAccountError(error.message); return }
    setAccountStatus('saved')
    setTimeout(() => setAccountStatus('idle'), 3000)
  }

  const handleChangePassword = async () => {
    if (isDemo) return
    if (pwForm.newPassword.length < 8) { setPwStatus('error'); setPwError('Minimaal 8 tekens'); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwStatus('error'); setPwError('Wachtwoorden komen niet overeen'); return }
    setPwStatus('saving')
    const { error } = await updatePassword(pwForm.newPassword)
    if (error) { setPwStatus('error'); setPwError(error.message); return }
    setPwStatus('saved'); setPwForm({ newPassword: '', confirmPassword: '' })
    setTimeout(() => setPwStatus('idle'), 3000)
  }

  const handleChangeEmail = async () => {
    if (isDemo) return
    if (!emailForm.newEmail.includes('@')) { setEmailStatus('error'); setEmailError('Ongeldig e-mailadres'); return }
    setEmailStatus('saving')
    const { error } = await updateEmail(emailForm.newEmail)
    if (error) { setEmailStatus('error'); setEmailError(error.message); return }
    setEmailStatus('saved'); setEmailError('')
    setEmailForm({ newEmail: '' })
    setTimeout(() => setEmailStatus('idle'), 5000)
  }

  const handleSaveCompany = async () => {
    if (isDemo || !user?.id) return
    setCompanyStatus('saving')
    const { error } = await updateProfile(user.id, {
      company_name: companyForm.companyName || null,
      kvk_number: companyForm.kvk || null,
      btw_number: companyForm.btw || null,
      company_address: companyForm.address || null,
      company_postal_code: companyForm.postalCode || null,
      company_city: companyForm.city || null,
      company_email: companyForm.email || null,
      company_phone: companyForm.phone || null,
    })
    if (error) { setCompanyStatus('error'); setCompanyError(error.message); return }
    setCompanyStatus('saved')
    setTimeout(() => setCompanyStatus('idle'), 3000)
  }

  const handleSaveNotifications = async () => {
    if (isDemo || !user?.id) return
    setNotifStatus('saving')
    const { error } = await updateProfile(user.id, { notification_prefs: notifPrefs })
    if (error) { setNotifStatus('error'); return }
    setNotifStatus('saved')
    setTimeout(() => setNotifStatus('idle'), 3000)
  }

  const handleSaveLanguage = async () => {
    if (isDemo || !user?.id) return
    setLangStatus('saving')
    const { error } = await updateProfile(user.id, { language })
    if (error) { setLangStatus('error'); return }
    setLangStatus('saved')
    setTimeout(() => setLangStatus('idle'), 3000)
  }

  const handleToggleMfaEmail = async (enabled: boolean) => {
    if (isDemo || !user?.id) return
    setMfaEmailStatus('saving')
    const { error } = await updateProfile(user.id, { mfa_email_enabled: enabled })
    if (error) { setMfaEmailStatus('error'); return }
    setMfaEmailEnabled(enabled)
    setMfaEmailStatus('saved')
    setTimeout(() => setMfaEmailStatus('idle'), 3000)
  }

  const handleDeleteAccount = async () => {
    if (isDemo) return
    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    if (error) { alert(error.message); return }
    router.push('/')
  }

  const sCard = 'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

  const rawName = accountForm.name?.trim() || dashProfile?.full_name?.trim() || ''
  const displayEmail =
    accountForm.email?.trim() || dashProfile?.email?.trim() || user?.email?.trim() || ''
  const displayName = rawName || '—'
  const initialsLetters = (() => {
    if (!rawName) return null
    const parts = rawName.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return null
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  })()

  const memberSinceLabel = (() => {
    const iso = dashProfile?.created_at || (user as { created_at?: string } | null)?.created_at
    if (!iso) return null
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  })()

  return (
    <>
      {/* ===== PROFIEL HEADER — geen persoonsgegevens tot data geladen (vertrouwen) ===== */}
      {!accountDataReady ? (
        <AccountHeaderSkeleton cardClass={sCard} />
      ) : (
        <div className={cn(sCard, 'overflow-hidden')}>
          <div
            className="h-28 sm:h-32 bg-[#163300] bg-cover bg-no-repeat"
            style={{ backgroundImage: "url('/images/Achtergrond2.jpg')", backgroundPosition: '50% 26%' }}
          />
          <div className="bg-white dark:bg-neutral-900 px-6 sm:px-8 pt-8 pb-6">
            <div className="-mt-[4.5rem] shrink-0">
              <div className="h-20 w-20 rounded-full bg-[#f4f4f4] dark:bg-neutral-800 flex items-center justify-center text-[#163300] dark:text-[#9FE870] text-xl font-semibold">
                {initialsLetters != null ? (
                  initialsLetters
                ) : (
                  <User className="h-9 w-9 text-gray-400 dark:text-gray-500" aria-hidden />
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-2">
              <div className="flex flex-col items-center sm:items-start gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#163300] dark:text-[#9FE870] text-center sm:text-left">
                  {displayName}
                </h1>
                <div className="mt-3">
                  <SettingsPillNav activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-2 sm:flex-shrink-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  E-mail:{' '}
                  <span className="text-gray-900 dark:text-white">{displayEmail || '—'}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rol: <span className="text-gray-900 dark:text-white">Verhuurder</span>
                </p>
                {memberSinceLabel ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gebruiker sinds {memberSinceLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab-inhoud: pas tonen als accountcontext geladen (zelfde vertrouwensniveau als header) */}
      {accountDataReady && activeTab === 'beveiliging' && (
        <div className={cn(sCard, 'mt-6 p-6')}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Twee-stapsverificatie</h2>
          {!isDemo && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">2FA met code per e-mail</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Bij inloggen sturen we een 6-cijferige code naar je e-mailadres. Voer die code in om in te loggen.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={mfaEmailStatus} />
                <Switch
                  checked={mfaEmailEnabled}
                  onCheckedChange={handleToggleMfaEmail}
                  disabled={mfaEmailStatus === 'saving'}
                />
              </div>
            </div>
          )}
          {isDemo && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Schakel 2FA in via je account in de echte omgeving.</p>
          )}
        </div>
      )}

    </>
  )
}
