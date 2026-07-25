'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDashboardUser } from '@/providers/dashboard-user-provider'
import {
  User, Shield, Bell, Globe, Trash2, CheckCircle2,
  Loader2, Mail, Check, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProfile, updateProfile, type NotificationPrefs, getDefaultNotificationPrefs } from '@/lib/supabase/profile'
import { resetPassword, enrollMfa, verifyMfa, unenrollMfa, listMfaFactors, updateEmail, deleteAccount } from '@/lib/supabase/auth'
import { DeleteAccountDialog } from '@/components/dashboard/delete-account-dialog'
import { ActionListRow, ActionListSection } from '@/components/ui/action-list'

type SettingsTab = 'account' | 'beveiliging'

type AccountFormData = {
  name: string
  email: string
  phone: string
}

export default function TenantSettingsPage() {
  const { user, profile: dashProfile, loading: userCtxLoading, refetch } = useDashboardUser()

  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [accountForm, setAccountForm] = useState<AccountFormData>({ name: '', email: '', phone: '' })
  const [originalForm, setOriginalForm] = useState<AccountFormData | null>(null)
  const [dataReady, setDataReady] = useState(false)

  // Account section expand
  const [accSection, setAccSection] = useState<'personal' | 'login' | null>(null)
  const [savingField, setSavingField] = useState<'personal' | 'login' | null>(null)
  const [fieldError, setFieldError] = useState('')
  const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'sent'>('idle')
  const [newEmail, setNewEmail] = useState('')

  // Preferences
  const [language, setLanguage] = useState<'nl' | 'en'>('nl')
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(getDefaultNotificationPrefs())
  const [prefSection, setPrefSection] = useState<'taal' | 'notif' | null>(null)
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)

  // Security section expand
  const [bevSection, setBevSection] = useState<'wachtwoord' | '2fa' | null>(null)
  const [pwResetStatus, setPwResetStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwResetError, setPwResetError] = useState('')
  const [pwResetCooldown, setPwResetCooldown] = useState(0)

  // TOTP MFA
  const [mfaMethod, setMfaMethod] = useState<'none' | 'totp'>('none')
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

  // Account deletion
  const [deleteOpen, setDeleteOpen] = useState(false)

  const loadTotpFactors = useCallback(async () => {
    const { data } = await listMfaFactors()
    if (data?.totp) setTotpFactors(data.totp.map((f) => ({ id: f.id, friendly_name: f.friendly_name ?? undefined })))
  }, [])

  const loadProfile = useCallback(async () => {
    if (!user?.id) { setDataReady(true); return }
    try {
      const p = await getProfile(user.id)
      if (p) {
        const formData: AccountFormData = {
          name: p.full_name || '',
          email: p.email || '',
          phone: p.phone || '',
        }
        setAccountForm(formData)
        setOriginalForm(formData)
        setMfaMethod(p.mfa_method ?? 'none')
        setLanguage(p.language ?? 'nl')
        setNotifPrefs(p.notification_prefs ?? getDefaultNotificationPrefs())
      }
    } finally {
      setDataReady(true)
    }
  }, [user?.id])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => { loadTotpFactors() }, [loadTotpFactors])

  useEffect(() => {
    if (!userCtxLoading && !user) setDataReady(true)
  }, [userCtxLoading, user])

  const handleSavePersonal = async () => {
    if (!user?.id) return
    const name = accountForm.name.trim()
    const phone = accountForm.phone.trim()
    if (!name) { setFieldError('Naam is verplicht'); return }
    setSavingField('personal')
    setFieldError('')
    const { error } = await updateProfile(user.id, { full_name: name, phone: phone || null })
    setSavingField(null)
    if (error) { setFieldError(error.message); return }
    setOriginalForm(prev => prev ? { ...prev, name, phone } : null)
    setAccSection(null)
    refetch()
  }

  const handleSendEmailVerification = async () => {
    if (!user?.id) return
    const email = newEmail.trim().toLowerCase()
    if (!email) { setFieldError('E-mailadres is verplicht'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('Ongeldig e-mailadres'); return }
    if (email === user?.email?.toLowerCase()) { setFieldError('Dit is al je huidige e-mailadres'); return }
    setSavingField('login')
    setFieldError('')
    const { error } = await updateEmail(email)
    setSavingField(null)
    if (error) { setFieldError(error.message); return }
    setEmailChangeStatus('sent')
  }

  const handleSavePrefs = async (newLang?: 'nl' | 'en', newPrefs?: NotificationPrefs) => {
    if (!user?.id) return
    setPrefsSaving(true)
    await updateProfile(user.id, { language: newLang ?? language, notification_prefs: newPrefs ?? notifPrefs })
    setPrefsSaving(false)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  const handleSendPasswordReset = async () => {
    const email = user?.email?.trim() || ''
    if (!email) { setPwResetStatus('error'); setPwResetError('Geen e-mailadres bekend'); return }
    setPwResetStatus('saving')
    const { error } = await resetPassword(email)
    if (error) { setPwResetStatus('error'); setPwResetError(error.message); return }
    setPwResetStatus('saved')
    setPwResetCooldown(20)
    const interval = setInterval(() => {
      setPwResetCooldown((c) => {
        if (c <= 1) { clearInterval(interval); setPwResetStatus('idle'); return 0 }
        return c - 1
      })
    }, 1000)
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
    if (user?.id) { await updateProfile(user.id, { mfa_method: 'totp' }); setMfaMethod('totp') }
    await loadTotpFactors()
  }

  const handleUnenrollTotp = async () => {
    if (!unenrollFactorId || unenrollCode.length !== 6) return
    setUnenrollVerifying(true); setUnenrollError('')
    const { error: verifyError } = await verifyMfa(unenrollFactorId, unenrollCode)
    if (verifyError) { setUnenrollError(verifyError.message); setUnenrollVerifying(false); return }
    const { error } = await unenrollMfa(unenrollFactorId)
    setUnenrollVerifying(false)
    if (error) { setUnenrollError(error.message); return }
    const remaining = totpFactors.filter(f => f.id !== unenrollFactorId)
    setUnenrollFactorId(''); setUnenrollCode('')
    if (remaining.length === 0 && user?.id) {
      await updateProfile(user.id, { mfa_method: 'none' }); setMfaMethod('none')
    }
    await loadTotpFactors()
  }

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount()
    if (error) throw new Error(error.message)
    window.location.href = '/login'
  }

  const rawName = accountForm.name?.trim() || dashProfile?.full_name?.trim() || ''
  const displayName = rawName || '—'
  const displayEmail = user?.email?.trim() || ''

  const initialsLetters = (() => {
    if (!rawName) return null
    const parts = rawName.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return null
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  })()

  const tabs: { key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'beveiliging', label: 'Beveiliging', icon: Shield },
  ]

  const sCard = 'rounded-card border-[0.5px] border-gray-200 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900'

  if (!dataReady) {
    return (
      <div className={cn(sCard, 'overflow-hidden')} aria-busy="true">
        <div className="h-28 sm:h-32 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="bg-white dark:bg-neutral-900 px-6 sm:px-8 pt-8 pb-6 space-y-4">
          <div className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse -mt-14" />
          <div className="h-7 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="flex gap-2">
            {[1, 2].map(i => <div key={i} className="h-9 w-28 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header card */}
      <div className={cn(sCard, 'overflow-hidden')}>
        <div
          className="h-28 sm:h-32 bg-[#161f13] bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/images/Achtergrond2.jpg')", backgroundPosition: '50% 26%' }}
        />
        <div className="bg-white dark:bg-neutral-900 px-6 sm:px-8 pt-8 pb-6">
          <div className="-mt-[4.5rem] shrink-0">
            <div className="h-20 w-20 rounded-full bg-[#f4f4f4] dark:bg-neutral-800 flex items-center justify-center text-[#161f13] dark:text-[#94f477] text-xl font-semibold">
              {initialsLetters != null ? initialsLetters : <User className="h-9 w-9 text-gray-400 dark:text-gray-500" aria-hidden />}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#161f13] dark:text-[#94f477]">{displayName}</h1>
            <div className="flex flex-wrap gap-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'inline-flex items-center gap-2 px-[1.125rem] py-2 rounded-full text-sm font-medium transition-all',
                    activeTab === key
                      ? 'bg-[#94f477] text-[#161f13] hover:bg-[#94f477]/90'
                      : 'bg-[#f4f4f4] dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-[#eaeaea] dark:hover:bg-neutral-600'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-8 px-6 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Beheer je persoonlijke gegevens en voorkeuren.</p>
          </div>

          <ActionListSection title="Gegevens">
            {/* Personal info */}
            <ActionListRow
              icon={User}
              title="Persoonlijke gegevens"
              subtitle={accountForm.name ? `${accountForm.name}${accountForm.phone ? ` · ${accountForm.phone}` : ''}` : 'Naam en telefoonnummer instellen'}
              onClick={() => { setAccSection(accSection === 'personal' ? null : 'personal'); setFieldError('') }}
              chevronRotated={accSection === 'personal'}
            >
              {accSection === 'personal' && (
                <div className="pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Naam</label>
                    <input
                      type="text"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161f13]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Telefoonnummer</label>
                    <input
                      type="tel"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161f13]/20"
                    />
                  </div>
                  {fieldError && accSection === 'personal' && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePersonal}
                      disabled={savingField === 'personal'}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#161f13] hover:bg-[#161f13]/90 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingField === 'personal' && <Loader2 className="h-4 w-4 animate-spin" />}
                      Opslaan
                    </button>
                    <button
                      onClick={() => { if (originalForm) setAccountForm(originalForm); setFieldError('') }}
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      Herstellen
                    </button>
                  </div>
                </div>
              )}
            </ActionListRow>

            {/* Email / login */}
            <ActionListRow
              icon={Mail}
              title="Inloggegevens"
              subtitle={displayEmail || 'E-mailadres instellen'}
              onClick={() => { setAccSection(accSection === 'login' ? null : 'login'); setFieldError(''); setNewEmail(''); setEmailChangeStatus('idle') }}
              chevronRotated={accSection === 'login'}
            >
              {accSection === 'login' && (
                <div className="pb-4 space-y-3">
                  {emailChangeStatus === 'sent' ? (
                    <div className="rounded-xl border border-[#94f477]/40 bg-[#94f477]/10 px-4 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#161f13] dark:text-[#94f477]" />
                        <p className="text-sm font-medium text-[#161f13] dark:text-[#94f477]">Bevestigingsmail verstuurd</p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Klik op de link in de e-mail naar <span className="font-medium">{newEmail}</span> om de wijziging te bevestigen.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Huidig e-mailadres</label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{displayEmail || '—'}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nieuw e-mailadres</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="nieuw@voorbeeld.nl"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#161f13]/20"
                        />
                      </div>
                      {fieldError && accSection === 'login' && <p className="text-xs text-red-600 dark:text-red-400">{fieldError}</p>}
                      <p className="text-xs text-gray-500 dark:text-gray-400">We sturen een bevestigingslink naar het nieuwe adres.</p>
                      <button
                        onClick={handleSendEmailVerification}
                        disabled={savingField === 'login' || !newEmail.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#161f13] hover:bg-[#161f13]/90 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {savingField === 'login' && <Loader2 className="h-4 w-4 animate-spin" />}
                        Bevestigingsmail versturen
                      </button>
                    </>
                  )}
                </div>
              )}
            </ActionListRow>
          </ActionListSection>

          {/* Voorkeuren */}
          <ActionListSection title="Voorkeuren">
            <ActionListRow
              icon={Globe}
              title="Taalvoorkeur"
              subtitle={language === 'nl' ? 'Nederlands' : 'English'}
              onClick={() => setPrefSection(prefSection === 'taal' ? null : 'taal')}
              chevronRotated={prefSection === 'taal'}
            >
              {prefSection === 'taal' && (
                <div className="pb-4 flex gap-2 flex-wrap items-center">
                  {(['nl', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={async () => { setLanguage(lang); await handleSavePrefs(lang) }}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                        language === lang
                          ? 'bg-[#94f477] text-[#161f13] border-[#94f477]'
                          : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-neutral-700 hover:border-gray-300'
                      )}
                    >
                      {lang === 'nl' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
                    </button>
                  ))}
                  {prefsSaving && <span className="flex items-center gap-1 text-xs text-gray-400"><Loader2 className="h-3 w-3 animate-spin" />Opslaan…</span>}
                  {prefsSaved && <span className="flex items-center gap-1 text-xs text-[#161f13] dark:text-[#94f477]"><Check className="h-3 w-3" />Opgeslagen</span>}
                </div>
              )}
            </ActionListRow>

            <ActionListRow
              icon={Bell}
              title="Notificaties"
              subtitle="Kies hoe en waarover je meldingen ontvangt"
              onClick={() => setPrefSection(prefSection === 'notif' ? null : 'notif')}
              chevronRotated={prefSection === 'notif'}
            >
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
                      <input
                        type="checkbox"
                        checked={notifPrefs[key]}
                        onChange={async (e) => {
                          const next = { ...notifPrefs, [key]: e.target.checked }
                          setNotifPrefs(next)
                          await handleSavePrefs(undefined, next)
                        }}
                        className="h-4 w-4 rounded accent-[#161f13]"
                      />
                    </label>
                  ))}
                </div>
              )}
            </ActionListRow>
          </ActionListSection>

          {/* Gevarenzone */}
          <ActionListSection title="Gevarenzone" danger>
            <ActionListRow
              icon={Trash2}
              title="Account verwijderen"
              subtitle="Permanent account en data verwijderen (AVG)"
              onClick={() => setDeleteOpen(true)}
              danger
            />
          </ActionListSection>

          <DeleteAccountDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDeleteAccount}
            isDemo={false}
          />
        </div>
      )}

      {/* Beveiliging tab */}
      {activeTab === 'beveiliging' && (
        <div className="space-y-8 px-6 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Beveiliging</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Beheer hoe je inlogt en hoe je account wordt beschermd.</p>
          </div>

          <ActionListSection title="Inlogbeveiliging">
            {/* Password reset */}
            <ActionListRow
              icon={Shield}
              title="Wachtwoord wijzigen"
              subtitle="Stuur een resetlink naar je e-mailadres"
              onClick={() => setBevSection(bevSection === 'wachtwoord' ? null : 'wachtwoord')}
              chevronRotated={bevSection === 'wachtwoord'}
            >
              {bevSection === 'wachtwoord' && (
                <div className="pb-4 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We sturen een resetlink naar <span className="font-medium text-gray-700 dark:text-gray-300">{displayEmail || 'je e-mailadres'}</span>.
                  </p>
                  <button
                    onClick={handleSendPasswordReset}
                    disabled={pwResetCooldown > 0}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                      pwResetCooldown > 0 ? 'bg-gray-300 dark:bg-neutral-600 cursor-not-allowed' : 'bg-[#161f13] hover:bg-[#161f13]/90'
                    )}
                  >
                    {pwResetStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {pwResetStatus === 'saved' && <CheckCircle2 className="h-4 w-4" />}
                    <span>
                      {pwResetStatus === 'error'
                        ? (pwResetError || 'Fout bij versturen')
                        : pwResetCooldown > 0
                          ? `Verstuurd — opnieuw in ${pwResetCooldown}s`
                          : 'Resetlink versturen'}
                    </span>
                  </button>
                </div>
              )}
            </ActionListRow>

            {/* 2FA */}
            <ActionListRow
              icon={Shield}
              title="Twee-stapsverificatie"
              subtitle={mfaMethod === 'totp' ? 'Ingeschakeld via authenticator-app' : 'Niet ingeschakeld'}
              onClick={() => setBevSection(bevSection === '2fa' ? null : '2fa')}
              right={
                <div className="flex items-center gap-2 shrink-0">
                  {mfaMethod === 'totp' && (
                    <span className="inline-flex items-center rounded-full bg-[#94f477]/20 dark:bg-[#94f477]/10 px-2.5 py-0.5 text-xs font-medium text-[#161f13] dark:text-[#94f477]">Aan</span>
                  )}
                  <ChevronRight className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform', bevSection === '2fa' && 'rotate-90')} />
                </div>
              }
            >
              {bevSection === '2fa' && (
                <div className="pb-4 space-y-0">
                  {/* No 2FA option */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (mfaMethod === 'none' || !user?.id) return
                      await updateProfile(user.id, { mfa_method: 'none' })
                      setMfaMethod('none')
                    }}
                    disabled={mfaMethod === 'none'}
                    className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left disabled:cursor-default"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Geen verificatie</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Alleen e-mailadres en wachtwoord</p>
                      <p className="text-xs font-semibold text-[#161f13] dark:text-[#94f477] mt-0.5">Minder veilig</p>
                    </div>
                    {mfaMethod === 'none'
                      ? <CheckCircle2 className="h-5 w-5 text-[#161f13] dark:text-[#94f477] shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
                  </button>

                  {/* Authenticator app */}
                  <div>
                    <button
                      type="button"
                      onClick={() => { if (!totpEnrolling && mfaMethod !== 'totp') handleStartTotpEnroll() }}
                      className="w-full flex items-center gap-4 py-4 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition-colors text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Authenticator-app</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Google Authenticator, 1Password of vergelijkbaar</p>
                        <p className="text-xs font-semibold text-[#161f13] dark:text-[#94f477] mt-0.5">Zeer veilig</p>
                      </div>
                      {mfaMethod === 'totp'
                        ? <CheckCircle2 className="h-5 w-5 text-[#161f13] dark:text-[#94f477] shrink-0" />
                        : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />}
                    </button>

                    {(mfaMethod === 'totp' || totpEnrolling) && (
                      <div className="px-3 pb-4 space-y-2">
                        {totpFactors.length > 0 && (
                          <div className="space-y-2">
                            {totpFactors.map((f) => (
                              <div key={f.id}>
                                <div className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#161f13] dark:text-[#94f477] shrink-0" />
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
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={6}
                                      placeholder="000000"
                                      value={unenrollCode}
                                      onChange={(e) => setUnenrollCode(e.target.value.replace(/\D/g, ''))}
                                      className="w-32 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                    {unenrollError && <p className="text-xs text-red-600 dark:text-red-400">{unenrollError}</p>}
                                    <button
                                      onClick={handleUnenrollTotp}
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
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                className="w-36 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#161f13]/20"
                              />
                            </div>
                            {totpError && <p className="text-xs text-red-600 dark:text-red-400">{totpError}</p>}
                            <div className="flex gap-2">
                              <button
                                onClick={handleVerifyTotp}
                                disabled={totpVerifying || totpCode.length !== 6}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#161f13] hover:bg-[#161f13]/90 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {totpVerifying ? 'Verifiëren…' : 'Bevestigen'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (totpFactorId) await unenrollMfa(totpFactorId)
                                  setTotpEnrolling(false); setTotpQr(''); setTotpSecret(''); setTotpCode(''); setTotpError(''); setTotpFactorId('')
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              >
                                Annuleren
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ActionListRow>
          </ActionListSection>

          <ActionListSection title="Sessies">
            <ActionListRow
              icon={Shield}
              title="Huidige sessie"
              subtitle="Webbrowser · Nu actief"
              right={
                <span className="inline-flex items-center rounded-full bg-[#94f477]/20 dark:bg-[#94f477]/10 px-2.5 py-0.5 text-xs font-medium text-[#161f13] dark:text-[#94f477] shrink-0">Actief</span>
              }
            />
          </ActionListSection>
        </div>
      )}
    </>
  )
}
