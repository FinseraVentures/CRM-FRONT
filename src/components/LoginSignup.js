import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Select,
  MenuItem,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useNavigate } from "react-router-dom";
import lightLogo from "../assets/BG.png";
import darkLogo from "../assets/whitelogo.png";

export const apiUrl = process.env.REACT_APP_API_URL;

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f6cfb5",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
    },
  },
});

const LoginSignup = ({ onLoginSuccess }) => {
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    userrole: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (session) {
      const currentTime = Date.now();
      const loginTime = session.loginTime;
      if (currentTime - loginTime >= 20 * 60 * 60 * 1000) {
        logoutUser();
      }
    }
  }, []);

  const validateForm = () => {
    let errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (isActive && !formData.name) {
      errors.name = "Name is required for registration";
    }

    if (isActive && !formData.userrole) {
      errors.userrole = "Role is required for registration";
    }

    return errors;
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleRegisterClick = () => {
    setIsActive(true);
    setFormErrors({});
    setFormData({ email: "", password: "", name: "", userrole: "" });
  };

  const handleLoginClick = () => {
    setIsActive(false);
    setFormErrors({});
    setFormData({ email: "", password: "", name: "", userrole: "" });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      isActive ? await registerUser() : await loginUser();
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormErrors({ email: data.message || "Registration failed" });
        setSnackbar({
          open: true,
          message: data.message || "Registration failed",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Registration successful!",
          severity: "success",
        });
        setFormData({ email: "", password: "", name: "", userrole: "" });
        setIsActive(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const loginUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setFormErrors({ login: data.message || "Login failed" });
        setSnackbar({
          open: true,
          message: data.message || "Login failed",
          severity: "error",
        });
      } else {
        const { token, user } = data;
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            token,
            user_id: user._id,
            name: user.name,
            email: user.email,
            user_role: user.user_role,
            loginTime: Date.now(),
          })
        );
        localStorage.setItem("isAuthenticated", "true");
        setSnackbar({
          open: true,
          message: "Login successful!",
          severity: "success",
        });
        onLoginSuccess();
        navigate("/dashboard");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const logoutUser = () => {
    localStorage.removeItem("userSession");
    localStorage.removeItem("isAuthenticated");
    setSnackbar({
      open: true,
      message: "Session expired. Logging out...",
      severity: "info",
    });
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            backdropFilter: "blur(12px)",
            backgroundColor:
              theme === "light"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(0, 0, 0, 0.8)",
            borderRadius: 2,
            boxShadow: 3,
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <img
              src={theme === "light" ? lightLogo : darkLogo}
              alt="Logo"
              style={{ height: 150 }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h4">
              {isActive ? "Sign Up" : "Sign In"}
            </Typography>
            <IconButton onClick={handleThemeToggle}>
              {theme === "light" ? (
                <DarkModeRoundedIcon />
              ) : (
                <LightModeRoundedIcon />
              )}
            </IconButton>
          </Box>

          <form onSubmit={handleSubmit}>
            {isActive && (
              <>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                />
                <Select
                  name="userrole"
                  label="Role"
                  margin="normal"
                  value={formData.userrole}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="SELECT USER ROLE" disabled>
                    SELECT USER ROLE
                  </MenuItem>
                  <MenuItem value="bdm">BDM</MenuItem>
                  <MenuItem value="admin">ADMIN</MenuItem>
                  <MenuItem value="senior admin">SENIOR ADMIN</MenuItem>
                  <MenuItem value="dev">DEV</MenuItem>
                </Select>
              </>
            )}
            <TextField
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!formErrors.password}
              helperText={formErrors.password}
            />

            {formErrors.login && (
              <Typography color="error" variant="body2">
                {formErrors.login}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: '#191b47',
                '&:hover': {
                  backgroundColor: '#14162e',
                }
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : isActive ? "Register" : "Sign In"}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>or</Divider>
          <Typography align="center">
            {isActive ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button onClick={isActive ? handleLoginClick : handleRegisterClick}>
              {isActive ? "Sign In" : "Sign Up"}
            </Button>
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default LoginSignup;
