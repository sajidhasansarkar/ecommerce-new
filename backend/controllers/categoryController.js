import Category from '../models/Category.js'

// GET /api/categories  — সব active ক্যাটাগরি (public)
export async function getCategories(req, res) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/categories/all  — সব ক্যাটাগরি (admin, inactive সহ)
export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/categories  — নতুন ক্যাটাগরি যোগ (admin only)
export async function createCategory(req, res) {
  try {
    const category = new Category(req.body)
    const saved = await category.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: `"${req.body.key}" key টি আগে থেকেই আছে।` })
    }
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/categories/:id  — ক্যাটাগরি আপডেট (admin only)
export async function updateCategory(req, res) {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updated) return res.status(404).json({ message: 'ক্যাটাগরি পাওয়া যায়নি' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/categories/:id  — ক্যাটাগরি মুছে ফেলা (admin only)
export async function deleteCategory(req, res) {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'ক্যাটাগরি পাওয়া যায়নি' })
    res.json({ message: 'ক্যাটাগরি মুছে ফেলা হয়েছে' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
