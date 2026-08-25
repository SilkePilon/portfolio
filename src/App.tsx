import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const Home = lazy(() => import('@/pages/Home'))
const Works = lazy(() => import('@/pages/Works'))
const WorkDetail = lazy(() => import('@/pages/WorkDetail'))
const Blogs = lazy(() => import('@/pages/Blogs'))
const BlogDetail = lazy(() => import('@/pages/BlogDetail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Route table without the router, so tests can wrap it in a MemoryRouter. */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="works" element={<Works />} />
          <Route path="works/:slug" element={<WorkDetail />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:slug" element={<BlogDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
