import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

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
import CollectionCategoryPage from "./User/Pages/Collection/CollectionCategoryPage";
import Blouse          from "./User/Pages/Collection/Blouse";
import CropTops        from "./User/Pages/Collection/CropTops";
import Dress           from "./User/Pages/Collection/Dress";
import ShortKurtis     from "./User/Pages/Collection/ShortKurtis";
import LongKurtis      from "./User/Pages/Collection/LongKurtis";
import KurtiSets       from "./User/Pages/Collection/KurtiSets";
import Skirts          from "./User/Pages/Collection/Skirts";
import Pants           from "./User/Pages/Collection/Pants";
import Lehenga         from "./User/Pages/Collection/Lehenga";
import Footwear        from "./User/Pages/Collection/Footwear";
import Accessories     from "./User/Pages/Collection/Accessories";
import Shirt           from "./User/Pages/Collection/Shirt";

// ── Auth pages (guest-only) ───────────────────────────────────────────────
import SingIn       from "./User/Pages/SingIn";
import Registration from "./User/Pages/Registration";

// ── Protected user pages ──────────────────────────────────────────────────
import Payment      from "./User/Pages/Payment";
import BankDeposit  from "./User/Pages/BankDeposite";
import MyOrders     from "./User/Pages/MyOrders";
import Profile      from "./User/Pages/Profile";

// ── Misc ──────────────────────────────────────────────────────────────────
import Unauthorized from "./User/Pages/Unauthorized";

// ── Admin ─────────────────────────────────────────────────────────────────
import AdminLayout  from "./admin/AdminLayout";
import Dashboard    from "./admin/pages/Dashboard";
import Products     from "./admin/pages/Products";
import Orders       from "./admin/pages/Orders";
import Messages     from "./admin/pages/Messages";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    const handlePageShow = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
          <Routes>

            {/* ── Public routes (anyone can view) ── */}
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<CollectionLayout />}>
              <Route
                index
                element={
                  <CollectionCategoryPage
                    categoryKey="all"
                    eyebrow="Archive"
                    title="All Collections"
                    intro="Browse every visible product from the full HUES collection."
                    emptyTitle="No products available yet"
                    emptyBody="Add products in the admin dashboard and they will appear here automatically."
                  />
                }
              />
              <Route path="blouse" element={<Blouse />} />
              <Route path="crop-tops" element={<CropTops />} />
              <Route path="dress" element={<Dress />} />
              <Route path="short-kurtis" element={<ShortKurtis />} />
              <Route path="long-kurtis" element={<LongKurtis />} />
              <Route path="kurti-sets" element={<KurtiSets />} />
              <Route path="skirts" element={<Skirts />} />
              <Route path="pants" element={<Pants />} />
              <Route path="lehenga" element={<Lehenga />} />
              <Route path="footwear" element={<Footwear />} />
              <Route path="accessories" element={<Accessories />} />
              <Route path="shirt" element={<Shirt />} />
            </Route>
            <Route path="/about"      element={<About />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/payment"      element={<Payment />} />
            <Route path="/bank-deposit" element={<BankDeposit />} />
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
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile"      element={<Profile />} />
            </Route>

            {/* ── Protected: Admin + SuperAdmin only ── */}
            <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index       element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders"   element={<Orders />} />
                <Route path="messages" element={<Messages />} />
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
