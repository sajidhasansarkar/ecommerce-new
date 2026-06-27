import SiteSettings from '../models/SiteSettings.js'

async function getOrCreate() {
  let s = await SiteSettings.findOne()
  if (!s) s = await SiteSettings.create({})
  return s
}

export async function getSettings(req, res) {
  try {
    res.json(await getOrCreate())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function updateSettings(req, res) {
  try {
    const s = await getOrCreate()
    const { heroImage, categoryImages, heroSlider, promoBanner, marqueeItems, logoImage, promotions } = req.body

    if (typeof heroImage   === 'string') s.heroImage   = heroImage
    if (typeof logoImage   === 'string') s.logoImage   = logoImage
    // categoryImages এখন [{key, image}] array
    if (Array.isArray(categoryImages))   s.categoryImages = categoryImages
    if (Array.isArray(heroSlider))   s.heroSlider   = heroSlider
    if (Array.isArray(marqueeItems)) s.marqueeItems = marqueeItems
    if (promoBanner && typeof promoBanner === 'object') {
      if (typeof promoBanner.image    === 'string') s.promoBanner.image    = promoBanner.image
      if (typeof promoBanner.title    === 'string') s.promoBanner.title    = promoBanner.title
      if (typeof promoBanner.subtitle === 'string') s.promoBanner.subtitle = promoBanner.subtitle
      if (typeof promoBanner.link     === 'string') s.promoBanner.link     = promoBanner.link
    }
    if (promotions && typeof promotions === 'object') {
      if (!s.promotions) s.promotions = {}
      if (typeof promotions.deliveryEnabled       === 'boolean') s.promotions.deliveryEnabled       = promotions.deliveryEnabled
      if (typeof promotions.deliveryCharge        === 'number')  s.promotions.deliveryCharge        = promotions.deliveryCharge
      if (typeof promotions.freeDeliveryEnabled   === 'boolean') s.promotions.freeDeliveryEnabled   = promotions.freeDeliveryEnabled
      if (typeof promotions.freeDeliveryThreshold === 'number')  s.promotions.freeDeliveryThreshold = promotions.freeDeliveryThreshold
      if (Array.isArray(promotions.discountRules))               s.promotions.discountRules         = promotions.discountRules
      s.markModified('promotions')
    }

    await s.save()
    res.json(s)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
