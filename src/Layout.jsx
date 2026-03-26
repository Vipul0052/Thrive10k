import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const authRoutes = ["/login", "/signup"];

export default function Layout() {
  const { pathname } = useLocation();
  const isAuth = authRoutes.includes(pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!isAuth && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!isAuth && <Footer />}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
