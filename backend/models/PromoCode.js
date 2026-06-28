import mongoose from 'mongoose'

const promoCodeSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
    label:       { type: String, default: '' },           // admin note, e.g. "Eid 2025"
    type:        { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value:       { type: Number, required: true, min: 0 }, // % or ৳
    minOrder:    { type: Number, default: 0 },             // minimum cart subtotal to apply
    maxUses:     { type: Number, default: 0 },             // 0 = unlimited
    usedCount:   { type: Number, default: 0 },
    expiry:      { type: String, default: '' },            // ISO date string or ''
    enabled:     { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('PromoCode', promoCodeSchema)
