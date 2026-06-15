import { Outlet } from "react-router-dom";

import Footer from "./Footer";
import Navbar from "./Navbar";

const AppLayout = () => (
  <div className="app-frame">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppLayout;
