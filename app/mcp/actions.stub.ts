// Stub for static export — MCP requires Node.js runtime
export async function isMcpEnabled(): Promise<boolean> {
  return false;
}
export async function getAllTools() {
  return [];
}
export async function executeMcpAction() {
  return "";
}
export function extractMcpJson(): { json: string | null; text: string } {
  return { json: null, text: "" };
}
export function isMcpJson(): boolean {
  return false;
}
