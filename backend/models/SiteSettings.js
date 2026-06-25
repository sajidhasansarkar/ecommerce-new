import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    heroImage: { type: String, default: '' },
    categoryImages: {
      shoes: { type: String, default: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=700&q=80' },
      bags:  { type: String, default: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80' },
    },
    // Hero slider — multiple images
    heroSlider: {
      type: [String],
      default: [],
    },
    // Promotional banner (wide)
    promoBanner: {
      image:    { type: String, default: '' },
      title:    { type: String, default: '' },
      subtitle: { type: String, default: '' },
      link:     { type: String, default: '/shop' },
    },
    // Marquee strip texts
    marqueeItems: {
      type: [String],
      default: ['নতুন কালেকশন এসেছে', 'বিশেষ ছাড় চলছে', 'ফ্রি শিপিং ৳৫০০+ অর্ডারে', 'লিমিটেড এডিশন'],
    },
  },
  { timestamps: true }
)

export default mongoose.model('SiteSettings', siteSettingsSchema)
