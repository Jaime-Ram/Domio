'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  User, Shield, CreditCard, Settings,
  CheckCircle2, Pencil, X, Check, Loader2, Mail, Building2,
  Landmark, BookOpen, RefreshCw, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProfile, updateProfile } from '@/lib/supabase/profile'
import { resetPassword, enrollMfa, challengeMfa, verifyMfa, verifyMfaCode, unenrollMfa, listMfaFactors, updateEmail } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

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
        <div className="mt-4 space-y-3">
          {/* Persoonlijke gegevens */}
          <div className={cn(sCard, 'overflow-hidden')}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#163300] dark:text-[#9FE870]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Persoonlijke gegevens</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Je naam en contactgegevens voor huurders en noodgevallen</p>
                </div>
              </div>
              {editingField !== 'personal' && (
                <button
                  onClick={() => { setEditingField('personal'); setFieldError('') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:bg-[#163300]/5 dark:hover:bg-[#9FE870]/10 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Wijzigen
                </button>
              )}
            </div>
            {editingField === 'personal' ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Naam</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Je volledige naam"
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telefoonnummer</label>
                  <input
                    type="tel"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+31 6 12345678"
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Belangrijk voor onderhoudsnoodgevallen en contact met huurders</p>
                </div>
                {fieldError && editingField === 'personal' && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldError}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSavePersonal}
                    disabled={savingField === 'personal'}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#163300] hover:bg-[#163300]/90 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingField === 'personal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Opslaan
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Naam:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.name || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Telefoonnummer:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.phone || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Inloggegevens */}
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Inloggegevens</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Je e-mailadres waarmee je inlogt in Domio</p>
                </div>
              </div>
              {editingField !== 'login' && (
                <button
                  onClick={() => { setEditingField('login'); setFieldError(''); setNewEmail(''); setEmailChangeStatus('idle') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:bg-[#163300]/5 dark:hover:bg-[#9FE870]/10 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Wijzigen
                </button>
              )}
            </div>
            {editingField === 'login' ? (
              <div className="space-y-3">
                {emailChangeStatus === 'sent' ? (
                  <div className="max-w-md p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Bevestigingsmail verstuurd</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          We hebben een bevestigingslink gestuurd naar <span className="font-medium">{newEmail}</span>. Klik op de link om je inlog-e-mailadres te wijzigen.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={cancelEditing}
                      className="mt-3 text-sm font-medium text-green-700 dark:text-green-300 hover:underline"
                    >
                      Sluiten
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="max-w-md">
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Huidig inlog-e-mailadres</label>
                      <p className="text-gray-900 dark:text-white font-medium">{user?.email || '—'}</p>
                    </div>
                    <div className="max-w-md">
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Nieuw inlog-e-mailadres</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="nieuw@voorbeeld.nl"
                        className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                        autoFocus
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                      We sturen een bevestigingslink naar je nieuwe e-mailadres. Je moet op deze link klikken voordat de wijziging wordt doorgevoerd.
                    </p>
                    {fieldError && editingField === 'login' && (
                      <p className="text-sm text-red-600 dark:text-red-400">{fieldError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendEmailVerification}
                        disabled={savingField === 'login' || !newEmail.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#163300] hover:bg-[#163300]/90 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {savingField === 'login' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Bevestigingsmail versturen
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Annuleren
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">E-mailadres:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{user?.email || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bedrijfsgegevens */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Bedrijfsgegevens</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voor facturen, huurovereenkomsten en officiële correspondentie</p>
                </div>
              </div>
              {editingField !== 'company' && (
                <button
                  onClick={() => { setEditingField('company'); setFieldError('') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#163300] dark:text-[#9FE870] hover:bg-[#163300]/5 dark:hover:bg-[#9FE870]/10 rounded-lg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Wijzigen
                </button>
              )}
            </div>
            {editingField === 'company' ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bedrijfsnaam</label>
                  <input
                    type="text"
                    value={accountForm.company_name}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Mijn Vastgoed B.V."
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">KvK-nummer</label>
                    <input
                      type="text"
                      value={accountForm.kvk_number}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, kvk_number: e.target.value }))}
                      placeholder="12345678"
                      className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">BTW-nummer</label>
                    <input
                      type="text"
                      value={accountForm.btw_number}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, btw_number: e.target.value }))}
                      placeholder="NL123456789B01"
                      className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Zakelijk e-mailadres</label>
                  <input
                    type="email"
                    value={accountForm.company_email}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, company_email: e.target.value }))}
                    placeholder="info@mijnvastgoed.nl"
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Verschijnt op facturen en contracten. Wordt niet gebruikt voor contact vanuit Domio.</p>
                </div>

                {/* Correspondentieadres */}
                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Correspondentieadres</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Straat en huisnummer</label>
                      <input
                        type="text"
                        value={accountForm.company_address}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, company_address: e.target.value }))}
                        placeholder="Voorbeeldstraat 123"
                        className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Postcode</label>
                        <input
                          type="text"
                          value={accountForm.company_postal_code}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, company_postal_code: e.target.value }))}
                          placeholder="1234 AB"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1.5">Plaats</label>
                        <input
                          type="text"
                          value={accountForm.company_city}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, company_city: e.target.value }))}
                          placeholder="Amsterdam"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#163300]/30 dark:focus:ring-[#9FE870]/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {fieldError && editingField === 'company' && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldError}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveCompany}
                    disabled={savingField === 'company'}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#163300] hover:bg-[#163300]/90 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingField === 'company' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Opslaan
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Bedrijfsnaam:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.company_name || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">KvK-nummer:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.kvk_number || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">BTW-nummer:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.btw_number || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Zakelijk e-mail:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{accountForm.company_email || '—'}</span>
                </div>
                <div className="flex items-start gap-2 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-32">Adres:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {(accountForm.company_address || accountForm.company_postal_code || accountForm.company_city) ? (
                      <>
                        {accountForm.company_address && <span>{accountForm.company_address}<br /></span>}
                        {[accountForm.company_postal_code, accountForm.company_city].filter(Boolean).join(' ') || null}
                      </>
                    ) : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Taalvoorkeur */}
          <div className="border-t border-gray-100 dark:border-neutral-800 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Taalvoorkeur</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kies de taal van de interface</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['nl', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={async () => { setLanguage(lang); await handleSavePrefs(lang) }}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium border transition-colors',
                    language === lang
                      ? 'bg-[#9FE870] text-[#163300] border-[#9FE870]'
                      : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-[#163300]/30'
                  )}
                >
                  {lang === 'nl' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
                </button>
              ))}
              {prefsSaving && <span className="flex items-center gap-1 text-xs text-gray-400 ml-2"><Loader2 className="h-3 w-3 animate-spin" />Opslaan…</span>}
              {prefsSaved && <span className="flex items-center gap-1 text-xs text-[#163300] dark:text-[#9FE870] ml-2"><Check className="h-3 w-3" />Opgeslagen</span>}
            </div>
          </div>

          {/* Notificatievoorkeuren */}
          <div className="border-t border-gray-100 dark:border-neutral-800 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-[#163300]/5 dark:bg-[#9FE870]/10 flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4 text-[#163300] dark:text-[#9FE870]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notificaties</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kies hoe en waarover je meldingen ontvangt</p>
              </div>
            </div>
            <div className="space-y-4">
              {/* Kanalen */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Kanalen</p>
                {[
                  { key: 'email' as const, label: 'E-mail notificaties', sub: 'Ontvang meldingen via e-mail' },
                  { key: 'in_app' as const, label: 'In-app meldingen', sub: 'Meldingen binnen het dashboard' },
                ].map(({ key, label, sub }) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-neutral-800 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs[key]}
                      onChange={async (e) => {
                        const next = { ...notifPrefs, [key]: e.target.checked }
                        setNotifPrefs(next)
                        await handleSavePrefs(undefined, next)
                      }}
                      className="h-4 w-4 rounded accent-[#163300]"
                    />
                  </label>
                ))}
              </div>
              {/* Categorieën */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Categorieën</p>
                {[
                  { key: 'new_payment' as const, label: 'Nieuwe betaling ontvangen' },
                  { key: 'payment_overdue' as const, label: 'Betaling te laat' },
                  { key: 'maintenance_request' as const, label: 'Nieuw onderhoudsverzoek' },
                  { key: 'document_expiring' as const, label: 'Document verloopt binnenkort' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-neutral-800 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <p className="text-sm text-gray-700 dark:text-gray-200">{label}</p>
                    <input
                      type="checkbox"
                      checked={notifPrefs[key]}
                      onChange={async (e) => {
                        const next = { ...notifPrefs, [key]: e.target.checked }
                        setNotifPrefs(next)
                        await handleSavePrefs(undefined, next)
                      }}
                      className="h-4 w-4 rounded accent-[#163300]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Gevarenzone — account verwijderen */}
          <div className="border-t border-red-100 dark:border-red-900/30 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Gevarenzone</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Onomkeerbare acties voor je account</p>
              </div>
            </div>
            {!deleteOpen ? (
              <button
                onClick={() => { setDeleteOpen(true); setDeleteConfirmEmail(''); setDeleteError('') }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Account verwijderen (AVG)
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-4 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Dit verwijdert <strong>permanent</strong> je account en alle bijbehorende data. Dit is niet terugdraaien.
                  Bevestig door je e-mailadres in te typen: <span className="font-mono font-medium">{user?.email ?? ''}</span>
                </p>
                <input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder={user?.email ?? 'jouw@email.nl'}
                  className="w-full rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
                {deleteError && <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteWorking || deleteConfirmEmail.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                  >
                    {deleteWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Definitief verwijderen
                  </button>
                  <button
                    onClick={() => setDeleteOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demo mode notice */}
          {isDemo && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Dit is een demo-omgeving. Wijzigingen worden niet opgeslagen.
              </p>
            </div>
          )}
        </div>
      )}

      {accountDataReady && activeTab === 'beveiliging' && (
        <div className={cn(sCard, 'mt-6 p-6 space-y-8')}>
          {/* Wachtwoord wijzigen */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wachtwoord wijzigen</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              We sturen een resetlink naar <span className="font-medium text-gray-700 dark:text-gray-300">{displayEmail || 'je e-mailadres'}</span>.
            </p>
            {!isDemo ? (
              <div>
                <button
                  onClick={handleSendPasswordReset}
                  disabled={pwResetCooldown > 0}
                  className="relative overflow-hidden px-4 py-2 text-sm font-medium text-white rounded-lg disabled:cursor-not-allowed"
                  style={{ background: pwResetCooldown > 0 ? '#d1d5db' : '#163300' }}
                >
                  <span
                    className="absolute inset-0 origin-left"
                    style={{
                      background: '#163300',
                      transform: `scaleX(${pwResetAnimating ? 1 : 0})`,
                      transition: pwResetAnimating ? 'transform 20s linear' : 'none',
                    }}
                  />
                  <span className="relative">
                    {pwResetStatus === 'error'
                      ? (pwResetError || 'Fout')
                      : pwResetCooldown > 0
                      ? `Verstuurd (${pwResetCooldown}s)`
                      : 'Resetlink versturen'}
                  </span>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Beschikbaar in de echte omgeving.</p>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-neutral-800" />

          {/* Twee-stapsverificatie */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Twee-stapsverificatie</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kies hoe je een tweede verificatiestap wil gebruiken bij het inloggen.</p>

            {isDemo ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Schakel 2FA in via je account in de echte omgeving.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">

                {/* Card: Geen 2FA */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod('none')}
                  disabled={mfaMethod === 'none' || mfaMethodStatus === 'saving'}
                  className={cn(
                    'relative text-left rounded-xl border-2 px-5 py-4 transition-all',
                    mfaMethod === 'none'
                      ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300]/5 dark:bg-[#9FE870]/5 cursor-default'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {mfaMethod === 'none' && (
                      <CheckCircle2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-sm text-gray-900 dark:text-white">Geen verificatie</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Inloggen alleen met e-mailadres en wachtwoord.
                  </p>
                </button>

                {/* Card: Authenticator app */}
                <div
                  className={cn(
                    'relative text-left rounded-xl border-2 px-5 py-4 transition-all',
                    mfaMethod === 'totp' || totpEnrolling
                      ? 'border-[#163300] dark:border-[#9FE870] bg-[#163300]/5 dark:bg-[#9FE870]/5'
                      : 'border-gray-200 dark:border-neutral-700 cursor-pointer hover:border-gray-300 dark:hover:border-neutral-600'
                  )}
                  onClick={() => { if (!totpEnrolling && mfaMethod !== 'totp') handleSelectMethod('totp') }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {mfaMethod === 'totp' && (
                      <CheckCircle2 className="h-5 w-5 text-[#163300] dark:text-[#9FE870] shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-sm text-gray-900 dark:text-white">Authenticator-app</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Genereer een code via Google Authenticator, 1Password of een vergelijkbare app.
                  </p>

                  {/* Enrolled factors */}
                  {totpFactors.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {totpFactors.map((f) => (
                        <div key={f.id}>
                          <div className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{f.friendly_name?.split(' ')?.[0] || 'Authenticator'}</span>
                            </div>
                            {unenrollFactorId === f.id ? (
                              <button onClick={(e) => { e.stopPropagation(); setUnenrollFactorId(''); setUnenrollCode(''); setUnenrollError('') }} className="text-xs font-medium text-gray-500 hover:underline">
                                Annuleren
                              </button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); setUnenrollFactorId(f.id); setUnenrollCode(''); setUnenrollError('') }} className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                                Verwijderen
                              </button>
                            )}
                          </div>
                          {unenrollFactorId === f.id && (
                            <div onClick={(e) => e.stopPropagation()} className="mt-2 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-3 py-3 space-y-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Voer een code uit je authenticator-app in om te bevestigen.</p>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={unenrollCode}
                                onChange={(e) => setUnenrollCode(e.target.value.replace(/\D/g, ''))}
                                className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-red-300"
                              />
                              {unenrollError && <p className="text-xs text-red-600 dark:text-red-400">{unenrollError}</p>}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUnenrollTotp() }}
                                disabled={unenrollCode.length !== 6 || unenrollVerifying}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {unenrollVerifying ? 'Verwijderen…' : 'Bevestig verwijderen'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enroll / Reset buttons */}
                  {!totpEnrolling && !unenrollFactorId && !totpResetting && (
                    <div className="mt-4 flex items-center gap-4">
                      {totpFactors.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setTotpResetting(true); setTotpResetCode(''); setTotpResetError('') }}
                          className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reset flow */}
                  {totpResetting && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-4 rounded-lg border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 px-3 py-3 space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Voer een code uit je authenticator-app in om alle gekoppelde apps te verwijderen.</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={totpResetCode}
                        onChange={(e) => setTotpResetCode(e.target.value.replace(/\D/g, ''))}
                        className="w-32 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      {totpResetError && <p className="text-xs text-red-600 dark:text-red-400">{totpResetError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResetTotp() }}
                          disabled={totpResetCode.length !== 6 || totpResetWorking}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {totpResetWorking ? 'Resetten…' : 'Alles verwijderen'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTotpResetting(false); setTotpResetCode(''); setTotpResetError('') }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          Annuleren
                        </button>
                      </div>
                    </div>
                  )}

                  {totpError && !totpEnrolling && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">{totpError}</p>
                  )}

                  {/* Enrollment flow */}
                  {totpEnrolling && totpQr && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Scan de QR-code met je authenticator-app, of voer de sleutel handmatig in.</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={totpQr} alt="TOTP QR code" className="h-40 w-40 rounded-lg border border-gray-200 dark:border-neutral-700" />
                      <div className="rounded-lg bg-white/60 dark:bg-neutral-800 px-3 py-2 max-w-xs">
                        <p className="text-xs text-gray-400 mb-0.5">Handmatige sleutel</p>
                        <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{totpSecret}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Voer de 6-cijferige code in</p>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-36 rounded-lg border border-input bg-background px-3 py-2 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#163300]/30"
                        />
                      </div>
                      {totpError && <p className="text-sm text-red-600 dark:text-red-400">{totpError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={handleVerifyTotp}
                          disabled={totpVerifying || totpCode.length !== 6}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#163300] hover:bg-[#356258] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {totpVerifying ? 'Verifiëren…' : 'Bevestigen'}
                        </button>
                        <button
                          onClick={async () => {
                            if (totpFactorId) await unenrollMfa(totpFactorId)
                            setTotpEnrolling(false); setTotpQr(''); setTotpSecret(''); setTotpCode(''); setTotpError(''); setTotpFactorId('')
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          Annuleren
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* Koppelingen tab */}
      {activeTab === 'koppelingen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank connection card */}
          <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-6 flex flex-col items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bankkoppeling (Tink)</h3>
              {bankLoading ? (
                <p className="text-sm text-gray-400">Laden...</p>
              ) : bankConnection ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Verbonden</span>
                  </div>
                  {bankConnection.iban && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">IBAN: {bankConnection.iban}</p>
                  )}
                  {bankConnection.last_synced_at && (
                    <p className="text-xs text-gray-400">Laatst gesynchroniseerd: {formatBankDate(bankConnection.last_synced_at)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Koppel je bankrekening om transacties automatisch te importeren.
                </p>
              )}
            </div>
            {bankConnection ? (
              <button
                onClick={handleBankSync}
                disabled={bankSyncing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#163300] dark:bg-[#9FE870] px-3.5 py-2 text-sm font-medium text-white dark:text-[#163300] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <RefreshCw className={cn('h-4 w-4', bankSyncing && 'animate-spin')} />
                {bankSyncing ? 'Synchroniseren...' : 'Synchroniseren'}
              </button>
            ) : (
              <button
                onClick={handleBankConnect}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#163300] dark:bg-[#9FE870] px-3.5 py-2 text-sm font-medium text-white dark:text-[#163300] hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
                Koppel je bankrekening
              </button>
            )}
          </div>

          {/* Boekhoudkoppeling placeholder */}
          <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-6 flex flex-col items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Boekhoudkoppeling</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Koppel Domio met je boekhoudsoftware (Exact, Twinfield, Moneybird).
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              Binnenkort beschikbaar
            </span>
          </div>
        </div>
      )}
    </>
  )
}
