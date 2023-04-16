import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LayoutDefault from "./layouts/Default";
import LayoutApp from "./layouts/App";
import PageHome from "./pages/Home";
import PageLogin from "./pages/Login";
import PageSignup from "./pages/Signup";
import PageForgotPassword from "./pages/ForgotPassword";

export default function SignIn() {
  return (
    <Routes>
      <Route element={<LayoutDefault />}>
        <Route path="/" element={<PageHome />} />
      </Route>
      <Route path="/auth" element={<LayoutApp />}>
        <Route path="login" element={<PageLogin />} />
      </Route>
      <Route path="/account" element={<LayoutApp />}>
        <Route path="signup" element={<PageSignup />} />
      </Route>
      <Route path="/password" element={<LayoutApp />}>
        <Route path="forgot" element={<PageForgotPassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
