// Cloudinary-তে ছবি আপলোড করার কন্ট্রোলার।
// ফ্রন্টএন্ড থেকে ছবি (base64) এই এন্ডপয়েন্টে আসে, এখান থেকে সার্ভার Cloudinary API-তে
// সিগনেচার-যুক্ত (signed) রিকোয়েস্ট দিয়ে আপলোড করে এবং Cloudinary থেকে পাওয়া URL
// ফ্রন্টএন্ডকে ফিরিয়ে দেয়। Cloudinary credentials এখানে .env থেকে আসে, তাই এটা কখনো
// ব্রাউজারে এক্সপোজ হয় না। কোনো extra npm প্যাকেজ লাগে না — Node-এর built-in fetch ও
// crypto ব্যবহার করা হয়েছে।

import crypto from 'node:crypto'

// প্যারামিটারগুলো দিয়ে Cloudinary-র জন্য প্রয়োজনীয় SHA-1 সিগনেচার বানানো হয়।
// Cloudinary ডকুমেন্টেশন অনুযায়ী: alphabetically sorted params (file ও resource_type
// বাদে), "key=value" জোড়াগুলো "&" দিয়ে জোড়া দিয়ে, শেষে api_secret জুড়ে SHA-1 হ্যাশ করতে হয়।
function generateSignature(params, apiSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex')
}

// POST /api/upload
// body: { image: "data:image/png;base64,...." }  বা  { image: "<pure base64 string>" }
export async function uploadImage(req, res) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        message:
          'সার্ভারে Cloudinary credentials সেট করা নেই। backend/.env ফাইলে CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET যুক্ত করুন।',
      })
    }

    const { image } = req.body
    if (!image) {
      return res.status(400).json({ message: 'কোনো ছবি পাওয়া যায়নি' })
    }

    // Cloudinary data URL (data:image/png;base64,...) ফরম্যাট নিজেই বুঝে নেয়,
    // তাই prefix সরানোর প্রয়োজন নেই — যদি pure base64 আসে, prefix জুড়ে দেওয়া হচ্ছে
    const fileData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'ecommerce-products' // চাইলে এখানে নাম বদলাতে পারেন

    // সিগনেচার বানানোর জন্য শুধু এই দুটো প্যারামই দরকার (file বাদে)
    const signature = generateSignature({ folder, timestamp }, apiSecret)

    const form = new URLSearchParams()
    form.append('file', fileData)
    form.append('api_key', apiKey)
    form.append('timestamp', String(timestamp))
    form.append('signature', signature)
    form.append('folder', folder)

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const cloudRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const data = await cloudRes.json()

    if (!cloudRes.ok || data.error) {
      const errMsg = data?.error?.message || 'Cloudinary-তে আপলোড ব্যর্থ হয়েছে'
      return res.status(502).json({ message: errMsg })
    }

    // ফ্রন্টএন্ডের প্রয়োজনীয় তথ্য ফিরিয়ে দেওয়া হচ্ছে।
    // url ফিল্ডে f_auto,q_auto যুক্ত করা হয়েছে — এতে Cloudinary স্বয়ংক্রিয়ভাবে
    // ছবির ফরম্যাট ও কোয়ালিটি অপ্টিমাইজ করে ডেলিভার করবে, ফলে bandwidth credit
    // অনেক কম খরচ হবে।
    const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')

    return res.status(201).json({
      url: optimizedUrl,            // অপ্টিমাইজড লিংক — এটাই ডাটাবেসে সেভ হবে
      originalUrl: data.secure_url, // মূল (অপ্টিমাইজ ছাড়া) লিংক, প্রয়োজনে রেফারেন্সের জন্য
      publicId: data.public_id,     // পরে ডিলিট করতে চাইলে এই ID লাগবে
      width: data.width,
      height: data.height,
      size: data.bytes,
    })
  } catch (err) {
    console.error('Image upload error:', err)
    res.status(500).json({ message: 'ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message })
  }
}

