import { Link } from "@mui/material";

export default function Copyright() {
  return (
    <div className="flex items-center justify-center gap-1 h-[30px] text-sm">
      Copyright ©{new Date().getFullYear()}
      <Link underline="none" target="_blank" href="https://www.seanfeng.xyz">
        SeanFeng.
      </Link>
      All rights Reserved.
    </div>
  );
}
