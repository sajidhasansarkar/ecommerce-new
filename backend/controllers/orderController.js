import Order from '../models/Order.js'
import Product from '../models/Product.js'
import PromoCode from '../models/PromoCode.js'
import SiteSettings from '../models/SiteSettings.js'
import mongoose from 'mongoose'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateOrderNumber() {
  const year = new Date().getFullYear()
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `ORD-${year}-${suffix}`
}

async function uniqueOrderNumber(attempt = 0) {
  if (attempt >= 5) throw new Error('অর্ডার নম্বর তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
  const num = generateOrderNumber()
  const exists = await Order.exists({ orderNumber: num })
  return exists ? uniqueOrderNumber(attempt + 1) : num
}

function calcShippingServer(subtotal, promotions) {
  if (!promotions) return subtotal >= 1500 || subtotal === 0 ? 0 : 80
  const {
    deliveryEnabled = true,
    deliveryCharge = 80,
    freeDeliveryEnabled = true,
    freeDeliveryThreshold = 1500,
  } = promotions
  if (!deliveryEnabled || subtotal === 0) return 0
  if (freeDeliveryEnabled && subtotal >= freeDeliveryThreshold) return 0
  return deliveryCharge
}

function calcAutoDiscountServer(items, subtotal, promotions) {
  if (!promotions?.discountRules?.length) return 0
  const now = new Date()
  const activeRules = promotions.discountRules.filter(r => {
    if (!r.enabled) return false
    if (r.expiry && new Date(r.expiry) < now) return false
    return true
  })

  let totalDiscount = 0
  for (const rule of activeRules) {
    let base = 0
    if (rule.scope === 'all') {
      base = subtotal
    } else if (rule.scope === 'minOrder') {
      if (subtotal < (rule.minOrder || 0)) continue
      base = subtotal
    } else if (rule.scope === 'category') {
      base = items
        .filter(item => item.categoryKey === rule.categoryKey)
        .reduce((sum, item) => sum + item.price * item.qty, 0)
      if (base === 0) continue
    }

    let ruleDiscount = 0
    if (rule.type === 'percent') {
      ruleDiscount = Math.round((base * rule.value) / 100)
    } else {
      ruleDiscount = rule.value
    }
    totalDiscount += Math.min(ruleDiscount, base)
  }
  return Math.min(totalDiscount, subtotal)
}

export async function createOrder(req, res) {
  try {
    const { items, fullName, phone, address, city, paymentMethod, promoCode } = req.body
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'কার্ট খালি, অর্ডার করা যাবে না' })
    }

    // ━━━ Server-side re-validation ━━━
    const resolvedItems = []
    for (const item of items) {
      const rawId = item.productId || item.id || item._id
      let product = null
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        product = await Product.findById(rawId)
      }
      const qty = Math.max(1, Number(item.qty) || Number(item.quantity) || 1)
      resolvedItems.push({
        productId: product?._id || rawId || null,
        skuId: product?.productId || item.skuId || null,
        categoryKey: product?.categoryKey || item.categoryKey || '',
        name: item.name || product?.name?.bn || product?.name?.en || '',
        price: product ? product.price : Number(item.price) || 0,
        image: item.image || product?.images?.[0] || '',
        color: item.color || '',
        size: item.size || '',
        qty,
      })
    }

    const subtotal = resolvedItems.reduce((sum, it) => sum + it.price * it.qty, 0)

    // ━━━ Promo code validation (server-side) ━━━
    let discount = 0
    let appliedPromoCode = ''
    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase().trim() })
      if (promo && promo.enabled) {
        const notExpired = !promo.expiry || new Date(promo.expiry) >= new Date()
        const withinLimit = promo.maxUses === 0 || promo.usedCount < promo.maxUses
        const meetsMinOrder = subtotal >= (promo.minOrder || 0)

        if (notExpired && withinLimit && meetsMinOrder) {
          if (promo.type === 'percent') {
            discount = Math.round((subtotal * promo.value) / 100)
          } else {
            discount = promo.value
          }
          discount = Math.min(discount, subtotal)
          appliedPromoCode = promo.code

          // usedCount বাড়ানো হচ্ছে
          await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } })
        }
      }
    }

    const discountedSubtotal = subtotal - discount
    const settings = await SiteSettings.findOne()
    const autoDiscount = calcAutoDiscountServer(resolvedItems, discountedSubtotal, settings?.promotions)
    const finalSubtotal = discountedSubtotal - autoDiscount
    const shipping = calcShippingServer(finalSubtotal, settings?.promotions)
    const total = finalSubtotal + shipping
    const totalDiscount = discount + autoDiscount

    const orderNumber = await uniqueOrderNumber()
    const order = new Order({
      orderNumber,
      user: req.user?._id || null,
      items: resolvedItems, fullName, phone, address, city, paymentMethod,
      subtotal, discount: totalDiscount, promoCode: appliedPromoCode, shipping, total,
    })
    const saved = await order.save()

    // Stock deduction
    for (const item of resolvedItems) {
      const rawId = item.productId
      if (!rawId) continue
      const isValidId = mongoose.Types.ObjectId.isValid(rawId)
      if (!isValidId) continue

      const product = await Product.findById(rawId)
      if (!product) continue

      const qty = item.qty
      const size = item.size || null

      if (size && product.sizeVariants && product.sizeVariants.length > 0) {
        const variant = product.sizeVariants.find(v => v.size === size)
        if (variant) {
          variant.stock = Math.max(0, variant.stock - qty)
          product.stock = product.sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
          product.markModified('sizeVariants')
          await product.save()
        }
      } else {
        product.stock = Math.max(0, product.stock - qty)
        await product.save()
      }
    }

    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export async function getOrders(req, res) {
  try {
    const { status } = req.query
    const filter = status && status !== 'all' ? { status } : {}
    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export async function updateOrder(req, res) {
  try {
    const allowed = ['fullName','phone','address','city','paymentMethod','status','items','subtotal','discount','promoCode','shipping','total']
    const update = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k] })
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export async function deleteOrder(req, res) {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json({ message: 'অর্ডার ডিলিট হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function deleteCancelledOrders(req, res) {
  try {
    const result = await Order.deleteMany({ status: 'cancelled' })
    res.json({ message: `${result.deletedCount}টি বাতিল অর্ডার মুছে ফেলা হয়েছে`, deletedCount: result.deletedCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function getCustomers(req, res) {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: '$phone',
          name: { $first: '$fullName' },
          orders: { $sum: 1 },
          spent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      { $sort: { spent: -1 } },
    ])
    res.json(customers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
