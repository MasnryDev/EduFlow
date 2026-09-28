---
name: OpenRouter free models
description: Product expectation for OpenRouter's free model tier.
---

**Rule:** OpenRouter models tagged `:free` do not require paid model credits, but they are not unlimited. They can still be subject to per-minute, daily, provider, or availability limits.

**Why:** A user-facing claim that free models are unlimited creates the wrong expectation and makes normal rate-limit errors look like application failures.

**How to apply:** Explain the limitation when configuring free models, handle HTTP 429 errors clearly, and allow the configured model to be changed without rewriting the generation route.