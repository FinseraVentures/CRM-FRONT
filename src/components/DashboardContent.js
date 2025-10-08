import React, { useEffect, useState } from "react";
import { apiUrl } from "./LoginSignup";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  useTheme,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import LineChart from "../components/LineChart";
import Loader from "./Loader";

const userSession = JSON.parse(localStorage.getItem("userSession"));

const DashboardContent = () => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#90caf9" : "#1976d2" },
      secondary: { main: darkMode ? "#f48fb1" : "#d32f2f" },
    },
  });

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (userSession?.user_id) {
      fetchDashboardData(userSession);
      fetchAnalyticsData();
    } else {
      console.error("User session not found.");
      setLoading(false);
    }
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch("http://localhost:3001/analytics/monthly-users");
      const data = await res.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to fetch GA4 data:", error);
    }
  };

  const fetchDashboardData = async (session) => {
    try {
      const isAdmin = ["admin", "dev", "senior admin", "srdev"].includes(session.user_role);
      const bookingUrl = isAdmin
        ? `${apiUrl}/booking/all`
        : `${apiUrl}/user/bookings/${session.user_id}`;

      const [bookingsRes, usersRes] = await Promise.all([
        fetch(bookingUrl, {
          headers: {
            "Content-Type": "application/json",
            authorization: session.token,
          },
        }),
        fetch(`${apiUrl}/user/all`, {
          headers: {
            "Content-Type": "application/json",
            authorization: session.token,
          },
        }),
      ]);

      if (!bookingsRes.ok || !usersRes.ok) throw new Error("Failed API call");

      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();

      const bookings = bookingsData.Allbookings || bookingsData;
      const today = getTodayDate();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let bookingCount = 0;
      let currentMonthRevenue = 0;
      let todayRevenueAmt = 0;
      const sortedBookings = [];

      for (const booking of bookings) {
        bookingCount++;

        const paymentDate = new Date(booking.payment_date);

        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          currentMonthRevenue += (booking.term_1 || 0) + (booking.term_2 || 0) + (booking.term_3 || 0);
        }

        if (booking.createdAt?.split("T")[0] === today) {
          todayRevenueAmt += (booking.term_1 || 0) + (booking.term_2 || 0) + (booking.term_3 || 0);
        }

        sortedBookings.push(booking);
      }

      const recent = sortedBookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 7);

      setTotalBookings(bookingCount);
      setTotalRevenue(currentMonthRevenue);
      setTodayRevenue(todayRevenueAmt);
      setRecentBookings(recent);
      setTotalUsers(usersData.Users?.length || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader />
      </div>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ p: 2 }}>
        {/* Theme Toggle */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Typography>
          <Switch checked={darkMode} onChange={toggleDarkMode} inputProps={{ "aria-label": "theme toggle" }} />
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        {/* Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Bookings</Typography>
                <Typography variant="h4">{totalBookings}</Typography>
                <Typography>Your Total Bookings</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{totalUsers}</Typography>
                <Typography>CRM users this month</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Revenue {new Date().toLocaleString("default", { month: "long" })}
                </Typography>
                <Typography variant="h4">{totalRevenue.toLocaleString()} INR</Typography>
                <Typography>Total Revenue</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Today's Revenue</Typography>
                <Typography variant="h4">{todayRevenue.toLocaleString()} INR</Typography>
                <Typography>Revenue from Today's Bookings</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <LineChart data={analyticsData} label="Website Visits" />
                <Typography variant="h6">Monthly Website Visits (GA4)</Typography>
              </CardContent>
            </Card>
          </Grid>

          {["Daily Sales", "Completed Tasks"].map((title, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card>
                <CardContent>
                  <LineChart />
                  <Typography variant="h6">{title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Bookings */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Recent Bookings</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell>BDM Name</TableCell>
                  <TableCell>Booking Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.company_name}</TableCell>
                    <TableCell>{booking.bdm}</TableCell>
                    <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardContent;
