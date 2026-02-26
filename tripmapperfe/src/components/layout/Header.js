import React from "react";
import { Group, Anchor, Text, Box, Button } from "@mantine/core";
import { useMediaQuery, useHover } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconMapPin,
  IconCategory,
  IconLogin,
  IconDoorEnter,
  IconBus,
} from "@tabler/icons-react";
import { useAuthContext } from "../../context/AuthContext";
import Sidebar from "./Sidebar";

const Header = () => {
  const small = useMediaQuery("(max-width: 768px)");
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const { hovered, ref } = useHover();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  }

  return (
    <Box
      h={60}
      px="md"
      bg="gray.0"
      style={{
        borderBottom: "1px solid #e6e6e6",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
        <Group spacing="sm">
          <Box
            bg="green.6"
            c="white"
            px="sm"
            py="xs"
            style={{
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 8,
            }}
          >
            Trip-Mapper
          </Box>

          {!small && (
            <Group spacing="xs">
              <Anchor
                component={Link}
                to="/"
                c="gray.8"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconHome size={16} style={{ marginRight: 6 }} /> Home
              </Anchor>

              <Anchor
                component={Link}
                to="/pins"
                c="gray.8"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconMapPin size={16} style={{ marginRight: 6 }} /> Pins
              </Anchor>

              <Anchor
                component={Link}
                to="/trips"
                c="gray.8"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconBus size={16} style={{ marginRight: 6 }} /> Trips
              </Anchor>

              <Anchor
                component={Link}
                to="/categories"
                c="gray.8"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconCategory size={16} style={{ marginRight: 6 }} /> Categories
              </Anchor>
            </Group>
          )}
          {small && <Sidebar />}
        </Group>
        

        <Group spacing="xs" align="center" style={{ marginLeft: "auto" }}>
          {!small && (
            isAuthenticated ? (
              <>
                <Text c="dimmed">Welcome, <Anchor ref={ref}
                  component={Link}
                  to="/account"
                  c={hovered ? 'blue' : 'dark.2'} 
                   {...(hovered ? { style: { cursor: "pointer", textDecoration: 'underline', fontWeight: "bold" } } : { style: { fontWeight: "bold" } })}
                  >{user.knownAs}</Anchor></Text>
                <Button color="red" variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Anchor
                  component={Link}
                  to="/login"
                  c="green.6"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <IconLogin size={16} style={{ marginRight: 6 }} /> Log in
                </Anchor>
                <Anchor
                  component={Link}
                  to="/register"
                  c="green.6"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <IconDoorEnter size={16} style={{ marginRight: 6 }} /> Register
                </Anchor>
              </>
            )
          )}
        </Group>
      </div>
    </Box>
  );
};

export default Header;
