import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NeuralSubstrate  from '@/components/NeuralSubstrate'

/**
 * Public site shell. NeuralSubstrate canvas paints particle network +
 * synaptic pulses behind page content. Cursor-tracked spotlight was
 * removed — neural network alone is the bg effect.
 */
export default function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <NeuralSubstrate />
      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
