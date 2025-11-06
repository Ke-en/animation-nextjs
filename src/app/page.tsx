import Candidate from '@/components/Candidate'
import Header from '@/components/Header'
import TaiwanMap from '@/components/TaiwanMap'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="bg-white flex min-h-screen flex-col items-center justify-between p-12">
      <TaiwanMap />
      
    </main>
  )
}
