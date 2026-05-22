# n8n-nodes-url-to-md

[![npm version](https://img.shields.io/npm/v/n8n-nodes-url-to-md.svg)](https://www.npmjs.com/package/n8n-nodes-url-to-md)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-url-to-md.svg)](https://www.npmjs.com/package/n8n-nodes-url-to-md)
[![License: MIT](https://img.shields.io/npm/l/n8n-nodes-url-to-md.svg)](LICENSE.md)

An [n8n](https://n8n.io) community node that fetches a URL and converts the page into clean Markdown — ready for LLMs, RAG pipelines, and AI agents.

It extracts the main article with [Defuddle](https://github.com/kepano/defuddle) (stripping nav, ads, and footers), parsed via [linkedom](https://github.com/WebReflection/linkedom), then renders GitHub-flavored Markdown with [Turndown](https://github.com/mixmark-io/turndown). No API key, no external service — runs locally inside n8n.

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
| Remove Images | `false` | Strip images from the converted Markdown |
| Request Timeout | `30000` ms | How long to wait for the page to respond |
| User Agent | _(none)_ | Custom `User-Agent` header for sites that block default clients |

## Compatibility

Targets n8n nodes API v1. Works with static and server-rendered pages. JavaScript-rendered SPAs and bot-walled pages are out of scope — use a dedicated scraping service for those.

## License

[MIT](LICENSE.md)
