import RootLayout from "./RootLayout";
import { createBrowserRouter } from "react-router";
import HomePage from "@/pages/index";
import StringJsesc from "@/pages/tools/string/jsesc.tsx";
import JSONFormatPage from "@/pages/tools/json/format";

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
                  menu: {
                    label: "JSON 格式化",
                    href: "/tools/json/format",
                  },
                },
              },
            ],
          },
          {
            path: "string",
            handle: { group: "字符串" },
            children: [
              {
                path: "jsesc",
                element: <StringJsesc />,
                handle: {
                  menu: {
                    label: "字符串(去)转义",
                    href: "/tools/string/jsesc",
                  },
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
