import { useEffect, useRef, useState } from "react";
import { Toast, useToast } from "@/components/Toast";
import parseJson, { JSONError } from "parse-json";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CompressIcon from "@mui/icons-material/Compress";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import type { Monaco, MonacoNS } from "@/types/monaco";

const initialLeft = `{"name":"Toolverse","items":[{"id":1,"title":"JSON"}],"active":true}`;
const initialRight = `{"name":"Toolverse","items":[{"id":1,"title":"JSON"},{"id":2,"title":"Formatter"}],"active":false}`;

export default function JSONDiffPage() {
  const { toast, showToast, hideToast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const diffEditorRef = useRef<MonacoNS.editor.IStandaloneDiffEditor | null>(null);
  const leftModelRef = useRef<MonacoNS.editor.ITextModel | null>(null);
  const rightModelRef = useRef<MonacoNS.editor.ITextModel | null>(null);

  const [fontSize, setFontSize] = useState(16);
  const [sideBySide, setSideBySide] = useState(true);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const m = (await import("monaco-editor")) as unknown as Monaco;
      if (disposed) return;
      monacoRef.current = m;

      // 预格式化初始文本
      const pretty = (s: string) => {
        try {
          return JSON.stringify(JSON.parse(s), null, 2);
        } catch {
          return s;
        }
      };

      leftModelRef.current = m.editor.createModel(pretty(initialLeft), "json");
      rightModelRef.current = m.editor.createModel(pretty(initialRight), "json");

      diffEditorRef.current = m.editor.createDiffEditor(containerRef.current!, {
        renderSideBySide: sideBySide,
        originalEditable: true,
        readOnly: false,
        automaticLayout: true,
        theme: "vs",
        minimap: { enabled: false },
        wordWrap: "on",
      });

      diffEditorRef.current.setModel({
        original: leftModelRef.current!,
        modified: rightModelRef.current!,
      });

      // 设置字号
      diffEditorRef.current.getOriginalEditor().updateOptions({ fontSize });
      diffEditorRef.current.getModifiedEditor().updateOptions({ fontSize });
    })();

    return () => {
      disposed = true;
      try {
        diffEditorRef.current?.dispose();
        leftModelRef.current?.dispose();
        rightModelRef.current?.dispose();
        monacoRef.current?.editor.getModels().forEach((m) => m.dispose());
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!diffEditorRef.current) return;
    diffEditorRef.current.updateOptions({ renderSideBySide: sideBySide });
  }, [sideBySide]);

  useEffect(() => {
    if (!diffEditorRef.current) return;
    diffEditorRef.current.getOriginalEditor().updateOptions({ fontSize });
    diffEditorRef.current.getModifiedEditor().updateOptions({ fontSize });
  }, [fontSize]);

  const withGuard =
    <T extends any[], R>(fn: (...args: T) => R) =>
    (...args: T): R | void => {
      if (!diffEditorRef.current || !leftModelRef.current || !rightModelRef.current) return;
      return fn(...args);
    };

  const getLeft = () => leftModelRef.current!.getValue();
  const setLeft = (t: string) => leftModelRef.current!.setValue(t);
  const getRight = () => rightModelRef.current!.getValue();
  const setRight = (t: string) => rightModelRef.current!.setValue(t);

  const formatSide = (side: "left" | "right") => {
    const src = side === "left" ? getLeft() : getRight();
    if (!src.trim()) return;
    try {
      const obj = parseJson(src);
      const pretty = JSON.stringify(obj, null, 2);
      side === "left" ? setLeft(pretty) : setRight(pretty);
    } catch (e: any) {
      const msg = e instanceof JSONError ? e.message : e?.message || "未知错误";
      showToast(`${side === "left" ? "左侧" : "右侧"} JSON 解析失败：${msg}`, "error");
    }
  };

  const minifySide = (side: "left" | "right") => {
    const src = side === "left" ? getLeft() : getRight();
    if (!src.trim()) return;
    try {
      const obj = parseJson(src);
      const minified = JSON.stringify(obj);
      side === "left" ? setLeft(minified) : setRight(minified);
    } catch (e: any) {
      const msg = e instanceof JSONError ? e.message : e?.message || "未知错误";
      showToast(`${side === "left" ? "左侧" : "右侧"} JSON 解析失败：${msg}`, "error");
    }
  };

  const handleFormat = withGuard(() => {
    formatSide("left");
    formatSide("right");
    showToast("已格式化左右 JSON", "success");
  });

  const handleMinify = withGuard(() => {
    minifySide("left");
    minifySide("right");
    showToast("已压缩左右 JSON", "success");
  });

  const handleSwap = withGuard(() => {
    const l = getLeft();
    const r = getRight();
    setLeft(r);
    setRight(l);
    showToast("已交换左右内容", "info");
  });

  const handleClear = withGuard(() => {
    setLeft("");
    setRight("");
  });

  const downloadSide = withGuard((side?: "left" | "right") => {
    const text = side === "left" ? getLeft() : getRight();
    try {
      const blob = new Blob([text], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = side === "left" ? "left.json" : "right.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`开始下载 ${side === "left" ? "left.json" : "right.json"}`, "success");
    } catch {
      showToast("下载失败", "error");
    }
  });

  return (
    <div className="no-header-screen flex flex-col gap-4">
      <div className="text-xl font-bold">JSON Diff</div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outlined" onClick={handleFormat}>
            格式化
          </Button>
          <Button variant="outlined" startIcon={<CompressIcon />} onClick={handleMinify}>
            压缩
          </Button>
          <Button variant="outlined" startIcon={<SwapHorizIcon />} onClick={handleSwap}>
            交换
          </Button>
          <Button variant="outlined" color="warning" startIcon={<CleaningServicesIcon />} onClick={handleClear}>
            清空
          </Button>
          <TextField
            label="字号"
            type="number"
            size="small"
            value={fontSize}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v)) return;
              setFontSize(Math.min(48, Math.max(8, v)));
            }}
            slotProps={{ htmlInput: { min: 8, max: 48 } }}
          />
          <Button variant="outlined" onClick={() => setSideBySide((v) => !v)}>
            {sideBySide ? "内联" : "并排"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="contained" onClick={() => downloadSide("left")}>
            下载左
          </Button>
          <Button variant="contained" onClick={() => downloadSide("right")}>
            下载右
          </Button>
        </div>
      </div>
      <div className="flex-1 border-2 p-2 border-gray-300 rounded overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
