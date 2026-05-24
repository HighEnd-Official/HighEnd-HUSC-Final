import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Auth & Theme ──────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

// ── Public pages ──────────────────────────────────────────────────────────
import Home         from "./User/Pages/Home";
import About        from "./User/Pages/About";
import Contact      from "./User/Pages/Contact";

// ── Collections ───────────────────────────────────────────────────────────
import CollectionLayout from "./User/Pages/Collection/CollectionLayout";
import AllCollections  from "./User/Pages/Collection/AllCollections";
import Blouse          from "./User/Pages/Collection/Blouse";
import Dress           from "./User/Pages/Collection/Dress";
import Shirt           from "./User/Pages/Collection/Shirt";

// ── Auth pages (guest-only) ───────────────────────────────────────────────
import SingIn       from "./User/Pages/SingIn";
import Registration from "./User/Pages/Registration";

// ── Protected user pages ──────────────────────────────────────────────────
import Payment      from "./User/Pages/Payment";
import BankDeposit  from "./User/Pages/BankDeposite";

// ── Misc ──────────────────────────────────────────────────────────────────
import Unauthorized from "./User/Pages/Unauthorized";

// ── Admin ─────────────────────────────────────────────────────────────────
import AdminLayout  from "./admin/AdminLayout";
import Dashboard    from "./admin/pages/Dashboard";
import Products     from "./admin/pages/Products";
import Orders       from "./admin/pages/Orders";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <CartProvider>
          <Routes>

            {/* ── Public routes (anyone can view) ── */}
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<CollectionLayout />}>
              <Route index element={<AllCollections />} />
              <Route path="blouse" element={<Blouse />} />
              <Route path="dress" element={<Dress />} />
              <Route path="shirt" element={<Shirt />} />
            </Route>
            <Route path="/about"      element={<About />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ── Guest-only routes (redirect away if already logged in) ── */}
            <Route element={<GuestRoute />}>
              <Route path="/signin"  element={<SingIn />} />
              <Route path="/singin"  element={<SingIn />} />  {/* legacy alias */}
              <Route path="/signup"  element={<Registration />} />
              <Route path="/register" element={<Registration />} />
            </Route>

            {/* ── Protected: any authenticated user ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/payment"      element={<Payment />} />
              <Route path="/bank-deposit" element={<BankDeposit />} />
            </Route>

            {/* ── Protected: Admin + SuperAdmin only ── */}
            <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index       element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders"   element={<Orders />} />
              </Route>
            </Route>

            {/* ── 404 fallback ── */}
            <Route path="*" element={<Unauthorized />} />

          </Routes>
          </CartProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;