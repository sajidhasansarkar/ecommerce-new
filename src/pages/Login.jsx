import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { Phone, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID' // Replace with real client ID

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('email') // 'email' | 'phone'
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef([])
  const googleBtnRef = useRef(null)

  // Google Sign-In initialization
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          locale: 'bn',
        })
      }
    }
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  async function handleGoogleCallback(response) {
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.google(response.credential)
      login(data)
      navigate(data.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleDemo() {
    // Demo Google login - in prod, real Google button handles this
    setError('Google লগইনের জন্য GOOGLE_CLIENT_ID সেট করুন। Demo mode এ সরাসরি ইমেইল দিয়ে লগইন করুন।')
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password.trim()) { setError('ইমেইল ও পাসওয়ার্ড দিন'); return }
    if (mode === 'register' && !form.name.trim()) { setError('নাম দিন'); return }
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await api.auth.login(form.email.trim(), form.password)
        : await api.auth.register(form.name.trim(), form.email.trim(), form.password)
      login(data)
      navigate(data.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp() {
    if (!phone.trim() || phone.trim().length < 10) { setError('সঠিক ফোন নম্বর দিন'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.auth.sendOtp(phone.trim())
      setOtpSent(true)
      setCountdown(60)
      if (res.otp) setDemoOtp(res.otp) // demo only
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join('')
    if (code.length !== 6) { setError('৬ সংখ্যার OTP দিন'); return }
    setError('')
    setLoading(true)
    try {
      const data = await api.auth.verifyOtp(phone.trim(), code)
      login(data)
      navigate(data.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetPhone() {
    setOtpSent(false)
    setOtp(['', '', '', '', '', ''])
    setDemoOtp('')
    setCountdown(0)
    setError('')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 lg:py-20">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-ink mb-2">
          {mode === 'login' ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}
        </h1>
        <p className="text-ink/50 text-sm">আপনার লাবণ্য অ্যাকাউন্টে প্রবেশ করুন</p>
      </div>

      {/* Login/Register toggle (email tab only) */}
      {tab === 'email' && (
        <div className="flex bg-stone rounded-lg p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${mode === 'login' ? 'bg-sand text-ink shadow-sm' : 'text-ink/50'}`}
          >
            লগইন
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${mode === 'register' ? 'bg-sand text-ink shadow-sm' : 'text-ink/50'}`}
          >
            রেজিস্ট্রেশন
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setTab('email'); setError('') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${tab === 'email' ? 'bg-ink text-sand border-ink' : 'border-stone-dark text-ink/60 hover:border-clay hover:text-clay'}`}
        >
          <Mail size={15} /> ইমেইল
        </button>
        <button
          onClick={() => { setTab('phone'); setError('') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${tab === 'phone' ? 'bg-ink text-sand border-ink' : 'border-stone-dark text-ink/60 hover:border-clay hover:text-clay'}`}
        >
          <Phone size={15} /> ফোন OTP
        </button>
      </div>

      {/* Email/Password form */}
      {tab === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">পুরো নাম</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="আপনার নাম লিখুন"
                className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">ইমেইল</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">পাসওয়ার্ড</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
            />
          </div>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-ink text-sand py-3 rounded-lg font-medium hover:bg-clay transition-colors disabled:opacity-60"
          >
            {loading ? 'অপেক্ষা করুন...' : mode === 'login' ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন'}
          </button>
        </form>
      )}

      {/* Phone OTP form */}
      {tab === 'phone' && (
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">ফোন নম্বর</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-stone border border-stone-dark rounded-lg text-sm text-ink/60">+880</span>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="flex-1 bg-sand border border-stone-dark rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clay/40"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-clay">{error}</p>}
              <button
                onClick={handleSendOtp} disabled={loading}
                className="w-full bg-ink text-sand py-3 rounded-lg font-medium hover:bg-clay transition-colors disabled:opacity-60"
              >
                {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={resetPhone} className="text-ink/50 hover:text-clay"><ArrowLeft size={16} /></button>
                <p className="text-sm text-ink/70">
                  <span className="font-mono font-medium">{phone}</span> নম্বরে OTP পাঠানো হয়েছে
                </p>
              </div>

              {demoOtp && (
                <div className="bg-clay/10 border border-clay/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-clay shrink-0" />
                  <p className="text-sm text-clay">Demo OTP: <span className="font-mono font-bold">{demoOtp}</span></p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-3 text-center">৬ সংখ্যার OTP দিন</label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric"
                      maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-sand border-2 border-stone-dark rounded-lg focus:outline-none focus:border-clay transition-colors"
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-clay text-center">{error}</p>}

              <button
                onClick={handleVerifyOtp} disabled={loading}
                className="w-full bg-ink text-sand py-3 rounded-lg font-medium hover:bg-clay transition-colors disabled:opacity-60"
              >
                {loading ? 'যাচাই হচ্ছে...' : 'যাচাই করুন'}
              </button>

              <p className="text-center text-sm text-ink/50">
                {countdown > 0 ? (
                  <span>{countdown} সেকেন্ড পর পুনরায় পাঠান</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-clay hover:underline">পুনরায় OTP পাঠান</button>
                )}
              </p>
            </>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-stone-dark" />
        <span className="text-xs text-ink/40">অথবা</span>
        <div className="flex-1 h-px bg-stone-dark" />
      </div>

      {/* Google Sign-In */}
      <div ref={googleBtnRef} className="w-full" />
      {/* Fallback button shown when Google client ID not configured */}
      <button
        onClick={handleGoogleDemo}
        className="w-full flex items-center justify-center gap-3 border border-stone-dark rounded-lg py-2.5 text-sm font-medium text-ink hover:border-clay hover:text-clay transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Google দিয়ে লগইন করুন
      </button>

      <p className="text-center text-xs text-ink/40 mt-6">
        <Link to="/" className="hover:text-clay">← হোমে ফিরুন</Link>
      </p>
    </div>
  )
}
