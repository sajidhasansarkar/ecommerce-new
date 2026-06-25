import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Shield, RefreshCw, Star, ArrowRight, Quote } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'

/* ── tiny hook: fires once when element enters viewport ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ── animated counter ── */
function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal(0.3)
  useEffect(() => {
    if (!visible) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(prog * to))
      if (prog < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, to, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

export default function About() {
  const { t, lang } = useLanguage()

  const [heroRef, heroVisible] = useReveal(0.1)
  const [storyRef, storyVisible] = useReveal(0.15)
  const [valuesRef, valuesVisible] = useReveal(0.1)
  const [statsRef, statsVisible] = useReveal(0.2)
  const [quoteRef, quoteVisible] = useReveal(0.2)
  const [ctaRef, ctaVisible] = useReveal(0.2)

  const values = [
    { icon: Shield, titleKey: 'v1Title', descKey: 'v1Desc', color: '#4a7c59' },
    { icon: Heart,  titleKey: 'v2Title', descKey: 'v2Desc', color: '#C75D3C' },
    { icon: RefreshCw, titleKey: 'v3Title', descKey: 'v3Desc', color: '#B8935F' },
  ]

  const stats = [
    { num: 1200, suffix: '+', key: 'statsOrders' },
    { num: 80,   suffix: '+', key: 'statsProducts' },
    { num: 3,    suffix: '',  key: 'statsYears' },
    { num: 98,   suffix: '%', key: 'statsReturn' },
  ]

  const team = [
    { name: 'Tanvir Ahmed', role: lang === 'bn' ? 'প্রতিষ্ঠাতা ও CEO' : 'Founder & CEO', emoji: '👨‍💼', bg: '#f5e6d3' },
    { name: 'Nusrat Jahan', role: lang === 'bn' ? 'ডিজাইন প্রধান' : 'Head of Design', emoji: '👩‍🎨', bg: '#e8f0e8' },
    { name: 'Rakib Hasan',  role: lang === 'bn' ? 'কাস্টমার কেয়ার' : 'Customer Care', emoji: '🤝', bg: '#e8e4f0' },
  ]

  return (
    <>
      <style>{`
        .about-hero-bg {
          background: linear-gradient(135deg, #faf7f2 0%, #f2ede4 40%, #ede5d8 100%);
          position: relative;
          overflow: hidden;
        }
        .about-hero-bg::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(199,93,60,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .about-hero-bg::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: -5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(184,147,95,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        /* floating blobs */
        .blob1 {
          position: absolute;
          width: 320px; height: 320px;
          border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%;
          background: rgba(199,93,60,0.07);
          top: 10%; right: 5%;
          animation: morphBlob 8s ease-in-out infinite;
        }
        .blob2 {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 45% 55% 40% 60% / 60% 40% 60% 40%;
          background: rgba(184,147,95,0.08);
          bottom: 15%; left: 8%;
          animation: morphBlob 11s ease-in-out infinite reverse;
        }
        @keyframes morphBlob {
          0%,100% { border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%; transform: rotate(0deg) scale(1); }
          33%      { border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%; transform: rotate(4deg) scale(1.04); }
          66%      { border-radius: 40% 60% 55% 45% / 45% 55% 60% 40%; transform: rotate(-3deg) scale(0.97); }
        }

        /* reveal animations */
        .rv { transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1); opacity: 0; }
        .rv.up  { transform: translateY(32px); }
        .rv.left { transform: translateX(-28px); }
        .rv.right { transform: translateX(28px); }
        .rv.scale { transform: scale(0.92); }
        .rv.show { opacity: 1; transform: none; }

        /* value card */
        .val-card {
          background: #fff;
          border: 1px solid rgba(212,203,184,0.5);
          border-radius: 20px;
          padding: 2rem;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .val-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.09);
        }
        .val-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }

        /* stat card */
        .stat-card {
          text-align: center;
          padding: 1.5rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212,203,184,0.4);
          transition: transform 0.25s ease;
        }
        .stat-card:hover { transform: scale(1.04); }
        .stat-num {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.8rem;
          line-height: 1;
          color: #C75D3C;
          font-weight: 700;
        }

        /* quote block */
        .quote-section {
          background: #1A1815;
          color: #FAF7F2;
          position: relative;
          overflow: hidden;
        }
        .quote-section::before {
          content: '"';
          position: absolute;
          top: -0.3em;
          left: 0.1em;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18rem;
          color: rgba(199,93,60,0.08);
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }

        /* team card */
        .team-card {
          border-radius: 20px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .team-card:hover { transform: translateY(-6px) rotate(1deg); }
        .team-emoji {
          font-size: 3.5rem;
          width: 80px; height: 80px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          font-style: normal;
        }

        /* story line ornament */
        .story-line {
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, #C75D3C, #B8935F);
          border-radius: 3px;
          transition: height 1.2s cubic-bezier(0.22,1,0.36,1);
        }
        .story-line.show { height: 100%; }

        /* CTA */
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #C75D3C;
          color: #FAF7F2;
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
        }
        .cta-btn:hover { transform: scale(1.06); background: #b5502f; }
        .cta-btn svg { transition: transform 0.2s ease; }
        .cta-btn:hover svg { transform: translateX(4px); }

        @media (prefers-reduced-motion: reduce) {
          .rv { transition: opacity 0.3s; }
          .blob1, .blob2 { animation: none; }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="about-hero-bg min-h-[70vh] flex items-center relative">
        <div className="blob1" />
        <div className="blob2" />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10" ref={heroRef}>
          <p className={`rv up ${heroVisible ? 'show' : ''} text-clay font-medium text-sm tracking-widest uppercase mb-4`}
            style={{ transitionDelay: '0ms' }}>
            {lang === 'bn' ? 'আমাদের গল্প' : 'Our Story'}
          </p>
          <h1 className={`rv up ${heroVisible ? 'show' : ''} font-display text-5xl sm:text-6xl lg:text-7xl text-ink leading-tight mb-6`}
            style={{ transitionDelay: '80ms' }}>
            {lang === 'bn'
              ? <>ভালোবাসা থেকে<br /><span className="text-clay">শুরু,</span> মান নিয়ে চলা</>
              : <>Born from love,<br />built on <span className="text-clay">quality</span></>
            }
          </h1>
          <p className={`rv up ${heroVisible ? 'show' : ''} text-ink/60 text-lg max-w-xl mx-auto`}
            style={{ transitionDelay: '160ms' }}>
            {lang === 'bn'
              ? 'ঢাকার হৃদয় থেকে — প্রতিটি পণ্যে একটু যত্ন, একটু ভালোবাসা।'
              : 'From the heart of Dhaka — a little care, a little love in every product.'}
          </p>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: visual */}
          <div ref={storyRef} className="relative">
            <div className={`rv left ${storyVisible ? 'show' : ''}`}>
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone to-stone-dark aspect-[4/5] max-w-md">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                  <span className="text-8xl">👟</span>
                  <span className="text-6xl">👜</span>
                  <p className="font-display text-2xl text-ink text-center">
                    {lang === 'bn' ? '"প্রতিটি কদম,<br/>প্রতিটি মুহূর্ত"' : '"Every step,<br/>every moment"'}
                  </p>
                </div>
                {/* decorative corner */}
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-clay/15" />
                <div className="absolute bottom-8 left-4 w-10 h-10 rounded-full bg-amber-200/40" />
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-sand border border-stone-dark rounded-2xl shadow-lg px-5 py-4 text-center">
                <p className="font-display text-3xl text-clay font-bold">2021</p>
                <p className="text-xs text-ink/50 mt-0.5">{lang === 'bn' ? 'প্রতিষ্ঠিত' : 'Founded'}</p>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div className="flex gap-6">
            {/* timeline line */}
            <div className="shrink-0 flex flex-col items-center pt-2">
              <div className="w-3 h-3 rounded-full bg-clay mt-1 shrink-0" />
              <div className={`story-line mt-2 ${storyVisible ? 'show' : ''}`} style={{ minHeight: '80%' }} />
            </div>
            <div>
              <p className={`rv right ${storyVisible ? 'show' : ''} text-clay text-xs font-semibold tracking-widest uppercase mb-3`}
                style={{ transitionDelay: '100ms' }}>
                {lang === 'bn' ? 'আমাদের শুরু' : 'How It Started'}
              </p>
              <h2 className={`rv right ${storyVisible ? 'show' : ''} font-display text-3xl lg:text-4xl text-ink mb-6`}
                style={{ transitionDelay: '180ms' }}>
                {lang === 'bn' ? 'লাবণ্যর শুরুর কথা' : 'How Labanya Began'}
              </h2>
              <p className={`rv right ${storyVisible ? 'show' : ''} text-ink/65 leading-relaxed mb-5`}
                style={{ transitionDelay: '240ms' }}>
                {lang === 'bn'
                  ? 'লাবণ্যর জন্ম ঢাকার একটি ছোট ঘরে, ২০২১ সালে। প্রতিষ্ঠাতা তানভীর আহমেদ বিশ্বাস করতেন — প্রতিটি মানুষ একটু বিলাসিতার যোগ্য, দামে নয়, মানে।'
                  : 'Labanya was born in a small room in Dhaka in 2021. Founder Tanvir Ahmed believed that every person deserves a touch of luxury — not in price, but in quality.'}
              </p>
              <p className={`rv right ${storyVisible ? 'show' : ''} text-ink/65 leading-relaxed`}
                style={{ transitionDelay: '300ms' }}>
                {lang === 'bn'
                  ? 'আজ আমরা শত শত পরিবারের কাছে পৌঁছেছি। প্রতিটি জুতা, প্রতিটি ব্যাগ — যত্নে, ভালোবাসায় বাছাই করা।'
                  : 'Today we reach hundreds of families. Every shoe, every bag — carefully chosen with care and love.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="bg-stone/30 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div ref={valuesRef} className="text-center mb-14">
            <p className={`rv up ${valuesVisible ? 'show' : ''} text-clay text-xs font-semibold tracking-widest uppercase mb-3`}>
              {lang === 'bn' ? 'আমরা যা বিশ্বাস করি' : 'What We Believe In'}
            </p>
            <h2 className={`rv up ${valuesVisible ? 'show' : ''} font-display text-3xl lg:text-4xl text-ink`}
              style={{ transitionDelay: '80ms' }}>
              {lang === 'bn' ? 'আমাদের মূল্যবোধ' : 'Our Values'}
            </h2>
          </div>
          <div ref={valuesRef} className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i}
                className={`rv up ${valuesVisible ? 'show' : ''} val-card`}
                style={{ transitionDelay: `${120 + i * 100}ms` }}>
                <div className="val-icon-wrap" style={{ background: v.color + '18' }}>
                  <v.icon size={22} style={{ color: v.color }} />
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{t(`about.${v.titleKey}`)}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{t(`about.${v.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-24 bg-gradient-to-br from-sand via-stone/20 to-sand">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i}
                className={`rv scale ${statsVisible ? 'show' : ''} stat-card`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="stat-num">
                  <Counter to={s.num} suffix={s.suffix} />
                </p>
                <p className="text-ink/50 text-xs mt-2 leading-snug">{t(`about.${s.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUOTE ─── */}
      <section className="quote-section py-24">
        <div ref={quoteRef} className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className={`rv scale ${quoteVisible ? 'show' : ''}`}>
            <Quote size={36} className="text-clay mx-auto mb-6 opacity-80" />
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl text-sand/90 leading-relaxed mb-8">
              {lang === 'bn'
                ? '"আমরা বিশ্বাস করি ভালো জুতা আর একটা পারফেক্ট ব্যাগ আপনার দিনটাই বদলে দিতে পারে।"'
                : '"We believe the right shoes and the perfect bag can change your entire day."'}
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-clay/60" />
              <p className="text-sand/50 text-sm">
                {lang === 'bn' ? 'তানভীর আহমেদ, প্রতিষ্ঠাতা' : 'Tanvir Ahmed, Founder'}
              </p>
              <div className="w-8 h-px bg-clay/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl text-ink">
              {t('about.teamTitle')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((m, i) => (
              <div key={i} className="team-card" style={{ background: m.bg }}>
                <div className="team-emoji" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  {m.emoji}
                </div>
                <h3 className="font-display text-xl text-ink mb-1">{m.name}</h3>
                <p className="text-ink/50 text-sm">{m.role}</p>
                <div className="flex justify-center gap-1 mt-3">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={12} fill="#C75D3C" className="text-clay" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-stone/20">
        <div ref={ctaRef} className={`rv up ${ctaVisible ? 'show' : ''} max-w-2xl mx-auto px-6 text-center`}>
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-ink/55 mb-8">
            {lang === 'bn'
              ? 'আমাদের নতুন কালেকশন আপনার জন্য অপেক্ষা করছে।'
              : 'Our latest collection is waiting for you.'}
          </p>
          <Link to="/shop" className="cta-btn">
            {t('about.ctaBtn')} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
