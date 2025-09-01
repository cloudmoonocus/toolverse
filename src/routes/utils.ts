import type { ReactNode } from "react";

export function buildRouteChildren(basePath: string, children: [string, string, ReactNode][]) {
  return children.map((item) => ({
    path: item[0],
    element: item[2],
    handle: { menu: { label: item[1], href: `${basePath}/${item[0]}` } },
  }));
}
