import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Copyright from "../components/Copyright";

const theme = createTheme();

export default function Profile() {
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Outlet />
        <Copyright />
      </Container>
    </ThemeProvider>
  );
}
