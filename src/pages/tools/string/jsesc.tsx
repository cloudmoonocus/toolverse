import { useRef, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { Toast, useToast } from "@/components/Toast";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";
import jsesc from "jsesc";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { Monaco, MonacoNS } from "@/types/monaco";
import parseJson from "parse-json";

export default function StringJsesc() {
  const { toast, showToast, hideToast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const [quotesDouble, setQuotesDouble] = useState(true);
  const [escapeEverything, setEscapeEverything] = useState(false);

  // 动态创建编辑器
  useEffect(() => {
    let disposed = false;
    (async () => {
      const m = await import("monaco-editor");
      if (disposed) return;
      monacoRef.current = m as unknown as Monaco;
      editorRef.current = m.editor.create(containerRef.current!, {
        value: "",
        language: "json",
        automaticLayout: true,
        minimap: { enabled: false },
        theme: "vs",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        lineNumbers: "on",
        lineNumbersMinChars: 0,
        fontSize: 18,
      });
    })();

    return () => {
      disposed = true;
      editorRef.current?.dispose();
      monacoRef.current?.editor.getModels().forEach((model) => model.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withGuard = (fn: () => void) => () => {
    if (!editorRef.current) return;
    fn();
  };

  const handleJsesc = withGuard(() => {
    const text = editorRef.current!.getValue();
    try {
      const escapedText = jsesc(text, {
        quotes: quotesDouble ? "double" : "single",
        wrap: false,
        escapeEverything: escapeEverything,
        minimal: !escapeEverything,
      });
      editorRef.current!.setValue(escapedText);
      showToast("转义成功", "success");
    } catch (error) {
      showToast("转义失败，请检查输入内容", "error");
    }
  });

  const handleClear = withGuard(() => {
    editorRef.current!.setValue("");
  });

  const handleCopy = withGuard(async () => {
    const text = editorRef.current!.getValue();
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板", "success");
    } catch {
      showToast("复制失败，请手动选择并复制", "warning");
    }
  });

  // 新增：去转义实现
  const handleUnescape = withGuard(() => {
    const text = editorRef.current!.getValue();
    try {
      const unescapeText = parseJson(`"${text}"`);
      editorRef.current!.setValue(`${unescapeText}`);
      showToast("去转义成功", "success");
    } catch (error) {
      console.error(error);
      showToast("去转义失败，请检查输入内容", "error");
    }
  });

  return (
    <div className="no-header-screen flex flex-col gap-4 w-1/2 mx-auto">
      <div className="text-xl font-bold">文本转义</div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<ChangeCircleIcon />}
            onClick={handleJsesc}
          >
            转义
          </Button>
          <Button
            variant="outlined"
            startIcon={<ChangeCircleOutlinedIcon />}
            onClick={handleUnescape}
          >
            去转义
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<CleaningServicesIcon />}
            onClick={handleClear}
          >
            清空
          </Button>
          <Tooltip title="复制结果">
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
            >
              复制
            </Button>
          </Tooltip>
        </div>
        {/* 新增：选项开关 */}
        <div>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={quotesDouble}
                  onChange={(e) => setQuotesDouble(e.target.checked)}
                />
              }
              label={quotesDouble ? '转义双引号 ( " )' : "转义单引号 ( ' )"}
            />
            <Tooltip title="输出中的所有符号都会被转义">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={escapeEverything}
                    onChange={(e) => setEscapeEverything(e.target.checked)}
                  />
                }
                label="转义所有"
              />
            </Tooltip>
          </FormGroup>
        </div>
      </div>
      <div className="flex-1 border-2 p-2 border-gray-300 rounded overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
