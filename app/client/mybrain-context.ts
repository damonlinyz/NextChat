import { useAccessStore } from "../store";

const MYBRAIN_API_BASE = "https://mybrain.onedrivememory.com";

interface ExtractedMemory {
  id: string;
  category: string;
  content: string;
  confidence: number;
}

interface UserContext {
  context: string;
  recent_memories?: ExtractedMemory[];
}

let cachedContext: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCognitiveContext(): Promise<string | null> {
  const token = useAccessStore.getState().mybrainToken;
  if (!token) return null;

  if (cachedContext && Date.now() < cacheExpiry) {
    return cachedContext;
  }

  try {
    const res = await fetch(
      `${MYBRAIN_API_BASE}/api/memory-hub/context?include_memories=true`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) return null;

    const data: UserContext = await res.json();
    const parts: string[] = [];

    if (data.context && data.context !== "No user profile available yet.") {
      parts.push(data.context);
    }

    if (data.recent_memories && data.recent_memories.length > 0) {
      const memoryLines = data.recent_memories
        .slice(0, 5)
        .map((m) => `- [${m.category}] ${m.content}`)
        .join("\n");
      parts.push(`## Recent Memories\n${memoryLines}`);
    }

    const result = parts.length > 0 ? parts.join("\n\n") : null;
    cachedContext = result;
    cacheExpiry = Date.now() + CACHE_TTL;
    return result;
  } catch (e) {
    console.error("[MyBrain Context] Failed to fetch:", e);
    return null;
  }
}

export function invalidateContextCache() {
  cachedContext = null;
  cacheExpiry = 0;
}
