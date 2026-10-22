import { Route, Routes } from 'react-router'
import { lazy, Suspense } from 'react'
const Home = lazy(() => import('./pages/Home'))
const Store = lazy(() => import('./pages/Store'))
const Form = lazy(() => import('./pages/Form'))
const Query = lazy(() => import('./pages/Query'))
const Layout = lazy(() => import('./pages/layout'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='store' element={<Store />} />
          <Route path='form' element={<Form />} />
          <Route path='query' element={<Query />} />
        </Route>
        <Route path='*' element={<div>404</div>} />
      </Routes>
    </Suspense>
  )
}
