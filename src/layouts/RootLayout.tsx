import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout() {
  return (
    <div className="page">
      <Header />
      <main className="page__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
