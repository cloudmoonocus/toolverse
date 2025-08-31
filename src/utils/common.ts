export function decodeBase64(input: string): string {
  try {
    if (typeof atob !== "undefined") {
      return atob(input);
    } else if (typeof Buffer !== "undefined") {
      return Buffer.from(input, "base64").toString("utf8");
    }
    return input || "";
  } catch (e) {
    console.error("Failed to decode base64:", e);
    return input || "";
  }
}
