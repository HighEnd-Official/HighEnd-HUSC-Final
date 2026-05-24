import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        ::selection { background: #c07fa5; color: #4a193a; }
      `}</style>

      <div className="min-h-screen flex flex-col bg-[#fff8f8] dark:bg-zinc-950 transition-colors duration-300">
        <NavBar />

        <main className="flex-grow flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            {/* Decorative line */}
            <div className="w-12 h-px bg-[#854c6f] mx-auto mb-8" />

            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#854c6f] mb-4">
              Error 403
            </p>

            <h1
              className="text-4xl md:text-5xl font-light font-serif text-[#1f1a1d] dark:text-white mb-6 tracking-tight"
              style={{ lineHeight: 1.1 }}
            >
              Access Restricted
            </h1>

            <p className="text-[15px] text-[#504349] dark:text-zinc-400 leading-relaxed mb-10">
              {user
                ? `Your account (${user.role}) does not have permission to view this page.`
                : "You must be signed in to view this page."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="px-8 py-3 bg-[#1f1a1d] dark:bg-[#854c6f] text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#854c6f] dark:hover:bg-[#c07fa5] transition-all duration-300"
              >
                Back to Home
              </Link>
              {!user && (
                <Link
                  to="/signin"
                  className="px-8 py-3 border border-[#1f1a1d] dark:border-zinc-600 text-[#1f1a1d] dark:text-zinc-200 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#854c6f] hover:border-[#854c6f] hover:text-white transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="w-12 h-px bg-[#854c6f] mx-auto mt-8" />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
