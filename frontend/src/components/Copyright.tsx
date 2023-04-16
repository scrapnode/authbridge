import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function Copyright() {
  const year = new Date().getFullYear();

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      sx={{ mt: 8, mb: 4 }}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>
      {` ${year}.`}
    </Typography>
  );
}
