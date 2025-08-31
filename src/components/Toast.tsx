import { useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface ToastProps {
  toast: ToastState;
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
}

export function Toast({
  toast,
  onClose,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: "bottom", horizontal: "center" },
}: ToastProps) {
  return (
    <Snackbar open={toast.open} autoHideDuration={autoHideDuration} onClose={onClose} anchorOrigin={anchorOrigin}>
      <Alert onClose={onClose} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
}

// 自定义 Hook 来管理 Toast 状态
export function useToast(initialState: ToastState = { open: false, message: "", severity: "info" }) {
  const [toast, setToast] = useState<ToastState>(initialState);

  const showToast = useCallback((message: string, severity: ToastState["severity"] = "info") => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    setToast,
  };
}
