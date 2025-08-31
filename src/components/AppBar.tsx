import { useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { routesConfig } from "@/routes";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router";

type ToolItem = { label: string; href: string };

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const tools = useMemo<Record<string, ToolItem[]>>(() => {
    const map: Record<string, ToolItem[]> = {};

    // helper to traverse tree
    function walk(nodes: any[], parentGroups: string[] = []) {
      if (!nodes) return;
      for (const node of nodes) {
        const handle = (node.handle ?? {}) as any;
        const groups = [...parentGroups];
        if (handle?.group) groups.push(handle.group);

        // if node exposes tools object, merge
        if (handle?.tools && typeof handle.tools === "object") {
          Object.entries(handle.tools).forEach(([g, items]) => {
            if (!map[g]) map[g] = [];
            map[g] = map[g].concat(items as ToolItem[]);
          });
        }

        if (handle?.menu) {
          const menu = handle.menu as ToolItem;
          const group = groups.length ? groups[groups.length - 1] : "工具";
          if (!map[group]) map[group] = [];
          map[group].push(menu);
        }

        if (node.children) walk(node.children, groups);
      }
    }

    walk(routesConfig);
    return map;
  }, []);

  return (
    <AppBar position="static">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src="/icon.png" alt="Icon" width={50} height={50} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              sx={{
                ml: 1,
                mr: 5,
                display: "flex",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".1rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Toolverse
            </Typography>
          </div>
          <Box sx={{ display: "flex", alignItems: "center", ml: 2, gap: 1 }}>
            {Object.keys(tools).length === 0
              ? null
              : Object.keys(tools).map((group) => (
                  <div key={group}>
                    <Button
                      color="inherit"
                      endIcon={<ExpandMoreIcon />}
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget as HTMLElement);
                        setOpenGroup(group);
                      }}
                    >
                      {group}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={openGroup === group}
                      onClose={() => {
                        setOpenGroup(null);
                        setAnchorEl(null);
                      }}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                      {tools[group].map((item) => (
                        <MenuItem
                          key={item.href}
                          component="a"
                          href={item.href}
                          onClick={() => {
                            setOpenGroup(null);
                            setAnchorEl(null);
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
