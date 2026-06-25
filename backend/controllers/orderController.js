import Order from '../models/Order.js'

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

export async function createOrder(req, res) {
  try {
    const { items, fullName, phone, address, city, paymentMethod, subtotal, shipping, total } = req.body
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'কার্ট খালি, অর্ডার করা যাবে না' })
    }
    const orderNumber = await uniqueOrderNumber()
    const order = new Order({
      orderNumber,
      user: req.user?._id || null,
      items, fullName, phone, address, city, paymentMethod, subtotal, shipping, total,
    })
    const saved = await order.save()
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
