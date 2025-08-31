import JSONFormatPage from "@/pages/tools/json/format";
import HomePage from "@/pages/index";
import RootLayout from "./RootLayout";
import { createBrowserRouter } from "react-router";

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
        children: [
          {
            path: "json",
            handle: { group: "JSON" },
            children: [
              {
                path: "format",
                element: <JSONFormatPage />,
                handle: {
                  menu: { label: "JSON 格式化", href: "/tools/json/format" },
                },
              },
            ],
          },
        ],
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
