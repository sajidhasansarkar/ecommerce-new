import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-ink text-sand mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-xl mb-3">{t('brand.name')}</h3>
            <p className="text-sand/60 text-sm leading-relaxed">{t('footer.desc')}</p>
            <div className="flex gap-4 mt-4">
              <a href="#" aria-label="Instagram" className="text-sand/60 hover:text-clay transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="text-sand/60 hover:text-clay transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Email" className="text-sand/60 hover:text-clay transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3 text-sand/90">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-sm text-sand/60">
              <li><Link to="/shop" className="hover:text-clay transition-colors">{t('footer.allProducts')}</Link></li>
              <li><Link to="/shop?category=shoes" className="hover:text-clay transition-colors">{t('nav.shoes')}</Link></li>
              <li><Link to="/shop?category=bags" className="hover:text-clay transition-colors">{t('nav.bags')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3 text-sand/90">{t('footer.help')}</h4>
            <ul className="space-y-2 text-sm text-sand/60">
              <li><a href="#" className="hover:text-clay transition-colors">{t('footer.shippingInfo')}</a></li>
              <li><a href="#" className="hover:text-clay transition-colors">{t('footer.returnPolicy')}</a></li>
              <li><a href="#" className="hover:text-clay transition-colors">{t('footer.contact')}</a></li>
              <li><Link to="/admin" className="hover:text-clay transition-colors">{t('footer.admin')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide mb-3 text-sand/90">{t('footer.newsletter')}</h4>
            <p className="text-sand/60 text-sm mb-3">{t('footer.newsletterDesc')}</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 bg-sand/10 border border-sand/20 rounded-md px-3 py-2 text-sm placeholder:text-sand/40 focus:outline-none focus:ring-1 focus:ring-clay"
              />
              <button
                type="submit"
                className="bg-clay hover:bg-clay-dark transition-colors text-sand text-sm font-medium px-4 py-2 rounded-md"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-sand/10 mt-10 pt-6 text-center text-xs text-sand/40">
          © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
