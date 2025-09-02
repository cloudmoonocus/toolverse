import { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import DataObjectIcon from "@mui/icons-material/DataObject";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CodeIcon from "@mui/icons-material/Code";
import CategoryIcon from "@mui/icons-material/Category";
import { routesConfig } from "@/routes";

type ToolItem = { label: string; href: string };

function collectTools() {
  const map: Record<string, ToolItem[]> = {};
  function walk(nodes: any[], parentGroups: string[] = []) {
    if (!nodes) return;
    for (const node of nodes) {
      const handle = (node.handle ?? {}) as any;
      const groups = [...parentGroups];
      if (handle?.group) groups.push(handle.group);

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
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const tools = useMemo(() => collectTools(), []);

  const groups = useMemo(
    () =>
      Object.entries(tools)
        .map(([k, v]) => ({ group: k, items: v }))
        .sort((a, b) => a.group.localeCompare(b.group, "zh-Hans-CN")),
    [tools],
  );

  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (it) => it.label.toLowerCase().includes(q.toLowerCase()) || it.href.toLowerCase().includes(q.toLowerCase()),
          ),
        }))
        .filter((g) => g.items.length > 0 || q === ""),
    [groups, q],
  );

  function groupIcon(name: string) {
    const n = name.toLowerCase();
    if (/(json|data)/.test(n)) return <DataObjectIcon fontSize="small" />;
    if (/(text|string)/.test(n)) return <TextFieldsIcon fontSize="small" />;
    if (/(code|dev|script)/.test(n)) return <CodeIcon fontSize="small" />;
    if (/(all|misc|other|工具)/.test(n)) return <AppsOutlinedIcon fontSize="small" />;
    return <CategoryIcon fontSize="small" />;
  }

  return (
    <div className="no-header-screen p-0!">
      {/* Hero 区域 */}
      <Box
        className="border-b border-gray-200 bg-gradient-to-br from-[#FFF1F6] via-[#F3F9FF] to-[#E6FFFB]"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.02em" }}>
              Toolverse
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 720, mx: "auto" }}>
              轻量、开箱即用的在线工具集合。聚焦 JSON、文本与编码小工具，开快车不绕路。
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 720, mx: "auto" }}>
            <TextField
              fullWidth
              size="medium"
              variant="outlined"
              placeholder="搜索工具"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {q ? (
                      <Button size="small" onClick={() => setQ("")}>
                        清除
                      </Button>
                    ) : null}
                  </InputAdornment>
                ),
              }}
              sx={{
                backdropFilter: "saturate(140%) blur(6px)",
                bgcolor: "background.paper",
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* 内容区 */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {filtered.length === 0 ? (
          <Card sx={{ maxWidth: 680, mx: "auto" }} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                没有匹配的结果
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                换个关键词试试，或清空搜索查看全部工具。
              </Typography>
              <Button onClick={() => setQ("")} variant="contained">
                清空搜索
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((g) => (
              <Card
                key={g.group}
                variant="outlined"
                className="transition-transform duration-200 hover:-translate-y-0.5"
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {groupIcon(g.group)}
                      <Typography variant="h6">{g.group}</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <div className="flex flex-col gap-1.5">
                    {g.items.map((it) => (
                      <a key={it.href} href={it.href} className="no-underline text-inherit">
                        <Box
                          className="hover:bg-gray-50 dark:hover:bg-white/5"
                          sx={{
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography>{it.label}</Typography>
                          <Chip size="small" label="打开" variant="outlined" />
                        </Box>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
