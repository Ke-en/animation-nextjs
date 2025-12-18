import Candidate from '@/components/Candidate'
import Header from '@/components/Header'
import MapContainer from '@/components/MapContainer'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="bg-white flex min-h-screen flex-col items-center justify-between p-4">
      <MapContainer />
    </main>
  )
}
