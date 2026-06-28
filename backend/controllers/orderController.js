import Order from '../models/Order.js'
import Product from '../models/Product.js'
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

// সাইট সেটিংসের promotions থেকে শিপিং চার্জ ক্যালকুলেট করে — Checkout.jsx-এর
// calcShipping-এর মতোই লজিক, কিন্তু এটা সার্ভারে চলে তাই client পুরনো/cached
// promotions নিয়ে থাকলেও order সবসময় ডেটাবেসের লেটেস্ট রেট অনুযায়ী হিসাব হবে।
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

export async function createOrder(req, res) {
  try {
    const { items, fullName, phone, address, city, paymentMethod } = req.body
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'কার্ট খালি, অর্ডার করা যাবে না' })
    }

    // ━━━ Server-side re-validation ━━━
    // client থেকে আসা price/subtotal/shipping/total কখনো সরাসরি বিশ্বাস করা হয় না।
    // প্রতিটা item-এর জন্য আসল প্রোডাক্ট DB থেকে টেনে বর্তমান দাম ও skuId (SHOE-001
    // স্টাইল productId) বসানো হয়, তারপর সেই দাম দিয়েই subtotal/shipping/total
    // recalculate করা হয়। এভাবে delivery charge সেটিংস বদলালে সাথে সাথেই নতুন
    // অর্ডারে effect পড়বে, এবং client থেকে দাম কারচুপি করার সুযোগও থাকে না।
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
        skuId: product?.productId || item.skuId || null, // SHOE-001 স্টাইল আইডি — সবসময় DB থেকে fresh
        name: item.name || product?.name?.bn || product?.name?.en || '',
        // প্রোডাক্ট পাওয়া গেলে DB-র বর্তমান দাম নেওয়া হয়; না পাওয়া গেলে (deleted product)
        // client-এর পাঠানো দামে fallback করা হয়, যাতে অর্ডার সম্পূর্ণ ব্যর্থ না হয়ে যায়।
        price: product ? product.price : Number(item.price) || 0,
        image: item.image || product?.images?.[0] || '',
        color: item.color || '',
        size: item.size || '',
        qty,
      })
    }

    const subtotal = resolvedItems.reduce((sum, it) => sum + it.price * it.qty, 0)
    const settings = await SiteSettings.findOne()
    const shipping = calcShippingServer(subtotal, settings?.promotions)
    const total = subtotal + shipping

    const orderNumber = await uniqueOrderNumber()
    const order = new Order({
      orderNumber,
      user: req.user?._id || null,
      items: resolvedItems, fullName, phone, address, city, paymentMethod,
      subtotal, shipping, total,
    })
    const saved = await order.save()

    // Stock deduction — order place হওয়ার সাথে সাথে stock কমানো হচ্ছে
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
        // size-based stock deduction
        const variant = product.sizeVariants.find(v => v.size === size)
        if (variant) {
          variant.stock = Math.max(0, variant.stock - qty)
          product.stock = product.sizeVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
          product.markModified('sizeVariants')
          await product.save()
        }
      } else {
        // simple stock deduction
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

// PUT /api/orders/:id — full order edit
export async function updateOrder(req, res) {
  try {
    const allowed = ['fullName','phone','address','city','paymentMethod','status','items','subtotal','shipping','total']
    const update = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k] })
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/orders/:id
export async function deleteOrder(req, res) {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json({ message: 'অর্ডার ডিলিট হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/orders/bulk/cancelled — সব cancelled অর্ডার মুছুন
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
