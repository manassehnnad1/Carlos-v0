# ChatGPT-style Chat Interface

A faithful, responsive clone of ChatGPT's light-themed chat UI, built with
React 19 + Vite + Tailwind CSS v4.

> **Status: UI-first prototype.** The interface is complete and responsive, but
> it is **not yet wired to a real language model**. Until it is, every message
> gets the same fixed reply — *"Sorry, this project has not been connected to a
> real LLM model yet, so we cannot provide an answer for you."* — streamed back
> token-by-token so the UI behaves realistically. The codebase is structured
> around a single swap point so a real model (e.g. the Claude API) can be dropped
> in without touching any component. See
> [Continuing from here](#continuing-from-here).

---

## Table of contents

1. [What this is / isn't](#what-this-is--isnt)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Project structure](#project-structure)
5. [Architecture overview](#architecture-overview)
6. [The `useChat` hook — the swap point](#the-usechat-hook--the-swap-point)
7. [Component reference](#component-reference)
8. [Styling system](#styling-system)
9. [Responsive behavior](#responsive-behavior)
10. [Data flow, step by step](#data-flow-step-by-step)
11. [Continuing from here](#continuing-from-here)
12. [Known issues / tech debt](#known-issues--tech-debt)
13. [Scripts](#scripts)

---

## What this is / isn't

**It is:**

- A pixel-feel clone of ChatGPT's light interface: sidebar, top bar, empty-state
  landing screen with suggestion cards, message list, and an auto-growing
  composer.
- Fully responsive — the sidebar is statically docked on desktop and becomes a
  slide-in drawer on mobile.
- Built with clean, single-responsibility components so it's easy to read and
  extend.
- Architected so the "where do replies come from" logic is isolated in **one
  place** (`src/hooks/useChat.js`).

**It is *not* (yet):**

- Connected to a real LLM. Every reply is the same fixed "not connected yet"
  notice.
- Persisting anything. Refreshing the page clears the conversation. The sidebar
  shows "No chats yet" — there is no history list.
- Handling auth, accounts, settings, regenerate/edit/stop, or a light theme.

These omissions are intentional scope cuts for the first build. They are the
natural next steps — see [Continuing from here](#continuing-from-here).

---

## Tech stack

| Concern            | Choice                          | Why |
| ------------------ | ------------------------------- | --- |
| Framework          | **React 19**                    | Component model; what the team already uses. |
| Build tool         | **Vite 8**                      | Fast dev server + HMR, zero-config. |
| Styling            | **Tailwind CSS v4**             | Utility-first; v4 needs no `tailwind.config.js`. |
| Icons              | **lucide-react**                | Clean line icons matching ChatGPT's look. |
| Markdown rendering | **react-markdown** + **remark-gfm** | Render assistant replies (lists, tables, bold, etc.). |
| Code highlighting  | **rehype-highlight**            | Syntax highlighting inside fenced code blocks. |

> **Tailwind v4 note:** Unlike v3, there is no `tailwind.config.js` and no
> `postcss` setup. Tailwind is enabled by the `@tailwindcss/vite` plugin in
> [`vite.config.js`](vite.config.js) and activated by a single
> `@import "tailwindcss";` at the top of [`src/index.css`](src/index.css).
> Design tokens (custom colors, fonts) are declared in an `@theme {}` block in
> that same CSS file.

---

## Getting started

Requires **Node 18+** (Node 20+ recommended).

```bash
npm install      # install dependencies
npm run dev      # start dev server → http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

---

## Project structure

```
chatgpt/
├─ index.html                  # App shell; <title> and dark background to avoid white flash
├─ vite.config.js              # Vite + React plugin + @tailwindcss/vite plugin
├─ package.json
├─ src/
│  ├─ main.jsx                 # React entry point (renders <App/>)
│  ├─ App.jsx                  # Top-level layout; owns sidebar open/close state
│  ├─ index.css                # Tailwind import + design tokens + base styles + code theme
│  │
│  ├─ hooks/
│  │  └─ useChat.js            # ★ THE SWAP POINT — all message state + reply logic
│  │
│  ├─ data/
│  │  └─ suggestions.js        # Example prompts shown on the empty/landing screen
│  │
│  └─ components/
│     ├─ Sidebar.jsx           # Left nav: new chat, search, history placeholder, account
│     ├─ ChatHeader.jsx        # Top bar: sidebar toggle, model dropdown, new chat
│     ├─ EmptyState.jsx        # Landing screen: greeting + suggestion cards
│     ├─ MessageList.jsx       # Scrollable conversation; auto-scrolls to bottom
│     ├─ Message.jsx           # One turn (user bubble + attachments vs assistant markdown)
│     ├─ CodeBlock.jsx         # Fenced-code renderer: language label + copy button
│     ├─ AttachmentPreview.jsx # One attachment: image thumbnail or file chip (± remove btn)
│     └─ Composer.jsx          # Auto-growing input; attach (+) button; Enter to send
```

> The default Vite template files (`src/App.css`, `src/assets/*.svg`,
> `src/assets/hero.png`, `public/icons.svg`) are leftovers from the scaffold and
> are **no longer imported**. They can be deleted safely.

---

## Architecture overview

The guiding principle is **separation of "what the UI looks like" from "where
replies come from."**

```
                ┌─────────────────────────────────────────────┐
                │                  App.jsx                      │
                │  - owns sidebarOpen state                     │
                │  - calls useChat() once                       │
                └───────────────┬───────────────────────────────┘
                                │ passes data + callbacks down as props
        ┌───────────────────────┼───────────────────────────────┐
        ▼                       ▼                                 ▼
   Sidebar.jsx            ChatHeader.jsx           EmptyState / MessageList
   (toggle, new chat,     (model menu, mobile      (renders messages,
    search, account)       open + new chat)         sends suggestions)
                                                              │
                                                              ▼
                                                        Composer.jsx
                                                     (user types & sends)

   All of the above only ever READ `messages`/`isStreaming` and CALL
   `sendMessage`/`newChat`. None of them know where replies actually come from.

                                ▲
                                │  state + logic provided by
                ┌───────────────┴───────────────────────────────┐
                │              hooks/useChat.js                   │
                │   messages[]  isStreaming  sendMessage  newChat │
                │   ← THIS is the only file that talks to "the    │
                │     model" (a fixed notice for now). Swap here. │
                └─────────────────────────────────────────────────┘
```

Because every component is a pure consumer of the hook, replacing the fixed
notice with a real API is a change to **one file**.

---

## The `useChat` hook — the swap point

File: [`src/hooks/useChat.js`](src/hooks/useChat.js)

This is the most important file to understand. It is the single source of truth
for the conversation and the **only** place that produces assistant replies.

It returns:

| Returned value | Type       | Meaning |
| -------------- | ---------- | --- |
| `messages`     | `array`    | `[{ id, role: 'user' \| 'assistant', content, attachments }]` in order. |
| `isStreaming`  | `boolean`  | True while a reply is being produced (disables the send button, shows the cursor). |
| `sendMessage`  | `(text, attachments?)` | Appends the user message (+ any attachments) and an empty assistant message, then fills the assistant message in. |
| `newChat`      | `()`       | Cancels any in-flight stream and clears all messages. |

### How replies work today

`sendMessage` does three things:

1. Trims the input and bails out if there's nothing to send (no text *and* no
   attachments) or a reply is already streaming.
2. Pushes **two** messages at once: the user's message, and an empty assistant
   message (so the assistant bubble + streaming cursor appear immediately).
3. Calls `streamAssistantReply`, which reveals the fixed `NOT_CONNECTED_REPLY`
   string one token at a time using `setInterval` (every 20 ms), updating the
   assistant message's `content` on each tick. When all tokens are revealed it
   clears the interval and sets `isStreaming` to `false`.

`NOT_CONNECTED_REPLY` is a single constant — *"Sorry, this project has not been
connected to a real LLM model yet, so we cannot provide an answer for you."* —
returned for **every** message until a real model is wired in. (The markdown and
`CodeBlock` rendering still works; it just isn't exercised by this fixed reply.)

The streaming logic is fenced off with comments:

```js
// --- Replace this block with a real streamed API call. ---
...
// --- end mock ---
```

That block — and only that block — is what you replace to go live: swap the
fixed-string streaming for a real model call and delete `NOT_CONNECTED_REPLY`.

---

## Component reference

Every component is a presentational consumer of `useChat`'s data. None hold
business logic beyond local UI state (e.g. the composer's draft text).

### `App.jsx`
Top-level layout. Calls `useChat()` once, owns the `sidebarOpen` boolean, and
chooses between `<EmptyState>` (no messages yet) and `<MessageList>` (a
conversation exists). Passes `sendMessage`, `newChat`, and the sidebar
open/close callbacks down as props.

### `Sidebar.jsx`
The left navigation. Renders the **sidebar toggle** (the `PanelLeft` icon, at the
top — like real ChatGPT), a "New chat" button, a "Search chats" button (visual
only), an **empty history placeholder** ("No chats yet"), and an account row.
It is **collapsible on both desktop and mobile**, driven by the `isOpen` prop:
- On desktop (`md` and up) it's `static` and in the flex flow. Collapsing shrinks
  it to a narrow **rail** (`md:w-16`) rather than hiding it — the labels hide
  (`collapsed ? 'hidden' : ...`) but the toggle / New chat / Search / account
  **icons stay visible and clickable**. `overflow-hidden` clips the labels
  cleanly during the width animation.
- On mobile it's a `fixed`, full-width (`w-65`) drawer that slides fully
  off-screen (`-translate-x-full`) when closed and in over a dark backdrop when
  open. Tapping the backdrop closes it (`onClose`).

Props: `isOpen`, `onClose` (backdrop tap), `onToggle` (the in-sidebar toggle),
`onNewChat`.

### `ChatHeader.jsx`
Top bar. Contains a sidebar-open button (the `PanelLeft` icon — **mobile only**,
`md:hidden`, since on desktop the toggle lives inside the sidebar and the panel
never fully hides), the "ChatGPT" model-name dropdown (visual only — no menu
yet), and a new-chat pencil icon (mobile only). Calls `onToggleSidebar` and
`onNewChat`.

### `EmptyState.jsx`
The landing screen shown when there are zero messages: a centered "What can I
help with?" heading and a grid of suggestion cards built from
[`src/data/suggestions.js`](src/data/suggestions.js). Clicking a card calls
`onPick(prompt)`, which is wired to `sendMessage`.

### `MessageList.jsx`
The scrollable conversation column. Maps `messages` to `<Message>` components and
**auto-scrolls to the bottom** whenever `messages` changes (via a ref to a
trailing sentinel `<div>` + `scrollIntoView`). Marks the last message as
streaming so it can show the cursor.

### `Message.jsx`
Renders a single turn, with two visual variants:
- **User** → any attachments (rendered with `AttachmentPreview`) shown above a
  rounded, right-aligned bubble with `whitespace-pre-wrap`. The bubble is omitted
  when the message is attachments-only (no text).
- **Assistant** → an avatar + markdown-rendered content (via `react-markdown`
  with `remark-gfm` and `rehype-highlight`). While the assistant content is
  still empty and streaming, it shows a blinking cursor instead.

The markdown's visual styling (paragraph spacing, lists, links, headings) is
applied with Tailwind `[&_selector]` utilities in the `PROSE` string. Fenced code
blocks are routed to `CodeBlock` via the `components={{ code: CodeBlock }}` map.

### `CodeBlock.jsx`
Custom renderer for code inside markdown.
- **Inline code** (single line, no language) → a small styled `<code>`.
- **Fenced block** → a header bar showing the language label + a working
  copy-to-clipboard button (uses `navigator.clipboard`, with a 1.5s "Copied"
  confirmation), above the highlighted code.

### `Composer.jsx`
The input box. A `<textarea>` that **auto-grows** with content up to a 200px cap
(then scrolls internally). Sends on **Enter**; **Shift+Enter** inserts a newline.
The send button is disabled while there's nothing to send (no text *and* no
attachments) or while a reply is streaming. Shows the "ChatGPT can make mistakes"
disclaimer beneath.

It also owns the **file-attachment** flow: the `+` button opens a hidden
`<input type="file" multiple>`; picked files become attachment objects
(`{ id, name, size, type, url, file }`) held in local state and shown as previews
inside the composer box. For images an object URL (`URL.createObjectURL`) is
created so a thumbnail can render locally. On send, the attachments are passed to
`sendMessage(text, attachments)` and ownership transfers to the message (so their
URLs are *not* revoked); removing an unsent attachment revokes its URL.

> **Note:** this attaches files to the conversation in the UI only — the bytes
> are not uploaded anywhere yet (no backend). Wiring real upload happens at the
> same seam as replies — see [Continuing from here](#continuing-from-here).

### `AttachmentPreview.jsx`
Renders one attachment: an image **thumbnail** (when the type is an image and an
object URL exists) or a **file chip** (icon + name + human-readable size). Pass an
`onRemove` callback to show a remove (X) button — used in the composer; omitted
when rendering attachments inside a sent message.

---

## Styling system

All styling is Tailwind utility classes. There is **no** `tailwind.config.js` —
this is Tailwind v4, which is configured directly in CSS.

Design tokens live in the `@theme {}` block of
[`src/index.css`](src/index.css). Declaring a `--color-*` token there
automatically creates matching Tailwind utilities. For example:

```css
@theme {
  --color-chat-bg: #ffffff;   /* → bg-chat-bg, text-chat-bg, ... */
  --color-sidebar: #f9f9f9;   /* → bg-sidebar */
  --color-muted: #5d5d5d;     /* → text-muted */
  --color-brand: #19c37d;     /* → bg-brand, text-brand */
  ...
}
```

The app uses ChatGPT's **light** palette. **To re-theme (or add a dark mode),
change the token values in that one block** — every component picks the change
up automatically because they all reference the semantic token names
(`bg-chat-bg`, `text-muted`, etc.) rather than raw hex values.

`index.css` also contains: base `body`/`html` resets, slim custom scrollbars,
and a minimal highlight.js token color theme (the `.hljs-*` classes that
`rehype-highlight` emits).

> **Code blocks are intentionally dark even though the app is light** — this
> matches ChatGPT, where fenced code renders on a dark slab. That dark slab is
> the one place not driven purely by the light tokens: `CodeBlock.jsx` uses
> `bg-ink` with light text, and the `.hljs-*` theme in `index.css` is tuned for
> light-on-dark. If you add a dark mode later, the code block already fits.

---

## Responsive behavior

The single breakpoint is Tailwind's `md` (768px).

- **≥ md (desktop):** Sidebar is `md:static` and in the flex flow. The toggle
  (inside the sidebar) animates its width between `md:w-65` (open) and `md:w-16`
  (a narrow **rail** showing icons only); the main column expands to fill the
  freed space. It starts open (`window.innerWidth >= 768` on first render).
- **< md (mobile):** Sidebar is `fixed` and translated off-screen
  (`-translate-x-full`) until `isOpen` is true, when it slides in
  (`translate-x-0`) over a dark backdrop. It starts closed, and the header's
  `md:hidden` button reopens it.

The in-sidebar toggle handles open/close on desktop (the panel never fully hides,
so the toggle is always reachable in the rail). "New chat" auto-closes the drawer
only on mobile (`window.innerWidth < 768`); on desktop it leaves the sidebar
as-is.

Message list and composer are constrained to `max-w-3xl` and centered, matching
ChatGPT's readable column width on large screens.

---

## Data flow, step by step

What happens when a user sends "Hello":

1. User types in `Composer` and presses Enter → `Composer` calls `onSend("Hello")`.
2. `onSend` is `sendMessage` from `useChat` (passed via `App`).
3. `sendMessage` appends two messages to state: `{role:'user', content:'Hello'}`
   and `{role:'assistant', content:''}`, and sets `isStreaming = true`.
4. React re-renders. `App` sees `messages.length > 0`, so it renders
   `MessageList` (the empty state disappears).
5. `MessageList` renders the user bubble and an assistant message; the empty
   assistant message shows a blinking cursor.
6. `streamAssistantReply`'s interval fires repeatedly, appending tokens of the
   fixed `NOT_CONNECTED_REPLY` notice to the assistant message's `content`. Each
   update re-renders the assistant message (markdown re-parses) and `MessageList`
   auto-scrolls down.
7. When all tokens are revealed, `isStreaming` flips to `false`; the send button
   re-enables. (Every message produces this same notice until a real model is
   connected.)

---

## Continuing from here

These are the recommended next steps, roughly in priority order.

### 1. Wire a real model (the headline task)

Edit **only** [`src/hooks/useChat.js`](src/hooks/useChat.js). Replace the body of
`streamAssistantReply` (between the `--- Replace this block ---` comments) with a
real streamed request. Sketch:

```js
const streamAssistantReply = useCallback(async (assistantId, conversation) => {
  setIsStreaming(true)
  const res = await fetch('/api/chat', {            // your backend endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation }),
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let acc = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    acc += decoder.decode(value, { stream: true })
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
    )
  }
  setIsStreaming(false)
}, [])
```

> **Important — never put an API key in this frontend.** A Vite/React app ships
> all its code to the browser, so any key in it is public. You need a small
> backend (a serverless function, an Express route, etc.) that holds the key and
> proxies requests to the model provider. The frontend talks to *your* endpoint
> (`/api/chat` above), and that endpoint talks to the provider.
>
> If using the Claude API specifically, the backend would call Anthropic's
> Messages API with streaming enabled and forward the stream to the browser.

You'll also want to pass the existing `messages` into `sendMessage` so the model
gets conversation history (currently the mock ignores prior turns).

### 1b. Real file upload

The composer already collects `File` objects (each attachment carries the raw
`file`). To make upload real, in `sendMessage` (or just before calling it) send
those files to your backend — e.g. `FormData` to an upload endpoint, or base64 /
provider file-upload for vision models — and include the resulting references in
the request you send the model. No UI work is needed; the picker, previews,
remove, and per-message rendering are all done.

> The light theme is already implemented (it's the default), so the "Light theme"
> item under common features below is effectively done — a *dark* theme is the
> remaining variant.

### 2. Conversation history + persistence

- Add a `conversations` array (each with an `id`, `title`, and `messages`) and
  an `activeId`, likely in a new `useConversations` hook or a context.
- Persist to `localStorage` (simplest) or your backend.
- Render the list in `Sidebar.jsx` where the "No chats yet" placeholder is now;
  wire clicking an item to switch `activeId`, and "New chat" to create one.
- Derive each conversation's title from its first user message.

### 3. Common ChatGPT features to add next

- **Stop generating** button while `isStreaming` (clear the interval/abort the
  fetch).
- **Regenerate** and **edit message** actions.
- **Copy** button on assistant messages.
- **Dark theme** — add a second set of token values and a theme toggle (the
  light palette is already the default).
- **Settings / account** menu behind the sidebar account row.

---

## Known issues / tech debt

- **Bundle size (~520 kB).** `rehype-highlight` bundles grammars for *every*
  language, which dominates the build. To fix: switch to a lighter highlighter,
  register only the languages you need, or lazy-load highlighting. Functional,
  but worth addressing before production.
- **No persistence.** Refreshing loses the conversation (by design for now).
- **No real answers yet.** Every message returns the same fixed "not connected"
  notice and ignores prior turns — this goes away once a real model is wired in.
- **Attachments are UI-only.** Files can be picked, previewed, and shown on a
  message, but the bytes aren't uploaded anywhere (no backend yet).
- **Leftover scaffold files** (`src/App.css`, `src/assets/*`, `public/icons.svg`)
  are unused and can be deleted.

---

## Scripts

| Command           | Description |
| ----------------- | --- |
| `npm run dev`     | Start the dev server with HMR at http://localhost:5173 |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint over the project |
