'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  User, Shield, CreditCard, Settings,
  CheckCircle2, Pencil, X, Check, Loader2, Mail, Building2,
  Landmark, BookOpen, RefreshCw, ExternalLink,
  Globe, Bell, Trash2, AlertTriangle, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProfile, updateProfile, type NotificationPrefs, getDefaultNotificationPrefs } from '@/lib/supabase/profile'
import { resetPassword, enrollMfa, challengeMfa, verifyMfa, verifyMfaCode, unenrollMfa, listMfaFactors, updateEmail, deleteAccount } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import { DeleteAccountDialog } from '@/components/dashboard/delete-account-dialog'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type SettingsTab = 'account' | 'beveiliging' | 'abonnement' | 'koppelingen'


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
            <div key={i} className="h-9 w-[7.5rem] rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
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
    { key: 'koppelingen', label: 'Koppelingen', icon: Settings },
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

type AccountFormData = {
  name: string
  email: string
  phone: string
  company_name: string
  kvk_number: string
  btw_number: string
  company_email: string
  company_address: string
  company_postal_code: string
  company_city: string
}

type EditingField = 'personal' | 'login' | 'company' | null

export default function SettingsPage() {
  const { isDemo, user, profile: dashProfile, loading: userCtxLoading, refetch } = useDashboardUser()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [accountForm, setAccountForm] = useState<AccountFormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    kvk_number: '',
    btw_number: '',
    company_email: '',
    company_address: '',
    company_postal_code: '',
    company_city: '',
  })
  const [originalForm, setOriginalForm] = useState<AccountFormData | null>(null)
  const [accountDataReady, setAccountDataReady] = useState(false)
  const [mfaMethod, setMfaMethod] = useState<'none' | 'totp'>('none')
  const [mfaMethodStatus, setMfaMethodStatus] = useState<SaveStatus>('idle')
  const [pwResetStatus, setPwResetStatus] = useState<SaveStatus>('idle')
  const [pwResetError, setPwResetError] = useState('')
  const [pwResetCooldown, setPwResetCooldown] = useState(0)
  const [pwResetAnimating, setPwResetAnimating] = useState(false)

  // Account editing state
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [savingField, setSavingField] = useState<EditingField>(null)
  const [fieldError, setFieldError] = useState<string>('')
  const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'pending' | 'sent'>('idle')
  const [newEmail, setNewEmail] = useState('')

  // TOTP MFA
  const [totpFactors, setTotpFactors] = useState<{ id: string; friendly_name?: string }[]>([])
  const [totpEnrolling, setTotpEnrolling] = useState(false)
  const [totpQr, setTotpQr] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [totpFactorId, setTotpFactorId] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [totpError, setTotpError] = useState('')
  const [totpVerifying, setTotpVerifying] = useState(false)
  const [unenrollFactorId, setUnenrollFactorId] = useState('')
  const [unenrollCode, setUnenrollCode] = useState('')
  const [unenrollError, setUnenrollError] = useState('')
  const [unenrollVerifying, setUnenrollVerifying] = useState(false)
  const [totpResetting, setTotpResetting] = useState(false)
  const [totpResetCode, setTotpResetCode] = useState('')
  const [totpResetError, setTotpResetError] = useState('')
  const [totpResetWorking, setTotpResetWorking] = useState(false)

  // Voorkeuren
  const [language, setLanguage] = useState<'nl' | 'en'>('nl')
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(getDefaultNotificationPrefs())
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)

  // Account verwijderen
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Beveiliging expand
  const [bevSection, setBevSection] = useState<'wachtwoord' | '2fa' | null>(null)

  // Voorkeuren expand
  const [prefSection, setPrefSection] = useState<'taal' | 'notif' | null>(null)

  // Koppelingen
  interface BankConnection { iban: string | null; last_synced_at: string | null }
  const [bankConnection, setBankConnection] = useState<BankConnection | null>(null)
  const [bankLoading, setBankLoading] = useState(true)
  const [bankSyncing, setBankSyncing] = useState(false)


  const loadTotpFactors = useCallback(async () => {
    if (isDemo) return
    const { data } = await listMfaFactors()
    if (data?.totp) setTotpFactors(data.totp.map((f) => ({ id: f.id, friendly_name: f.friendly_name ?? undefined })))
  }, [isDemo])

  const loadProfile = useCallback(async () => {
    if (isDemo) return
    if (!user?.id) { setAccountDataReady(true); return }
    try {
      const p = await getProfile(user.id)
      if (p) {
        const formData: AccountFormData = {
          name: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
          company_name: p.company_name || '',
          kvk_number: p.kvk_number || '',
          btw_number: p.btw_number || '',
          company_email: p.company_email || '',
          company_address: p.company_address || '',
          company_postal_code: p.company_postal_code || '',
          company_city: p.company_city || '',
        }
        setAccountForm(formData)
        setOriginalForm(formData)
        setMfaMethod(p.mfa_method ?? 'none')
        setLanguage(p.language ?? 'nl')
        setNotifPrefs(p.notification_prefs ?? getDefaultNotificationPrefs())
      }
    } finally {
      setAccountDataReady(true)
    }
  }, [user?.id, isDemo])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => { loadTotpFactors() }, [loadTotpFactors])

  useEffect(() => {
    if (!isDemo) return
    if (dashProfile) {
      const formData: AccountFormData = {
        name: dashProfile.full_name || 'Demo Gebruiker',
        email: dashProfile.email || 'demo@domio.nl',
        phone: dashProfile.phone || '+31 6 12345678',
        company_name: dashProfile.company_name || 'Demo Vastgoed B.V.',
        kvk_number: dashProfile.kvk_number || '12345678',
        btw_number: dashProfile.btw_number || 'NL123456789B01',
        company_email: dashProfile.company_email || 'info@demovastgoed.nl',
        company_address: dashProfile.company_address || 'Voorbeeldstraat 1',
        company_postal_code: dashProfile.company_postal_code || '1234 AB',
        company_city: dashProfile.company_city || 'Amsterdam',
      }
      setAccountForm(formData)
      setOriginalForm(formData)
      setLanguage(dashProfile.language ?? 'nl')
      setNotifPrefs(dashProfile.notification_prefs ?? getDefaultNotificationPrefs())
      setAccountDataReady(true)
    } else if (!userCtxLoading) {
      setAccountDataReady(true)
    }
  }, [isDemo, dashProfile, userCtxLoading])

  useEffect(() => {
    if (!userCtxLoading && !user && !isDemo) setAccountDataReady(true)
  }, [userCtxLoading, user, isDemo])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (!tab) return
    if (['account', 'beveiliging', 'abonnement', 'koppelingen'].includes(tab)) {
      setActiveTab(tab as SettingsTab)
    }
  }, [])

  useEffect(() => {
    if (isDemo) { setBankLoading(false); return }
    supabase.from('bank_connections').select('iban, last_synced_at').eq('provider', 'tink').maybeSingle()
      .then(({ data }) => { setBankConnection(data ?? null); setBankLoading(false) })
  }, [isDemo])

  async function handleBankSync() {
    setBankSyncing(true)
    try {
      await fetch('/api/tink/sync', { method: 'POST' })
      const { data } = await supabase.from('bank_connections').select('iban, last_synced_at').eq('provider', 'tink').maybeSingle()
      setBankConnection(data ?? null)
    } finally {
      setBankSyncing(false)
    }
  }

  function handleBankConnect() { window.location.href = '/api/tink/link' }

  const formatBankDate = (iso: string) =>
    new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  // Account field handlers
  const cancelEditing = () => {
    if (originalForm) setAccountForm(originalForm)
    setEditingField(null)
    setFieldError('')
    setNewEmail('')
    setEmailChangeStatus('idle')
  }

  const handleSavePersonal = async () => {
    if (isDemo || !user?.id) return
    const name = accountForm.name.trim()
    const phone = accountForm.phone.trim()
    if (!name) { setFieldError('Naam is verplicht'); return }
    setSavingField('personal')
    setFieldError('')
    const { error } = await updateProfile(user.id, { 
      full_name: name,
      phone: phone || null,
    })
    setSavingField(null)
    if (error) { setFieldError(error.message); return }
    setOriginalForm(prev => prev ? { ...prev, name, phone } : null)
    setEditingField(null)
    refetch()
  }

  const handleSaveCompany = async () => {
    if (isDemo || !user?.id) return
    const companyEmail = accountForm.company_email.trim()
    if (companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
      setFieldError('Ongeldig zakelijk e-mailadres')
      return
    }
    setSavingField('company')
    setFieldError('')
    const { error } = await updateProfile(user.id, {
      company_name: accountForm.company_name.trim() || null,
      kvk_number: accountForm.kvk_number.trim() || null,
      btw_number: accountForm.btw_number.trim() || null,
      company_email: companyEmail || null,
      company_address: accountForm.company_address.trim() || null,
      company_postal_code: accountForm.company_postal_code.trim() || null,
      company_city: accountForm.company_city.trim() || null,
    })
    setSavingField(null)
    if (error) { setFieldError(error.message); return }
    setOriginalForm(prev => prev ? {
      ...prev,
      company_name: accountForm.company_name.trim(),
      kvk_number: accountForm.kvk_number.trim(),
      btw_number: accountForm.btw_number.trim(),
      company_email: companyEmail,
      company_address: accountForm.company_address.trim(),
      company_postal_code: accountForm.company_postal_code.trim(),
      company_city: accountForm.company_city.trim(),
    } : null)
    setEditingField(null)
    refetch()
  }

  const handleSendEmailVerification = async () => {
    if (isDemo || !user?.id) return
    const email = newEmail.trim().toLowerCase()
    const currentAuthEmail = user?.email?.toLowerCase() || ''
    if (!email) { setFieldError('E-mailadres is verplicht'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('Ongeldig e-mailadres'); return }
    if (email === currentAuthEmail) { setFieldError('Dit is je huidige e-mailadres'); return }
    
    setSavingField('login')
    setFieldError('')
    
    // Supabase sends a confirmation email to the new address
    const { error } = await updateEmail(email)
    setSavingField(null)
    
    if (error) { 
      setFieldError(error.message)
      return 
    }
    
    setEmailChangeStatus('sent')
  }

  const handleSavePrefs = async (newLang?: 'nl' | 'en', newPrefs?: NotificationPrefs) => {
    if (isDemo || !user?.id) return
    setPrefsSaving(true)
    await updateProfile(user.id, {
      language: newLang ?? language,
      notification_prefs: newPrefs ?? notifPrefs,
    })
    setPrefsSaving(false)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount()
    if (error) throw new Error(error.message)
    window.location.href = '/login'
  }

  const handleSelectMethod = async (method: 'none' | 'totp') => {
    if (isDemo || !user?.id) return
    if (method === 'totp' && totpFactors.length === 0) { handleStartTotpEnroll(); return }
    setMfaMethodStatus('saving')
    const { error } = await updateProfile(user.id, { mfa_method: method })
    if (error) { setMfaMethodStatus('error'); return }
    setMfaMethod(method)
    setMfaMethodStatus('idle')
  }

  const handleStartTotpEnroll = async () => {
    setTotpError('')
    setTotpEnrolling(true)
    setTotpCode('')
    const { data, error } = await enrollMfa()
    if (error || !data) { setTotpError(error?.message || 'Fout bij inschrijven'); setTotpEnrolling(false); return }
    setTotpQr(data.totp.qr_code)
    setTotpSecret(data.totp.secret)
    setTotpFactorId(data.id)
  }

  const handleVerifyTotp = async () => {
    if (!totpCode || !totpFactorId) return
    setTotpVerifying(true); setTotpError('')
    const { error } = await verifyMfa(totpFactorId, totpCode)
    setTotpVerifying(false)
    if (error) { setTotpError(error.message); return }
    setTotpEnrolling(false); setTotpQr(''); setTotpSecret(''); setTotpCode('')
    if (user?.id) {
      await updateProfile(user.id, { mfa_method: 'totp' })
      setMfaMethod('totp')
    }
    await loadTotpFactors()
  }

  const handleUnenrollTotp = async () => {
    if (!unenrollFactorId || unenrollCode.length !== 6) return
    setUnenrollVerifying(true)
    setUnenrollError('')
    // Must verify first to reach AAL2, then unenroll
    const { error: verifyError } = await verifyMfa(unenrollFactorId, unenrollCode)
    if (verifyError) { setUnenrollError(verifyError.message); setUnenrollVerifying(false); return }
    const { error } = await unenrollMfa(unenrollFactorId)
    setUnenrollVerifying(false)
    if (error) { setUnenrollError(error.message); return }
    const remaining = totpFactors.filter(f => f.id !== unenrollFactorId)
    setUnenrollFactorId('')
    setUnenrollCode('')
    if (remaining.length === 0 && user?.id) {
      await updateProfile(user.id, { mfa_method: 'none' })
      setMfaMethod('none')
    }
    await loadTotpFactors()
  }

  const handleResetTotp = async () => {
    if (!totpResetCode || totpFactors.length === 0) return
    setTotpResetWorking(true)
    setTotpResetError('')
    // Verify against the first factor to reach AAL2
    const { error: verifyError } = await verifyMfa(totpFactors[0].id, totpResetCode)
    if (verifyError) { setTotpResetError(verifyError.message); setTotpResetWorking(false); return }
    // Unenroll all factors
    for (const f of totpFactors) { await unenrollMfa(f.id) }
    if (user?.id) { await updateProfile(user.id, { mfa_method: 'none' }); setMfaMethod('none') }
    setTotpResetting(false); setTotpResetCode(''); setTotpResetWorking(false)
    await loadTotpFactors()
  }

  const handleSendPasswordReset = async () => {
    if (isDemo) return
    const email = user?.email?.trim() || accountForm.email?.trim() || ''
    if (!email) { setPwResetStatus('error'); setPwResetError('Geen e-mailadres bekend'); return }
    setPwResetStatus('saving')
    const { error } = await resetPassword(email)
    if (error) { setPwResetStatus('error'); setPwResetError(error.message); return }
    setPwResetStatus('saved')
    setPwResetCooldown(20)
    setPwResetAnimating(true)
    const interval = setInterval(() => {
      setPwResetCooldown((c) => {
        if (c <= 1) { clearInterval(interval); setPwResetStatus('idle'); setPwResetAnimating(false); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const sCard = 'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

  const rawName = accountForm.name?.trim() || dashProfile?.full_name?.trim() || ''
  const displayEmail = accountForm.email?.trim() || dashProfile?.email?.trim() || user?.email?.trim() || ''
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
                {initialsLetters != null ? initialsLetters : <User className="h-9 w-9 text-gray-400 dark:text-gray-500" aria-hidden />}
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
            </div>
          </div>
        </div>
      )}

      {accountDataReady && activeTab === 'account' && (
        <div className="space-y-8 px-6 sm:px-8">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Beheer je persoonlijke gegevens, inlogmethode en bedrijfsinfo.</p>
          </div>

          {/* Gegevens */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Gegevens</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="">

              <button className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Persoonlijke gegevens</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{accountForm.name ? `${accountForm.name}${accountForm.phone ? ` · ${accountForm.phone}` : ''}` : 'Naam en telefoonnummer instellen'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
              </button>

              <button className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Inloggegevens</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || 'E-mailadres instellen'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
              </button>

              <button className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Bedrijfsgegevens</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{accountForm.company_name || 'Naam, KvK, BTW en adres instellen'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
              </button>

            </div>
          </div>

          {/* Voorkeuren */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Voorkeuren</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="">

              {/* Taalvoorkeur */}
              <div>
                <button onClick={() => setPrefSection(prefSection === 'taal' ? null : 'taal')} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Taalvoorkeur</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'nl' ? 'Nederlands' : 'English'}</p>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform', prefSection === 'taal' && 'rotate-90')} />
                </button>
                {prefSection === 'taal' && (
                  <div className="pb-4 flex gap-2 flex-wrap items-center">
                    {(['nl', 'en'] as const).map((lang) => (
                      <button key={lang} onClick={async () => { setLanguage(lang); await handleSavePrefs(lang) }} className={cn('px-4 py-1.5 rounded-full text-sm font-medium border transition-colors', language === lang ? 'bg-[#9FE870] text-[#163300] border-[#9FE870]' : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300')}>
                        {lang === 'nl' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
                      </button>
                    ))}
                    {prefsSaving && <span className="flex items-center gap-1 text-xs text-gray-400"><Loader2 className="h-3 w-3 animate-spin" />Opslaan…</span>}
                    {prefsSaved && <span className="flex items-center gap-1 text-xs text-[#163300] dark:text-[#9FE870]"><Check className="h-3 w-3" />Opgeslagen</span>}
                  </div>
                )}
              </div>

              {/* Notificaties */}
              <div>
                <button onClick={() => setPrefSection(prefSection === 'notif' ? null : 'notif')} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Notificaties</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kies hoe en waarover je meldingen ontvangt</p>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform', prefSection === 'notif' && 'rotate-90')} />
                </button>
                {prefSection === 'notif' && (
                  <div className="pb-3 space-y-0">
                    {[
                      { key: 'email' as const, label: 'E-mail', sub: 'Via e-mail' },
                      { key: 'in_app' as const, label: 'In-app', sub: 'In het dashboard' },
                      { key: 'new_payment' as const, label: 'Nieuwe betaling', sub: '' },
                      { key: 'payment_overdue' as const, label: 'Betaling te laat', sub: '' },
                      { key: 'maintenance_request' as const, label: 'Onderhoudsverzoek', sub: '' },
                      { key: 'document_expiring' as const, label: 'Document verloopt binnenkort', sub: '' },
                    ].map(({ key, label, sub }) => (
                      <label key={key} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-neutral-800 last:border-0 cursor-pointer">
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200">{label}</p>
                          {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
                        </div>
                        <input type="checkbox" checked={notifPrefs[key]} onChange={async (e) => { const next = { ...notifPrefs, [key]: e.target.checked }; setNotifPrefs(next); await handleSavePrefs(undefined, next) }} className="h-4 w-4 rounded accent-[#163300]" />
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Gevarenzone */}
          <div>
            <p className="text-sm font-semibold text-red-500 dark:text-red-400 mb-3">Gevarenzone</p>
            <div className="border-b border-red-100 dark:border-red-900/40" />
            <div>
              <button onClick={() => setDeleteOpen(true)} className="w-full flex items-center gap-4 py-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors text-left">
                <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Account verwijderen</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Permanent account en data verwijderen (AVG)</p>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400 shrink-0" />
              </button>
            </div>
          </div>

          <DeleteAccountDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDeleteAccount}
            isDemo={isDemo}
          />

          {isDemo && (
            <div className={cn(sCard, 'px-5 py-4 flex items-center gap-4')}>
              <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Demo-omgeving</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wijzigingen worden niet opgeslagen.</p>
              </div>
            </div>
          )}

        </div>
      )}

      {accountDataReady && activeTab === 'beveiliging' && (
        <div className="space-y-8 px-6 sm:px-8">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Beveiliging</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Beheer hoe je inlogt en hoe je account wordt beschermd.</p>
          </div>

          {/* Inlogbeveiliging */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Inlogbeveiliging</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div>

              {/* Wachtwoord */}
              <div>
                <button onClick={() => setBevSection(bevSection === 'wachtwoord' ? null : 'wachtwoord')} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Wachtwoord wijzigen</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stuur een resetlink naar je e-mailadres</p>
                    <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Standaard</p>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform', bevSection === 'wachtwoord' && 'rotate-90')} />
                </button>
                {bevSection === 'wachtwoord' && (
                  <div className="pb-4 space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We sturen een resetlink naar <span className="font-medium text-gray-700 dark:text-gray-300">{displayEmail || 'je e-mailadres'}</span>.
                    </p>
                    {!isDemo ? (
                      <button onClick={handleSendPasswordReset} disabled={pwResetCooldown > 0} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors', pwResetCooldown > 0 ? 'bg-gray-300 dark:bg-neutral-600 cursor-not-allowed' : 'bg-[#163300] hover:bg-[#163300]/90')}>
                        {pwResetStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {pwResetStatus === 'saved' && <CheckCircle2 className="h-4 w-4" />}
                        <span>{pwResetStatus === 'error' ? (pwResetError || 'Fout bij versturen') : pwResetCooldown > 0 ? `Verstuurd — opnieuw in ${pwResetCooldown}s` : 'Resetlink versturen'}</span>
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500">Beschikbaar in de echte omgeving.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div>
                <button onClick={() => setBevSection(bevSection === '2fa' ? null : '2fa')} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Twee-stapsverificatie</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mfaMethod === 'totp' ? 'Ingeschakeld via authenticator-app' : 'Niet ingeschakeld'}
                    </p>
                    <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">
                      {mfaMethod === 'totp' ? 'Zeer veilig' : 'Minder veilig'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {mfaMethod === 'totp' && (
                      <span className="inline-flex items-center rounded-full bg-[#9FE870]/20 dark:bg-[#9FE870]/10 px-2.5 py-0.5 text-xs font-medium text-[#163300] dark:text-[#9FE870]">Aan</span>
                    )}
                    <ChevronRight className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform', bevSection === '2fa' && 'rotate-90')} />
                  </div>
                </button>
                {bevSection === '2fa' && (
                  <div className="pb-4 space-y-0">
                    {isDemo ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 px-3 pb-2">Schakel 2FA in via je account in de echte omgeving.</p>
                    ) : (
                      <>
                        {/* Geen verificatie */}
                        <button type="button" onClick={() => handleSelectMethod('none')} disabled={mfaMethod === 'none' || mfaMethodStatus === 'saving'} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left disabled:cursor-default">
                          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Geen verificatie</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alleen e-mailadres en wachtwoord</p>
                            <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Minder veilig</p>
                          </div>
                          {mfaMethod === 'none' ? (
                            <CheckCircle2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                          )}
                        </button>

                        {/* Authenticator-app */}
                        <div>
                          <button type="button" onClick={() => { if (!totpEnrolling && mfaMethod !== 'totp') handleSelectMethod('totp') }} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                              <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Authenticator-app</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Google Authenticator, 1Password of vergelijkbaar</p>
                              <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Zeer veilig</p>
                            </div>
                            {mfaMethod === 'totp' ? (
                              <CheckCircle2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                            )}
                          </button>
                          {(mfaMethod === 'totp' || totpEnrolling) && (
                            <div className="px-3 pb-4 space-y-2">
                              {totpFactors.length > 0 && (
                                <div className="space-y-2">
                                  {totpFactors.map((f) => (
                                    <div key={f.id}>
                                      <div className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle2 className="h-4 w-4 text-[#163300] dark:text-[#9FE870] shrink-0" />
                                          <span className="text-sm font-medium text-gray-900 dark:text-white">{f.friendly_name?.split(' ')?.[0] || 'Authenticator'}</span>
                                        </div>
                                        {unenrollFactorId === f.id ? (
                                          <button onClick={() => { setUnenrollFactorId(''); setUnenrollCode(''); setUnenrollError('') }} className="text-xs text-gray-500 hover:underline">Annuleren</button>
                                        ) : (
                                          <button onClick={() => { setUnenrollFactorId(f.id); setUnenrollCode(''); setUnenrollError('') }} className="text-xs text-red-600 dark:text-red-400 hover:underline">Verwijderen</button>
                                        )}
                                      </div>
                                      {unenrollFactorId === f.id && (
                                        <div className="mt-2 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-3 py-3 space-y-2">
                                          <p className="text-xs text-gray-600 dark:text-gray-400">Voer een code in om te bevestigen.</p>
                                          <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={unenrollCode} onChange={(e) => setUnenrollCode(e.target.value.replace(/\D/g, ''))} className="w-32 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-red-300" />
                                          {unenrollError && <p className="text-xs text-red-600 dark:text-red-400">{unenrollError}</p>}
                                          <button onClick={handleUnenrollTotp} disabled={unenrollCode.length !== 6 || unenrollVerifying} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">{unenrollVerifying ? 'Verwijderen…' : 'Bevestig verwijderen'}</button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!totpEnrolling && !unenrollFactorId && !totpResetting && totpFactors.length > 0 && (
                                <button type="button" onClick={() => { setTotpResetting(true); setTotpResetCode(''); setTotpResetError('') }} className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 hover:underline">Reset alle apps</button>
                              )}
                              {totpResetting && (
                                <div className="rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-3 py-3 space-y-2">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Voer een code in om alle gekoppelde apps te verwijderen.</p>
                                  <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={totpResetCode} onChange={(e) => setTotpResetCode(e.target.value.replace(/\D/g, ''))} className="w-32 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-red-300" />
                                  {totpResetError && <p className="text-xs text-red-600 dark:text-red-400">{totpResetError}</p>}
                                  <div className="flex gap-2">
                                    <button onClick={handleResetTotp} disabled={totpResetCode.length !== 6 || totpResetWorking} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">{totpResetWorking ? 'Resetten…' : 'Alles verwijderen'}</button>
                                    <button onClick={() => { setTotpResetting(false); setTotpResetCode(''); setTotpResetError('') }} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Annuleren</button>
                                  </div>
                                </div>
                              )}
                              {totpError && !totpEnrolling && <p className="text-xs text-red-600 dark:text-red-400">{totpError}</p>}
                              {totpEnrolling && totpQr && (
                                <div className="mt-2 pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Scan de QR-code met je authenticator-app.</p>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={totpQr} alt="TOTP QR code" className="h-40 w-40 rounded-xl border border-gray-200 dark:border-neutral-700" />
                                  <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 px-3 py-2 max-w-xs">
                                    <p className="text-xs text-gray-400 mb-0.5">Handmatige sleutel</p>
                                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{totpSecret}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Voer de 6-cijferige code in</p>
                                    <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))} className="w-36 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#163300]/20" />
                                  </div>
                                  {totpError && <p className="text-xs text-red-600 dark:text-red-400">{totpError}</p>}
                                  <div className="flex gap-2">
                                    <button onClick={handleVerifyTotp} disabled={totpVerifying || totpCode.length !== 6} className="px-4 py-2 text-sm font-medium text-white bg-[#163300] hover:bg-[#163300]/90 rounded-lg transition-colors disabled:opacity-50">{totpVerifying ? 'Verifiëren…' : 'Bevestigen'}</button>
                                    <button onClick={async () => { if (totpFactorId) await unenrollMfa(totpFactorId); setTotpEnrolling(false); setTotpQr(''); setTotpSecret(''); setTotpCode(''); setTotpError(''); setTotpFactorId('') }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Annuleren</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Sessies */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Sessies</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="">
              <div className="flex items-center gap-4 py-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Huidige sessie</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Webbrowser · Nu actief</p>
                  <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Actief</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#9FE870]/20 dark:bg-[#9FE870]/10 px-2.5 py-0.5 text-xs font-medium text-[#163300] dark:text-[#9FE870] shrink-0">
                  Actief
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Abonnement tab */}
      {accountDataReady && activeTab === 'abonnement' && (
        <div className="space-y-8 px-6 sm:px-8">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Abonnement</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bekijk je huidige plan en upgrade wanneer je portefeuille groeit.</p>
          </div>

          {/* Huidig plan */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Huidig plan</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="flex items-center gap-4 py-4 px-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Starter</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tot 3 woningen · Tot 10 huurders · 500 MB opslag</p>
                <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Gratis</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#9FE870]/20 dark:bg-[#9FE870]/10 px-2.5 py-0.5 text-xs font-semibold text-[#163300] dark:text-[#9FE870] shrink-0">
                Huidig
              </span>
            </div>
          </div>

          {/* Plannen */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Plannen</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div>

              {/* Starter — huidig */}
              <div className="flex items-center gap-4 py-4 px-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Starter</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tot 3 woningen, WWS-calculator, basisrapportages</p>
                  <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">Gratis</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0" />
              </div>

              {/* Pro */}
              <div className="flex items-center gap-4 py-4 px-3 opacity-50">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Pro</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tot 25 woningen, bankkoppeling, VvE-beheer</p>
                  <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">€ 29 / maand</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Binnenkort</span>
              </div>

              {/* Vastgoedbeheer */}
              <div className="flex items-center gap-4 py-4 px-3 opacity-50">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Vastgoedbeheer</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Onbeperkt woningen, meerdere gebruikers, API-toegang</p>
                  <p className="text-xs font-semibold text-[#163300] dark:text-[#9FE870] mt-0.5">€ 79 / maand</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Binnenkort</span>
              </div>

            </div>
          </div>

          {/* Facturen */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Facturen</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="flex items-center gap-4 py-4 px-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Factuurhistorie</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Geen facturen beschikbaar op het gratis plan</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
            </div>
          </div>

        </div>
      )}

      {/* Koppelingen tab */}
      {activeTab === 'koppelingen' && (
        <div className="space-y-8 px-6 sm:px-8">

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Koppelingen</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Verbind je bankrekening, boekhoudsoftware en advertentieplatformen.</p>
          </div>

          {/* Bankieren */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Bankieren</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="">
              {bankLoading ? (
                <div className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-neutral-700 animate-pulse" />
                    <div className="h-3 w-48 rounded bg-gray-100 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>
              ) : bankConnection ? (
                <div className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Landmark className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bankkoppeling</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {bankConnection.iban ? `IBAN: ${bankConnection.iban}` : 'Verbonden'}
                      {bankConnection.last_synced_at ? ` · ${formatBankDate(bankConnection.last_synced_at)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center rounded-full bg-[#9FE870]/20 dark:bg-[#9FE870]/10 px-2.5 py-0.5 text-xs font-medium text-[#163300] dark:text-[#9FE870]">Verbonden</span>
                    <button onClick={handleBankSync} disabled={bankSyncing} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50">
                      <RefreshCw className={cn('h-3.5 w-3.5', bankSyncing && 'animate-spin')} />{bankSyncing ? 'Sync...' : 'Sync'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={handleBankConnect} className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Landmark className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Bankkoppeling</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Koppel je bankrekening via Tink Open Banking</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Boekhouding & platformen */}
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-3">Boekhouding & platformen</p>
            <div className="border-b border-gray-100 dark:border-neutral-800" />
            <div className="">
              {[
                { icon: BookOpen, name: 'Boekhoudkoppeling', desc: 'Exact, Twinfield of Moneybird koppelen' },
                { icon: Globe, name: 'Funda', desc: 'Woningaanbod publiceren' },
                { icon: Globe, name: 'Pararius', desc: 'Huurwoningen adverteren' },
                { icon: Globe, name: 'Kamernet', desc: 'Kamerverhuur publiceren' },
              ].map(({ icon: Icon, name, desc }) => (
                <div key={name} className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">{name}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 truncate">{desc}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                    Binnenkort
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </>
  )
}
