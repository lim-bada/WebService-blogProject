import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Write from "./pages/Write";
import Read from "./pages/Read";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout";
import UnauthenticatedLayout from "./layouts/UnauthenticatedLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/read/:id" element={<Read />} />

        {/* ✅ 로그인한 사람은 /auth 못 들어가게 */}
        <Route element={<UnauthenticatedLayout />}>
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* ✅ 로그인 안 한 사람은 /write 못 들어가게 */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/write" element={<Write />} />
        </Route>
      </Route>
    </Routes>
  );
}
