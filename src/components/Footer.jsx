import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail, MapPin, Phone, ChevronRight, Heart } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/YOURNUMBER"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="whatsapp-tooltip">WhatsApp করুন</span>
      </a>

      {/* Footer */}
      <footer className="footer-wrapper">
        {/* Animated top wave */}
        <div className="footer-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* back wave — slower, lighter */}
            <path fill="#2a2520" opacity="0.5">
              <animate
                attributeName="d"
                dur="9s"
                repeatCount="indefinite"
                values="
                  M0,40 C200,70 400,10 600,40 C800,70 1000,10 1200,40 C1300,55 1380,35 1440,40 L1440,80 L0,80 Z;
                  M0,35 C180,10 380,65 580,35 C780,10 980,65 1180,35 C1310,20 1390,55 1440,35 L1440,80 L0,80 Z;
                  M0,40 C200,70 400,10 600,40 C800,70 1000,10 1200,40 C1300,55 1380,35 1440,40 L1440,80 L0,80 Z
                "
              />
            </path>
            {/* front wave — main dark fill */}
            <path fill="#1A1815">
              <animate
                attributeName="d"
                dur="6s"
                repeatCount="indefinite"
                values="
                  M0,45 C240,75 480,15 720,45 C960,75 1200,15 1440,45 L1440,80 L0,80 Z;
                  M0,38 C220,15 460,68 700,38 C940,15 1180,68 1440,38 L1440,80 L0,80 Z;
                  M0,45 C240,75 480,15 720,45 C960,75 1200,15 1440,45 L1440,80 L0,80 Z
                "
              />
            </path>
          </svg>
        </div>

        <div className="footer-body">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

              {/* Brand Column */}
              <div className="footer-col footer-brand-col">
                <div className="footer-logo-wrap">
                  <h3 className="footer-brand-name">{t('brand.name')}</h3>
                  <div className="footer-brand-line"></div>
                </div>
                <p className="footer-desc">{t('footer.desc')}</p>

                <div className="footer-contact-info">
                  <div className="footer-contact-item">
                    <MapPin size={14} className="footer-contact-icon" />
                    <span>ঢাকা, বাংলাদেশ</span>
                  </div>
                  <div className="footer-contact-item">
                    <Phone size={14} className="footer-contact-icon" />
                    <span>+880 1XXX-XXXXXX</span>
                  </div>
                  <div className="footer-contact-item">
                    <Mail size={14} className="footer-contact-icon" />
                    <span>hello@yourstore.com</span>
                  </div>
                </div>

                <div className="footer-socials">
                  <a href="#" aria-label="Instagram" className="footer-social-btn">
                    <Instagram size={16} />
                  </a>
                  <a href="#" aria-label="Facebook" className="footer-social-btn">
                    <Facebook size={16} />
                  </a>
                  <a href="#" aria-label="Email" className="footer-social-btn">
                    <Mail size={16} />
                  </a>
                </div>
              </div>

              {/* Shop Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">
                  <span>{t('footer.shop')}</span>
                  <div className="footer-title-bar"></div>
                </h4>
                <ul className="footer-links">
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <Link to="/shop" className="footer-link">{t('footer.allProducts')}</Link>
                  </li>
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <Link to="/shop?category=shoes" className="footer-link">{t('nav.shoes')}</Link>
                  </li>
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <Link to="/shop?category=bags" className="footer-link">{t('nav.bags')}</Link>
                  </li>
                </ul>
              </div>

              {/* Help Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">
                  <span>{t('footer.help')}</span>
                  <div className="footer-title-bar"></div>
                </h4>
                <ul className="footer-links">
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <a href="#" className="footer-link">{t('footer.shippingInfo')}</a>
                  </li>
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <a href="#" className="footer-link">{t('footer.returnPolicy')}</a>
                  </li>
                  <li className="footer-link-item">
                    <ChevronRight size={12} className="footer-link-arrow" />
                    <a href="#" className="footer-link">{t('footer.contact')}</a>
                  </li>
                </ul>
              </div>

              {/* Newsletter Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">
                  <span>{t('footer.newsletter')}</span>
                  <div className="footer-title-bar"></div>
                </h4>
                <p className="footer-newsletter-desc">{t('footer.newsletterDesc')}</p>
                <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.emailPlaceholder')}
                    className="footer-email-input"
                  />
                  <button type="submit" className="footer-subscribe-btn">
                    {subscribed ? '✓' : t('footer.subscribe')}
                  </button>
                </form>
                {subscribed && (
                  <p className="footer-subscribed-msg">সাবস্ক্রাইব করার জন্য ধন্যবাদ! 🎉</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="footer-bottom-inner">
                <p className="footer-copyright">
                  © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
                </p>
                <p className="footer-made-with">
                  Made with <Heart size={12} className="footer-heart" /> in Bangladesh
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* WhatsApp Float Button */
        .whatsapp-float {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          background: #25D366;
          color: white;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
          text-decoration: none;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
          animation: whatsapp-pulse 2.5s infinite;
        }
        .whatsapp-float:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 28px rgba(37, 211, 102, 0.65);
          animation: none;
        }
        .whatsapp-tooltip {
          position: absolute;
          right: 68px;
          background: #1A1815;
          color: #FAF7F2;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .whatsapp-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: #1A1815;
        }
        .whatsapp-float:hover .whatsapp-tooltip {
          opacity: 1;
        }
        @keyframes whatsapp-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45); }
          50% { box-shadow: 0 4px 32px rgba(37, 211, 102, 0.75), 0 0 0 8px rgba(37,211,102,0.1); }
        }

        /* Footer Wrapper */
        .footer-wrapper {
          position: relative;
          margin-top: 96px;
        }
        .footer-wave {
          line-height: 0;
          overflow: hidden;
          height: 80px;
        }
        .footer-wave svg {
          width: 100%;
          height: 80px;
          display: block;
        }
        .footer-body {
          background: #1A1815;
          color: #FAF7F2;
        }

        /* Brand */
        .footer-brand-col { }
        .footer-logo-wrap { margin-bottom: 12px; }
        .footer-brand-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: #FAF7F2;
          margin-bottom: 6px;
          animation: fadeSlideUp 0.6s ease both;
        }
        .footer-brand-line {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #C75D3C, #B8935F);
          border-radius: 2px;
          animation: expandLine 0.8s ease 0.3s both;
          transform-origin: left;
        }
        @keyframes expandLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .footer-desc {
          color: rgba(250,247,242,0.55);
          font-size: 0.8rem;
          line-height: 1.7;
          margin-bottom: 14px;
        }

        /* Contact info */
        .footer-contact-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: rgba(250,247,242,0.5);
        }
        .footer-contact-icon {
          color: #C75D3C;
          flex-shrink: 0;
        }

        /* Socials */
        .footer-socials {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .footer-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(250,247,242,0.07);
          border: 1px solid rgba(250,247,242,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(250,247,242,0.6);
          text-decoration: none;
          transition: background 0.25s, color 0.25s, transform 0.25s, border-color 0.25s;
        }
        .footer-social-btn:hover {
          background: #C75D3C;
          color: #FAF7F2;
          border-color: #C75D3C;
          transform: translateY(-3px);
        }

        /* Columns */
        .footer-col { }
        .footer-col-title {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(250,247,242,0.9);
          margin-bottom: 16px;
        }
        .footer-title-bar {
          width: 28px;
          height: 2px;
          background: #C75D3C;
          border-radius: 2px;
          margin-top: 6px;
          transition: width 0.3s ease;
        }
        .footer-col:hover .footer-title-bar {
          width: 48px;
        }

        /* Links */
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-link-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .footer-link-arrow {
          color: #C75D3C;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .footer-link-item:hover .footer-link-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .footer-link {
          font-size: 0.82rem;
          color: rgba(250,247,242,0.55);
          text-decoration: none;
          transition: color 0.2s, padding-left 0.2s;
        }
        .footer-link:hover {
          color: #C75D3C;
          padding-left: 2px;
        }

        /* Newsletter */
        .footer-newsletter-desc {
          font-size: 0.8rem;
          color: rgba(250,247,242,0.5);
          margin-bottom: 14px;
          line-height: 1.6;
        }
        .footer-newsletter-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .footer-email-input {
          flex: 1;
          min-width: 0;
          background: rgba(250,247,242,0.07);
          border: 1px solid rgba(250,247,242,0.15);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 0.8rem;
          color: #FAF7F2;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .footer-email-input::placeholder { color: rgba(250,247,242,0.3); }
        .footer-email-input:focus {
          border-color: #C75D3C;
          background: rgba(250,247,242,0.1);
        }
        .footer-subscribe-btn {
          background: linear-gradient(135deg, #C75D3C, #B8935F);
          color: #FAF7F2;
          border: none;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .footer-subscribe-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .footer-subscribed-msg {
          font-size: 0.75rem;
          color: #8A9A7E;
          margin-top: 8px;
          animation: fadeSlideUp 0.4s ease;
        }

        /* Bottom bar */
        .footer-bottom {
          border-top: 1px solid rgba(250,247,242,0.08);
          padding: 18px 0;
        }
        .footer-bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .footer-copyright {
          font-size: 0.72rem;
          color: rgba(250,247,242,0.35);
        }
        .footer-made-with {
          font-size: 0.72rem;
          color: rgba(250,247,242,0.35);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .footer-heart {
          color: #C75D3C;
          animation: heartbeat 1.5s ease infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
