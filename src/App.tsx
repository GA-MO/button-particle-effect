import UIProvider from './libs/mantine/Provider'
import QueryProvider from './libs/reactQuery/Provider'
import AppRoutes from './AppRoutes'
// import gsap from 'gsap'
// import { ScrollTrigger, ScrollSmoother } from 'gsap/all'

// gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

// ScrollSmoother.create({
//   smooth: 2,
//   effects: true,
//   normalizeScroll: true
// })

export default function App() {
  return (
    <UIProvider>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </UIProvider>
  )
}
