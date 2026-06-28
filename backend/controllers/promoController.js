import PromoCode from '../models/PromoCode.js'

/* ── Admin: সব প্রোমো কোড দেখা ── */
export async function listPromoCodes(req, res) {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 })
    res.json(codes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* ── Admin: নতুন প্রোমো কোড তৈরি ── */
export async function createPromoCode(req, res) {
  try {
    const { code, label, type, value, minOrder, maxUses, expiry, enabled } = req.body
    if (!code || !value) {
      return res.status(400).json({ message: 'কোড এবং ডিসকাউন্ট পরিমাণ দেওয়া আবশ্যক' })
    }
    const promo = await PromoCode.create({
      code: code.toUpperCase().trim(),
      label, type, value,
      minOrder: minOrder || 0,
      maxUses: maxUses || 0,
      expiry: expiry || '',
      enabled: enabled !== false,
    })
    res.status(201).json(promo)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'এই প্রোমো কোডটি আগে থেকেই আছে' })
    }
    res.status(400).json({ message: err.message })
  }
}

/* ── Admin: প্রোমো কোড আপডেট ── */
export async function updatePromoCode(req, res) {
  try {
    const allowed = ['label', 'type', 'value', 'minOrder', 'maxUses', 'expiry', 'enabled', 'code']
    const update = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k] })
    if (update.code) update.code = update.code.toUpperCase().trim()

    const promo = await PromoCode.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!promo) return res.status(404).json({ message: 'প্রোমো কোড পাওয়া যায়নি' })
    res.json(promo)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'এই প্রোমো কোডটি আগে থেকেই আছে' })
    }
    res.status(400).json({ message: err.message })
  }
}

/* ── Admin: প্রোমো কোড ডিলিট ── */
export async function deletePromoCode(req, res) {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id)
    if (!promo) return res.status(404).json({ message: 'প্রোমো কোড পাওয়া যায়নি' })
    res.json({ message: 'প্রোমো কোড ডিলিট হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/* ── Customer: প্রোমো কোড যাচাই ও apply ── */
export async function applyPromoCode(req, res) {
  try {
    const { code, subtotal } = req.body
    if (!code) return res.status(400).json({ message: 'প্রোমো কোড দিন' })

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() })

    if (!promo)          return res.status(404).json({ message: 'প্রোমো কোডটি সঠিক নয়' })
    if (!promo.enabled)  return res.status(400).json({ message: 'এই প্রোমো কোডটি এখন সক্রিয় নেই' })

    if (promo.expiry && new Date(promo.expiry) < new Date()) {
      return res.status(400).json({ message: 'এই প্রোমো কোডের মেয়াদ শেষ হয়ে গেছে' })
    }
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ message: 'এই প্রোমো কোডের ব্যবহারের সীমা শেষ হয়ে গেছে' })
    }
    if (promo.minOrder > 0 && subtotal < promo.minOrder) {
      return res.status(400).json({
        message: `এই কোডটি ব্যবহার করতে কমপক্ষে ৳${promo.minOrder} এর অর্ডার করতে হবে`
      })
    }

    // Discount calculate
    let discount = 0
    if (promo.type === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100)
    } else {
      discount = promo.value
    }
    discount = Math.min(discount, subtotal) // subtotal-এর বেশি হবে না

    res.json({
      valid: true,
      promoId: promo._id,
      code: promo.code,
      label: promo.label,
      type: promo.type,
      value: promo.value,
      discount,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
