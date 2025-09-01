import RootLayout from "./RootLayout";
import { createBrowserRouter } from "react-router";
import HomePage from "@/pages/index";
import { jsonRoutes } from "@/routes/tools/json.tsx";
import { stringRoutes } from "@/routes/tools/string.tsx";

const routesConfig = [
  {
    path: "/",
    element: <RootLayout />,
    handle: {
      app: { name: "Toolverse" },
    },
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "tools",
        children: [jsonRoutes, stringRoutes],
      },
      {
        path: "*",
        element: <div>页面未找到</div>,
      },
    ],
  },
];

const router = createBrowserRouter(routesConfig);

export { router, routesConfig };
