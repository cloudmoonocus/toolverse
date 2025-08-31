import ResponsiveAppBar from "@/components/AppBar";
import Copyright from "@/components/Copyright";
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <>
      <ResponsiveAppBar />
      <Outlet />
      <Copyright />
    </>
  );
}
