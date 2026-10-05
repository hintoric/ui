---
"@hintoric/ui": minor
---

Add `TabNav` for navigation tabs: a `<nav>` of links that look like `TabList` + `Tab`, with the same sliding indicator under the current page. Put the usual `Tab`s inside, with `href` (and `component` for a router link), and pass the current route as `value`:

```tsx
<TabNav value={pathname} aria-label="Main">
  <Tab value="/documents" href="/documents" component={RouterLink}>Documents</Tab>
</TabNav>
```

Unlike Joy UI's `<Tab component={Link}>` inside `Tabs`, the links get `aria-current="page"` instead of `role="tab"`, and every link stays in the Tab order.

`Tab` now matches Joy UI's measurements: 1rem horizontal padding at `md` (0.75rem/1.25rem at `sm`/`lg`) plus Joy's vertical padding, a transparent 1px border, Joy's focus ring, and Joy's disabled look (the variant's disabled colours and no pointer events, instead of 60% opacity). Existing tabs therefore become slightly wider and taller.
