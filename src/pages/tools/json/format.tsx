import { useState, useRef, useEffect } from "react";
import { useDebounceEffect } from "ahooks";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CompressIcon from "@mui/icons-material/Compress";
import type { Monaco, MonacoNS } from "@/types/monaco";
import { Toast, useToast } from "@/components/Toast";
import parseJson, { JSONError } from "parse-json";
import { JSONPath } from "jsonpath-plus";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const initialJSON = `{"name":"Toolverse","items":[{"id":1,"title":"JSON"},{"id":2,"title":"Formatter"}],"active":true}`;

export default function JSONFormatPage() {
  const { toast, showToast, hideToast } = useToast();
  const [fontSize, setFontSize] = useState(16);
  const [rawContent, setRawContent] = useState<string>(initialJSON);
  const [jsonPath, setJsonPath] = useState<string>("$");
  const [jsonPathResult, setJsonPathResult] = useState<string>("");
  const [isJsonPathDialogOpen, setJsonPathDialogOpen] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement | null>(null);
  const outputContainerRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const inputEditorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const outputEditorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const changeListenerRef = useRef<MonacoNS.IDisposable | null>(null);

  // 动态创建编辑器
  useEffect(() => {
    let disposed = false;
    (async () => {
      const m = await import("monaco-editor");
      if (disposed) return;
      monacoRef.current = m as unknown as Monaco;
      inputEditorRef.current = m.editor.create(inputContainerRef.current!, {
        value: initialJSON,
        language: "json",
        automaticLayout: true,
        minimap: { enabled: false },
        theme: "vs",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        lineNumbers: "on",
        lineNumbersMinChars: 0,
        fontSize,
      });
      outputEditorRef.current = m.editor.create(outputContainerRef.current!, {
        value: "",
        language: "json",
        automaticLayout: true,
        minimap: { enabled: false },
        theme: "vs",
        readOnly: true,
        wordWrap: "on",
        lineNumbers: "on",
        lineNumbersMinChars: 0,
        fontSize,
      });
      changeListenerRef.current = inputEditorRef.current.onDidChangeModelContent(() => {
        setRawContent(inputEditorRef.current!.getValue());
      });
    })();

    return () => {
      disposed = true;
      inputEditorRef.current?.dispose();
      outputEditorRef.current?.dispose();
      monacoRef.current?.editor.getModels().forEach((model) => model.dispose());
      if (changeListenerRef.current) {
        changeListenerRef.current.dispose();
        changeListenerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputEditorRef.current) {
      inputEditorRef.current.updateOptions({ fontSize });
    }
    if (outputEditorRef.current) {
      outputEditorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  useDebounceEffect(
    () => {
      if (!outputEditorRef.current) return;
      if (!rawContent || !rawContent.trim()) {
        outputEditorRef.current.setValue("");
        return;
      }
      try {
        const obj = parseJson(rawContent);
        const pretty = JSON.stringify(obj, null, 2);
        outputEditorRef.current.setValue(pretty);
      } catch (error: any) {
        if (error instanceof JSONError) {
          outputEditorRef.current.setValue(error.message);
        }
        showToast("JSON 解析失败，请检查输入内容是否为合法的 JSON 格式", "error");
      }
    },
    [rawContent],
    { wait: 300 },
  );

  const withGuard = (fn: () => void) => () => {
    if (!inputEditorRef.current || !outputEditorRef.current) return;
    fn();
  };

  const runJsonPath = () => {
    if (!rawContent || !rawContent.trim()) {
      showToast("请输入 JSON 文本后再查询", "warning");
      return;
    }
    try {
      const obj = parseJson(rawContent);
      const res = JSONPath({ path: jsonPath, json: obj });
      const resStr = res == null ? "未匹配到任何结果" : JSON.stringify(res, null, 2);
      setJsonPathResult(resStr);
      setJsonPathDialogOpen(true);
    } catch {
      setJsonPathResult("解析输入 JSON 失败，无法执行查询");
      showToast("解析输入 JSON 失败，无法执行查询", "error");
    }
  };

  const copyOutput = async (text?: string) => {
    const t = text ?? (outputEditorRef.current ? outputEditorRef.current.getValue() : jsonPathResult);
    try {
      await navigator.clipboard.writeText(t);
      showToast("已复制", "success");
    } catch {
      showToast("复制失败", "warning");
    }
  };

  const writeBackToInput = (t: string) => {
    if (inputEditorRef.current) inputEditorRef.current.setValue(t);
    showToast("已写回输入编辑器", "success");
  };

  const downloadResult = (t?: string) => {
    const content = t ?? (outputEditorRef.current ? outputEditorRef.current.getValue() : jsonPathResult);
    try {
      const blob = new Blob([content], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "result.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("开始下载 result.json", "success");
    } catch {
      showToast("下载失败", "error");
    }
  };

  const handleMinify = withGuard(() => {
    const src = inputEditorRef.current!.getValue();
    if (!src.trim()) {
      outputEditorRef.current!.setValue("");
      showToast("请输入 JSON 文本", "info");
      return;
    }
    try {
      const obj = parseJson(src);
      const minified = JSON.stringify(obj);
      inputEditorRef.current!.setValue(minified);
      showToast("压缩成功", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      showToast(`JSON 解析失败：${msg}`, "error");
    }
  });

  const handleClear = withGuard(() => {
    inputEditorRef.current!.setValue("");
    outputEditorRef.current!.setValue("");
  });

  const handleCopy = withGuard(async () => {
    const text = outputEditorRef.current!.getValue();
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板", "success");
    } catch {
      showToast("复制失败，请手动选择并复制", "warning");
    }
  });

  return (
    <div className="no-header-screen flex flex-col gap-4">
      <div className="text-xl font-bold">JSON 格式化</div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outlined" startIcon={<CompressIcon />} onClick={handleMinify}>
            压缩
          </Button>
          <Button variant="outlined" color="warning" startIcon={<CleaningServicesIcon />} onClick={handleClear}>
            清空
          </Button>
          <Tooltip title="复制右侧结果">
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
              复制
            </Button>
          </Tooltip>
          <TextField
            label="字号"
            type="number"
            size="small"
            value={fontSize}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v)) return;
              const clamped = Math.min(48, Math.max(8, v));
              setFontSize(clamped);
            }}
            slotProps={{
              htmlInput: {
                min: 8,
                max: 48,
              },
            }}
          />
          <TextField
            label="JSONPath"
            size="small"
            value={jsonPath}
            onChange={(e) => setJsonPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runJsonPath();
            }}
            sx={{ minWidth: 240 }}
          />
          <Button variant="outlined" onClick={runJsonPath}>
            查询
          </Button>
        </div>
        <div>
          <Button variant="contained" onClick={() => downloadResult()}>
            下载 JSON
          </Button>
        </div>
      </div>
      <div className="flex-1 flex gap-3">
        <div className="flex-1 border-2 p-2 border-gray-300 rounded overflow-hidden">
          <div ref={inputContainerRef} className="w-full h-full" />
        </div>
        <div className="flex-2 overflow-hidden">
          <div ref={outputContainerRef} className="w-full h-full" />
        </div>
      </div>
      <Dialog open={isJsonPathDialogOpen} onClose={() => setJsonPathDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>JSONPath 查询结果</DialogTitle>
        <DialogContent dividers>
          <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-100 p-4 rounded border max-h-96 overflow-auto">
            <code>{jsonPathResult}</code>
          </pre>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => copyOutput(jsonPathResult)}>
            复制
          </Button>
          <Button variant="outlined" onClick={() => downloadResult(jsonPathResult)}>
            下载
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              writeBackToInput(jsonPathResult);
              setJsonPathDialogOpen(false);
            }}
          >
            写回输入
          </Button>
        </DialogActions>
      </Dialog>
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
