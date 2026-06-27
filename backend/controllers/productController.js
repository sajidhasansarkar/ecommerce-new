import Product from '../models/Product.js'

// GET /api/products  (?category=shoes&q=heel দিয়ে ফিল্টার করা যায়)
export async function getProducts(req, res) {
  try {
    const { category, q } = req.query
    const filter = {}

    if (category && category !== 'all') {
      filter.categoryKey = category
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
        { 'name.bn': { $regex: q, $options: 'i' } },
        { 'name.en': { $regex: q, $options: 'i' } },
        { 'description.bn': { $regex: q, $options: 'i' } },
        { 'description.en': { $regex: q, $options: 'i' } },
      ]}
      if (filter.$and) filter.$and.push(qOr)
      else filter.$and = [qOr]
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products   (অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট যুক্ত করার জন্য)
export async function createProduct(req, res) {
  try {
    const product = new Product(req.body)
    const saved = await product.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/products/:id   (অ্যাডমিন প্যানেল থেকে এডিট করার জন্য)
export async function updateProduct(req, res) {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
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
