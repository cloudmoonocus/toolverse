import StringJsesc from "@/pages/tools/string/jsesc.tsx";

export const stringRoutes = {
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
};
