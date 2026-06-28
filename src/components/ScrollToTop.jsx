import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router নিজে থেকে নতুন পেজে গেলে স্ক্রল পজিশন রিসেট করে না — আগের পেজে
// যেখানে স্ক্রল করা ছিল (যেমন ফুটারের কাছে), নতুন পেজও সেই পজিশনেই খোলে।
// এই কম্পোনেন্টটা pathname বদলালেই window-কে instant টপে নিয়ে যায়, যাতে
// মোবাইলে প্রোডাক্ট কার্ডে ক্লিক করলে ডিটেলস পেজ সবসময় উপর থেকেই শুরু হয়।
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
