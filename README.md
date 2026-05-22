# n8n-nodes-url-to-md

An [n8n](https://n8n.io) community node that fetches a URL and converts the page into clean Markdown — ready for LLMs, RAG pipelines, and AI agents.

It extracts the main article with Mozilla [Readability](https://github.com/mozilla/readability) (stripping nav, ads, and footers), converts it to GitHub-flavored Markdown with [Turndown](https://github.com/mixmark-io/turndown), and tidies the result with [markdownlint](https://github.com/DavidAnson/markdownlint). No API key, no external service — runs locally inside n8n.

[Installation](#installation) · [Operations](#operations) · [Options](#options) · [Compatibility](#compatibility)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n docs, then install the package name:

```
n8n-nodes-url-to-md
```

## Operations

The node takes a **URL**, fetches the page over HTTP, and outputs the converted **Markdown** into a configurable field (default `markdown`).

It is also exposed as an **AI Agent tool** (`usableAsTool`), so agents can fetch and read web pages as Markdown on their own.

## Options

| Option | Default | Description |
| --- | --- | --- |
| Destination Output Field | `markdown` | JSON field that receives the Markdown |
| Clean With Readability | `true` | Extract the main article before converting; disable to convert the whole page |
| Lint Markdown | `true` | Run markdownlint auto-fix on the output |
| Heading Style | `atx` | `# Heading` (ATX) or Setext underlines |
| Bullet List Marker | `-` | `-`, `*`, or `+` for unordered lists |
| Code Block Style | `fenced` | Fenced ` ``` ` or 4-space indented |
| Request Timeout | `30000` ms | How long to wait for the page to respond |
| User Agent | _(none)_ | Custom `User-Agent` header for sites that block default clients |

## Compatibility

Targets n8n nodes API v1. Works with static and server-rendered pages. JavaScript-rendered SPAs and bot-walled pages are out of scope — use a dedicated scraping service for those.

## License

[MIT](LICENSE.md)
