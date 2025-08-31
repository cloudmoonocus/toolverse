/// <reference types="vite/client" />

// 允许直接导入 CSS 文件
declare module "*.css" {
  const content: string;
  export default content;
}
