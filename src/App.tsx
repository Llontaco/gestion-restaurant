import { Routes, Route, Navigate } from 'react-router-dom'
import VistasIndex from './pages/VistasIndex'
import KioskMenu from './pages/KioskMenu'
import OrdersReady from './pages/OrdersReady'
import AdminOrders from './pages/AdminOrders'
import AdminProducts from './pages/AdminProducts'
import AdminNewProduct from './pages/AdminNewProduct'
import AdminEditProduct from './pages/AdminEditProduct'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vistas" replace />} />
      <Route path="/vistas" element={<VistasIndex />} />
      <Route path="/vistas/kiosk" element={<KioskMenu />} />
      <Route path="/vistas/orders-ready" element={<OrdersReady />} />
      <Route path="/vistas/admin/orders" element={<AdminOrders />} />
      <Route path="/vistas/admin/products" element={<AdminProducts />} />
      <Route path="/vistas/admin/products/new" element={<AdminNewProduct />} />
      <Route path="/vistas/admin/products/:id/edit" element={<AdminEditProduct />} />
    </Routes>
  )
}
