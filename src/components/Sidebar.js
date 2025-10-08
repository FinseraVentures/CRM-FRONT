import React, { useMemo, useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../assets/whitelogo.png';
import axios from 'axios';
import { apiUrl } from './LoginSignup';


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  const userSession = useMemo(
    () => JSON.parse(localStorage.getItem('userSession')),
    []
  );

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}/employee/profile/${userSession?.user_id}`,
          { headers: { authorization: userSession?.token } }
        );
        if (res.data?.profile) setHasProfile(true);
      } catch {
        setHasProfile(false);
      }
    };

    if (userSession?.user_id) fetchProfileStatus();
  }, [userSession?.user_id]);

  const menuItems = useMemo(() => {
    const items = [];

    // only add base menu if not HR
    if (userSession?.user_role !== 'HR') {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'New Booking', icon: <AddCircleIcon />, path: '/dashboard/new-booking' },
        { text: 'All Booking', icon: <HistoryIcon />, path: '/dashboard/history' },
        { text: 'Proforma Invoice', icon: <HistoryIcon />, path: '/dashboard/ProformaInvoice' },
        { text: 'Agreements Generator', icon: <HistoryIcon />, path: '/dashboard/Agreementsgenerator' }
      );
    }

    // Role-specific menu items
    if (userSession?.user_role === 'dev') {
      items.push({
        text: 'Manage Services',
        icon: <EditIcon />,
        path: '/dashboard/addservices',
      });
    } else if (userSession?.user_role === 'srdev') {
      items.push(
        {
          text: 'Manage User',
          icon: <PersonAddIcon />,
          path: '/dashboard/removeuser',
        },
        {
          text: 'Manage Services',
          icon: <EditIcon />,
          path: '/dashboard/addservices',
        },
        { text: 'Trash', icon: <DeleteIcon />, path: '/dashboard/trash' }
      );
    } else if (userSession?.user_role === 'HR') {
      items.push(
        {
          text: 'Manage Employees',
          icon: <PersonAddIcon />,
          path: '/dashboard/manage-employees',
        },
        // {
        //   text: 'Manage Salary',
        //   icon: <EditIcon />,
        //   path: '/dashboard/manage-salary',
        // },
        // {
        //   text: 'Attendance',
        //   icon: <HistoryIcon />,
        //   path: '/dashboard/attendance',
        // },
        // {
        //   text: 'Employee Directory',
        //   icon: <HistoryIcon />,
        //   path: '/dashboard/employee-directory',
        // }
      );
    }

    // Profile menu item
    items.push(
      hasProfile
        ? { text: 'My Profile', icon: <PersonAddIcon />, path: '/dashboard/my-profile' }
        : { text: 'Create Profile', icon: <PersonAddIcon />, path: '/dashboard/create-profile' }
    );

    return items;
  }, [userSession?.user_role, hasProfile]);

  return (
    <Box>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer}
        sx={{
          display: { xs: 'block', sm: 'none' },
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 1301,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#191b47',
            color: '#fff',
          },
        }}
      >
        <SidebarContent
          onLogout={handleLogout}
          toggleDrawer={toggleDrawer}
          menuItems={menuItems}
          userSession={userSession}
        />
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#191b47',
            color: '#fff',
          },
        }}
      >
        <SidebarContent
          onLogout={handleLogout}
          menuItems={menuItems}
          userSession={userSession}
        />
      </Drawer>
    </Box>
  );
};

const SidebarContent = ({ onLogout, toggleDrawer, menuItems, userSession }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <img
        src={logo}
        alt="Dashboard Logo"
        style={{ width: '150px', marginBottom: '20px' }}
      />
      <Typography variant="h6" align="center">
        Welcome, {userSession?.name || 'User'}
      </Typography>
    </Box>

    <List sx={{ flexGrow: 1 }}>
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.text}
          style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#ffcc00' : '#fff',
          })}
          onClick={toggleDrawer}
        >
          <ListItem button sx={{ '&:hover': { backgroundColor: '#3949ab' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        </NavLink>
      ))}
    </List>

    <Divider sx={{ my: 1, backgroundColor: '#3949ab' }} />

    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Button
        variant="contained"
        sx={{ backgroundColor: '#8e1822' }} // Custom button color
        startIcon={<LogoutIcon />}
        onClick={onLogout}
        fullWidth
      >
        Logout
      </Button>
    </Box>
  </Box>
);

export default Sidebar;
