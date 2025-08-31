// 仅类型导入，运行时动态导入 monaco-editor
import type * as MonacoNS from "monaco-editor";

export type Monaco = typeof MonacoNS;
export type { MonacoNS };
