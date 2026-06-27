import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    heroImage: { type: String, default: '' },
    logoImage: { type: String, default: '' },
    lightImage: { type: String, default: '' }, // kept for backwards compat, unused
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
    promotions: {
      deliveryEnabled:       { type: Boolean, default: true },
      deliveryCharge:        { type: Number,  default: 80 },
      freeDeliveryEnabled:   { type: Boolean, default: true },
      freeDeliveryThreshold: { type: Number,  default: 1500 },
      discountRules: {
        type: [
          {
            id:          { type: String },
            enabled:     { type: Boolean, default: true },
            label:       { type: String,  default: '' },
            type:        { type: String,  default: 'percent' }, // 'percent' | 'flat'
            value:       { type: Number,  default: 0 },
            scope:       { type: String,  default: 'all' }, // 'all' | 'category' | 'minOrder'
            categoryKey: { type: String,  default: '' },
            minOrder:    { type: Number,  default: 0 },
            expiry:      { type: String,  default: '' },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true }
)

export default mongoose.model('SiteSettings', siteSettingsSchema)
