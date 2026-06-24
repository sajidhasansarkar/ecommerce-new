import mongoose from 'mongoose'
import dns from 'node:dns/promises'

// Windows-এ MongoDB SRV lookup এর জন্য DNS override
dns.setServers(['1.1.1.1', '8.8.8.8'])

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB সংযুক্ত হয়েছে: ${conn.connection.host}`)
  } catch (err) {
    console.error('MongoDB কানেকশন এরর:', err.message)
    process.exit(1)
  }
}
