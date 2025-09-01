import StringJsesc from "@/pages/tools/string/jsesc.tsx";
import type { ReactNode } from "react";
import { buildRouteChildren } from "@/routes/utils.ts";

const children: Array<[string, string, ReactNode]> = [["jsesc", "字符串(去)转义", <StringJsesc />]];

export const stringRoutes = {
  path: "string",
  handle: { group: "字符串" },
  children: buildRouteChildren("/tools/string", children),
};
