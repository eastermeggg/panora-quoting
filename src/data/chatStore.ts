// Lightweight reactive store for the standalone "Chat" tab.
//
// The chat MESSAGES themselves live in chatMock (so the Chat tab can reuse the
// real <ComparisonChat>, keyed by conversation id). This store only owns the
// conversation LIST shown in the sidebar — id, title, and generated artefacts —
// reactively via useSyncExternalStore.

import { useSyncExternalStore } from "react";

export type ChatArtefact = { id: string; title: string; md: string };

export type Conversation = {
  id: string;
  title: string;
  artefacts: ChatArtefact[];
};

type State = { conversations: Conversation[]; activeId: string | null };

const DEFAULT_TITLE = "Nouveau chat";

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function truncate(s: string, n: number): string {
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

let state: State = { conversations: [], activeId: null };
const SERVER_STATE: State = { conversations: [], activeId: null };
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useChatState(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

export function createConversation(): string {
  const id = uid("conv");
  const conv: Conversation = { id, title: DEFAULT_TITLE, artefacts: [] };
  setState({ conversations: [conv, ...state.conversations], activeId: id });
  return id;
}

/** Ensure there's an active conversation — reuse a fresh (untitled) one, else create. */
export function ensureActiveConversation(): void {
  if (state.activeId && state.conversations.some((c) => c.id === state.activeId)) {
    return;
  }
  const draft = state.conversations.find((c) => c.title === DEFAULT_TITLE);
  if (draft) {
    setState({ ...state, activeId: draft.id });
    return;
  }
  createConversation();
}

export function setActiveConversation(id: string): void {
  if (state.activeId === id) return;
  setState({ ...state, activeId: id });
}

/** Title a conversation from its first user message (only while still untitled). */
export function setTitleFromMessage(id: string, text: string): void {
  const t = text.trim();
  if (!t) return;
  setState({
    ...state,
    conversations: state.conversations.map((c) =>
      c.id === id && c.title === DEFAULT_TITLE
        ? { ...c, title: truncate(t, 42) }
        : c,
    ),
  });
}

export function addArtefact(conversationId: string, artefact: ChatArtefact): void {
  setState({
    ...state,
    conversations: state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, artefacts: [...c.artefacts, artefact] }
        : c,
    ),
  });
}
