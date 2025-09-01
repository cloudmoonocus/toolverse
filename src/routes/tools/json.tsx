import JSONFormatPage from "@/pages/tools/json/format.tsx";

export const jsonRoutes = {
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
};
