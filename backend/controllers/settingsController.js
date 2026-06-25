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
    const { heroImage, categoryImages, heroSlider, promoBanner, marqueeItems, lightImage, logoImage } = req.body

    if (typeof heroImage   === 'string') s.heroImage   = heroImage
    if (typeof lightImage  === 'string') s.lightImage  = lightImage
    if (typeof logoImage   === 'string') s.logoImage   = logoImage
    if (categoryImages) {
      if (categoryImages.shoes !== undefined) s.categoryImages.shoes = categoryImages.shoes
      if (categoryImages.bags  !== undefined) s.categoryImages.bags  = categoryImages.bags
    }
    if (Array.isArray(heroSlider))   s.heroSlider   = heroSlider
    if (promoBanner)                 s.promoBanner  = { ...s.promoBanner, ...promoBanner }
    if (Array.isArray(marqueeItems)) s.marqueeItems = marqueeItems

    await s.save()
    res.json(s)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
