import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    heroImage: { type: String, default: '' },
    logoImage: { type: String, default: '' },
    lightImage: { type: String, default: '' },
    // Dynamic category images — [{key, image}]
    // key matches category.key (e.g. 'shoes', 'bags', 'jewelry')
    categoryImages: {
      type: [{ key: String, image: String }],
      default: [],
    },
    heroSlider: {
      type: [String],
      default: [],
    },
    promoBanner: {
      image:    { type: String, default: '' },
      title:    { type: String, default: '' },
      subtitle: { type: String, default: '' },
      link:     { type: String, default: '/shop' },
    },
    marqueeItems: {
      type: [String],
      default: ['নতুন কালেকশন এসেছে', 'বিশেষ ছাড় চলছে', 'ফ্রি শিপিং ৳৫০০+ অর্ডারে', 'লিমিটেড এডিশন'],
    },
  },
  { timestamps: true }
)

export default mongoose.model('SiteSettings', siteSettingsSchema)
