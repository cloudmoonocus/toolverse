import JSONFormatPage from "@/pages/tools/json/format.tsx";
import { buildRouteChildren } from "@/routes/utils.ts";
import JSONDiffPage from "@/pages/tools/json/diff.tsx";
import type { ReactNode } from "react";

const children: Array<[string, string, ReactNode]> = [
  ["format", "JSON 格式化", <JSONFormatPage />],
  ["diff", "JSON Diff", <JSONDiffPage />],
];

export const jsonRoutes = {
  path: "json",
  handle: { group: "JSON" },
  children: buildRouteChildren("/tools/json", children),
};
