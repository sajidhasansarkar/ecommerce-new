// imgbb-তে ছবি আপলোড করার কন্ট্রোলার।
// ফ্রন্টএন্ড থেকে ছবি (base64) এই এন্ডপয়েন্টে আসে, এখান থেকে সার্ভার imgbb API-তে
// আপলোড করে এবং imgbb থেকে পাওয়া URL ফ্রন্টএন্ডকে ফিরিয়ে দেয়।
// imgbb API key এখানে .env থেকে আসে, তাই এটা কখনো ব্রাউজারে এক্সপোজ হয় না।

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

// POST /api/upload
// body: { image: "data:image/png;base64,...." }  বা  { image: "<pure base64 string>" }
export async function uploadImage(req, res) {
  try {
    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        message: 'সার্ভারে IMGBB_API_KEY সেট করা নেই। backend/.env ফাইলে IMGBB_API_KEY যুক্ত করুন।',
      })
    }

    const { image, name } = req.body
    if (!image) {
      return res.status(400).json({ message: 'কোনো ছবি পাওয়া যায়নি' })
    }

    // ডেটা URL prefix (data:image/png;base64,) থাকলে সরিয়ে দেওয়া হচ্ছে,
    // কারণ imgbb শুধু খাঁটি base64 স্ট্রিং আশা করে
    const base64Data = image.includes(',') ? image.split(',')[1] : image

    const form = new URLSearchParams()
    form.append('key', apiKey)
    form.append('image', base64Data)
    if (name) form.append('name', name)

    const imgbbRes = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const data = await imgbbRes.json()

    if (!imgbbRes.ok || !data.success) {
      const errMsg = data?.error?.message || 'imgbb-তে আপলোড ব্যর্থ হয়েছে'
      return res.status(502).json({ message: errMsg })
    }

    // ফ্রন্টএন্ডের প্রয়োজনীয় তথ্য ফিরিয়ে দেওয়া হচ্ছে
    return res.status(201).json({
      url: data.data.url,           // সরাসরি ছবির লিংক — এটাই ডাটাবেসে সেভ হবে
      thumbUrl: data.data.thumb?.url || data.data.url,
      displayUrl: data.data.display_url || data.data.url,
      deleteUrl: data.data.delete_url, // চাইলে পরে এখান থেকে imgbb থেকে ছবি ডিলিট করা যায়
      width: data.data.width,
      height: data.data.height,
      size: data.data.size,
    })
  } catch (err) {
    console.error('Image upload error:', err)
    res.status(500).json({ message: 'ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message })
  }
}
