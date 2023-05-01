import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import configs from "@configs";

interface Form {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ServerError {
  message: string;
  request_id: string;
}

const schema = yup
  .object({
    name: yup.string().required("Name could not be blank"),
    email: yup
      .string()
      .required("Email could not be blank")
      .email("Invalid email format"),
    password: yup
      .string()
      .min(6, "Please choose stronger password with more than 6 characters")
      .required("Password could not be blank"),
    confirmPassword: yup
      .string()
      .required("Password could not be blank")
      .oneOf([yup.ref("password"), ""], "Passwords are not matched"),
  })
  .required();

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: yupResolver(schema),
  });
  const mutation = useMutation<any, any, Form>(
    async ({ name, email, password }) => {
      const uri = new URL(configs.backend.endpoint);
      uri.pathname = "/account";

      const res = await fetch(uri, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body: ServerError = await res.json();
        return Promise.reject(new Error(body.message));
      }
      return res.json();
    }
  );

  const onSubmit: SubmitHandler<Form> = (data) => mutation.mutateAsync(data);

  if (mutation.isError) alert(mutation.error);
  console.log(mutation);

  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <PeopleOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign up
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
        <TextField
          autoFocus
          margin="normal"
          required
          fullWidth
          id="name"
          label="Name"
          autoComplete="name"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          autoComplete="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="Password"
          type="password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={mutation.isLoading}
        >
          Register
        </Button>

        <Grid container>
          <Grid item xs textAlign="center">
            <Link component={RouterLink} to="/auth/login" variant="body2">
              Cancel
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
