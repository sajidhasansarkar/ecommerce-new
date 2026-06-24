import Order from '../models/Order.js'

// ━━━ Unique Order Number Generator ━━━
// Format: ORD-2026-A7X9K2
// বছর + ৬ টি random alphanumeric (A-Z, 2-9) — confusing characters (0,1,O,I) বাদ দেওয়া হয়েছে
// মোট combination: 32^6 = ১ বিলিয়নেরও বেশি — collision practically impossible
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateOrderNumber() {
  const year = new Date().getFullYear()
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return `ORD-${year}-${suffix}`
}

// collision হলে নতুন কোড তৈরি করে retry করা হয় (max 5 বার)
async function uniqueOrderNumber(attempt = 0) {
  if (attempt >= 5) throw new Error('অর্ডার নম্বর তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন')
  const num = generateOrderNumber()
  const exists = await Order.exists({ orderNumber: num })
  return exists ? uniqueOrderNumber(attempt + 1) : num
}

// POST /api/orders  (চেকআউট পেজ থেকে কল হবে)
export async function createOrder(req, res) {
  try {
    const { items, fullName, phone, address, city, paymentMethod, subtotal, shipping, total } =
      req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'কার্ট খালি, অর্ডার করা যাবে না' })
    }

    const orderNumber = await uniqueOrderNumber()

    const order = new Order({
      orderNumber,
      user: req.user?._id || null,
      items,
      fullName,
      phone,
      address,
      city,
      paymentMethod,
      subtotal,
      shipping,
      total,
    })

    const saved = await order.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/orders   (অ্যাডমিন প্যানেলের জন্য, ?status=processing দিয়ে ফিল্টার করা যায়)
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

// GET /api/orders/:id
export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/orders/:id/status   (অ্যাডমিন থেকে স্ট্যাটাস বদলানোর জন্য)
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

// GET /api/orders/customers   (অ্যাডমিন কাস্টমার পেজের জন্য)
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
