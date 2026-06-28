import Product from '../models/Product.js'

// categoryKey থেকে prefix বানানো: shoes→SHOE, bags→BAG, watches→WTCH ইত্যাদি
function categoryPrefix(categoryKey) {
  const map = {
    shoes:   'SHOE',
    bags:    'BAG',
    watches: 'WTCH',
    jewelry: 'JWLY',
    clothes: 'CLTH',
    sports:  'SPRT',
    beauty:  'BEAU',
    kids:    'KIDS',
  }
  if (map[categoryKey]) return map[categoryKey]
  // অজানা category হলে প্রথম ৪ অক্ষর uppercase নাও
  return categoryKey.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PROD'
}

// নতুন productId generate: SHOE-001, SHOE-002 ...
async function generateProductId(categoryKey) {
  const prefix = categoryPrefix(categoryKey)
  // এই prefix-এ সর্বশেষ productId খোঁজো
  const last = await Product.findOne(
    { productId: { $regex: `^${prefix}-` } },
    { productId: 1 },
    { sort: { productId: -1 } }
  )
  let next = 1
  if (last?.productId) {
    const num = parseInt(last.productId.split('-')[1], 10)
    if (!isNaN(num)) next = num + 1
  }
  return `${prefix}-${String(next).padStart(3, '0')}`
}

// GET /api/products
export async function getProducts(req, res) {
  try {
    const { category, subcategory, q } = req.query
    const filter = {}

    if (subcategory && subcategory !== 'all') {
      filter.categoryKey = subcategory
    } else if (category && category !== 'all') {
      // Exact match অথবা prefix match — যেমন 'shoes' → 'sports-shoes', 'casual-shoes' সব দেখাবে
      filter.categoryKey = { $regex: `(^|-)${category}($|-)`, $options: 'i' }
    }

    if (req.query.badge) {
      filter.$and = [
        { $or: [
          { badgeKey: req.query.badge },
          { 'badge.en': { $regex: req.query.badge, $options: 'i' } },
          { 'badge.bn': { $regex: req.query.badge, $options: 'i' } },
        ]},
      ]
    }
    if (q) {
      const qOr = { $or: [
        { productId: { $regex: q, $options: 'i' } },
        { 'name.bn': { $regex: q, $options: 'i' } },
        { 'name.en': { $regex: q, $options: 'i' } },
        { categoryKey: { $regex: q, $options: 'i' } },
        { 'description.bn': { $regex: q, $options: 'i' } },
        { 'description.en': { $regex: q, $options: 'i' } },
      ]}
      if (filter.$and) filter.$and.push(qOr)
      else filter.$and = [qOr]
    }

    // পেজিনেশন: ?page=1&limit=24 — না দিলে ডিফল্ট প্রথম ২৪টা
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 24))
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ])

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products/:id  — productId বা _id দুটো দিয়েই কাজ করে
export async function getProductById(req, res) {
  try {
    const { id } = req.params
    // SHOE-001 ফরম্যাট হলে productId দিয়ে খোঁজো, নইলে _id
    const product = id.includes('-')
      ? await Product.findOne({ productId: id })
      : await Product.findById(id)
    if (!product) return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const data = { ...req.body }

    // productId auto-generate (না দিলে)
    if (!data.productId) {
      data.productId = await generateProductId(data.categoryKey || 'prod')
    }

    // Price/discount accurate calculation:
    // Case 1: discountPercent দেওয়া হয়েছে → price = oldPrice - (oldPrice * discountPercent / 100)
    // Case 2: price দেওয়া হয়েছে → discountPercent = exact calculation (no rounding to wrong value)
    if (data.discountPercent && data.oldPrice) {
      const pct = Number(data.discountPercent)
      const old = Number(data.oldPrice)
      data.price = Math.round(old - (old * pct / 100))
    } else if (data.oldPrice && data.price && Number(data.oldPrice) > Number(data.price)) {
      const old = Number(data.oldPrice)
      const price = Number(data.price)
      data.discountPercent = parseFloat(((old - price) / old * 100).toFixed(2))
    }

    // sizeVariants থাকলে stock auto-sum (pre-save hook-ও করে, এটা double safety)
    if (Array.isArray(data.sizeVariants) && data.sizeVariants.length > 0) {
      data.stock = data.sizeVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    }

    const product = new Product(data)
    const saved = await product.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const data = { ...req.body }

    // Price/discount accurate calculation:
    // Case 1: discountPercent দেওয়া হয়েছে → price = oldPrice - (oldPrice * discountPercent / 100)
    // Case 2: price দেওয়া হয়েছে → discountPercent = exact calculation
    if (data.discountPercent && data.oldPrice) {
      const pct = Number(data.discountPercent)
      const old = Number(data.oldPrice)
      data.price = Math.round(old - (old * pct / 100))
    } else if (data.oldPrice && data.price && Number(data.oldPrice) > Number(data.price)) {
      const old = Number(data.oldPrice)
      const price = Number(data.price)
      data.discountPercent = parseFloat(((old - price) / old * 100).toFixed(2))
    } else if (!data.oldPrice) {
      data.discountPercent = null
    }

    // sizeVariants থাকলে stock auto-sum
    if (Array.isArray(data.sizeVariants) && data.sizeVariants.length > 0) {
      data.stock = data.sizeVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
    if (!updated) return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' })
    res.json({ message: 'প্রোডাক্ট মুছে ফেলা হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products/migrate/badges
const BADGE_BN_TO_KEY = {
  'বেস্ট সেলার': 'bestseller',
  'নতুন':        'new',
  'সেল':          'sale',
  'ট্রেন্ডিং':   'trending',
  'লিমিটেড':     'limited',
}

export async function migrateBadgeKeys(req, res) {
  try {
    const products = await Product.find({ badgeKey: { $in: [null, ''] } })
    let updated = 0
    for (const p of products) {
      const key = BADGE_BN_TO_KEY[p.badge?.bn]
      if (key) { p.badgeKey = key; await p.save(); updated++ }
    }
    res.json({ message: `${updated}টি প্রোডাক্টের badgeKey আপডেট হয়েছে`, updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products/migrate/productIds  — পুরনো প্রোডাক্টে ID বসানোর জন্য একবার চালান
export async function migrateProductIds(req, res) {
  try {
    const products = await Product.find({ productId: { $in: [null, ''] } }).sort({ createdAt: 1 })
    let updated = 0
    for (const p of products) {
      p.productId = await generateProductId(p.categoryKey || 'prod')
      await p.save()
      updated++
    }
    res.json({ message: `${updated}টি প্রোডাক্টে ID যুক্ত হয়েছে`, updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products/migrate/category — পুরনো categoryKey bulk update
export async function migrateCategoryKey(req, res) {
  try {
    const { from, to } = req.body
    if (!from || !to) return res.status(400).json({ message: '"from" এবং "to" দিতে হবে' })
    const result = await Product.updateMany({ categoryKey: from }, { $set: { categoryKey: to } })
    res.json({ message: `${result.modifiedCount}টি প্রোডাক্টের categoryKey "${from}" → "${to}" করা হয়েছে`, updated: result.modifiedCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
