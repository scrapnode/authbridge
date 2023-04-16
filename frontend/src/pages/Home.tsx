import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate } from "react-router-dom";
import * as hooks from "../hooks";

export default function Home() {
  const [loading, user] = hooks.auth.useUser();

  if (!loading) {
    return user ? <Navigate to="/profile" /> : <Navigate to="/auth/login" />;
  }

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
