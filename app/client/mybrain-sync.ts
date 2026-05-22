import { useAccessStore } from "../store";

const MYBRAIN_API_BASE = "https://mybrain.onedrivememory.com";

function getAuthHeaders(): Record<string, string> {
  const token = useAccessStore.getState().mybrainToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

interface SyncSession {
  id: string;
  title?: string;
  model_id?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

// Map local NextChat session ID -> MyBrain session ID
const sessionMap = new Map<string, string>();

export async function ensureMyBrainSession(
  localSessionId: string,
  title?: string,
  model?: string,
  provider?: string,
): Promise<string> {
  const cached = sessionMap.get(localSessionId);
  if (cached) return cached;

  try {
    // Check if a session with matching title already exists
    const res = await fetch(`${MYBRAIN_API_BASE}/api/chat/sessions?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const sessions: SyncSession[] = await res.json();
      // Try to find by title match or just create new
      const existing = sessions.find((s) => s.title === title);
      if (existing) {
        sessionMap.set(localSessionId, existing.id);
        return existing.id;
      }
    }

    // Create new session
    const createRes = await fetch(`${MYBRAIN_API_BASE}/api/chat/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, model_id: model, provider }),
    });
    if (createRes.ok) {
      const session: SyncSession = await createRes.json();
      sessionMap.set(localSessionId, session.id);
      return session.id;
    }
  } catch (e) {
    console.error("[MyBrain Sync] ensureMyBrainSession failed:", e);
  }
  return "";
}

export async function syncMessageToMyBrain(
  mybrainSessionId: string,
  role: string,
  content: string,
  model?: string,
  tokensIn?: number,
  tokensOut?: number,
): Promise<void> {
  if (!mybrainSessionId) return;

  try {
    await fetch(
      `${MYBRAIN_API_BASE}/api/chat/sessions/${mybrainSessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          role,
          content,
          model,
          tokens_in: tokensIn,
          tokens_out: tokensOut,
        }),
      },
    );
  } catch (e) {
    console.error("[MyBrain Sync] syncMessageToMyBrain failed:", e);
  }
}

export { sessionMap };

export async function triggerMemoryExtraction(
  mybrainSessionId: string,
): Promise<void> {
  if (!mybrainSessionId) return;

  try {
    await fetch(
      `${MYBRAIN_API_BASE}/api/chat/sessions/${mybrainSessionId}/extract-memories`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
  } catch (e) {
    console.error("[MyBrain Sync] triggerMemoryExtraction failed:", e);
  }
}
