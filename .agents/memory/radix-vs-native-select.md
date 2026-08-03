---
name: Radix Select vs native select
description: When to use Radix UI Select vs a styled native select element.
---

**Rule:** The `@/components/ui/select` component (Radix UI) has a different API from a native HTML `<select>`. It does NOT accept `onChange`, `id`, or `<option>` children directly. Use a native `<select>` styled with Tailwind classes instead.

**Why:** Radix Select uses `SelectRoot/SelectTrigger/SelectContent/SelectItem` composition pattern. Passing `onChange` and `<option>` children causes a silent render failure (no selection, no change events).

**How to apply:** For simple dropdowns in forms, use:
```tsx
<select
  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  {options.map(o => <option key={o} value={o}>{o}</option>)}
</select>
```
Only use the Radix `Select` component when you need custom trigger styling, search/filter inside the dropdown, or keyboard navigation extras.
