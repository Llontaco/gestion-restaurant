import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import Login from './pages/Login'
import Register from './pages/Register'
import VistasIndex from './pages/VistasIndex'
import KioskMenu from './pages/KioskMenu'
import OrdersReady from './pages/OrdersReady'
import AdminOrders from './pages/AdminOrders'
import AdminProducts from './pages/AdminProducts'
import AdminNewProduct from './pages/AdminNewProduct'
import AdminEditProduct from './pages/AdminEditProduct'
import AdminCategories from './pages/AdminCategories'
import AdminSettings from './pages/AdminSettings'
import MyOrders from './pages/MyOrders'

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protegidas (cualquier sesión) */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/vistas" replace />} />
        <Route path="/vistas" element={<VistasIndex />} />
        <Route path="/vistas/kiosk" element={<KioskMenu />} />
        <Route path="/vistas/my-orders" element={<MyOrders />} />
        <Route path="/vistas/orders-ready" element={<OrdersReady />} />

        {/* Solo ADMIN */}
        <Route element={<RequireAdmin />}>
          <Route path="/vistas/admin/orders" element={<AdminOrders />} />
          <Route path="/vistas/admin/products" element={<AdminProducts />} />
          <Route path="/vistas/admin/products/new" element={<AdminNewProduct />} />
          <Route path="/vistas/admin/products/:id/edit" element={<AdminEditProduct />} />
          <Route path="/vistas/admin/categories" element={<AdminCategories />} />
          <Route path="/vistas/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
