---
"@hintoric/ui": patch
---

`Tabs` now matches Joy UI's `Tabs`:

- The root has square corners in every variant. It used to have an 8px radius, which Joy UI's `Tabs` does not have. This is visible on `solid`, `soft` and `outlined` tabs.
- The `size` prop now sets the root's text size: 14px for `sm`, 16px for `md` and 18px for `lg`, as in Joy UI. Before, the root always used the inherited size.
- `Tab` and `TabPanel` use a line-height of 1.5 at every size. At `sm` and `lg` they had 20px and 28px. Joy UI has 21px and 27px, so `sm` tabs and panels are now 1px taller, and `lg` ones are 1px shorter.
- The root is now `position: relative`, as in Joy UI. Absolutely positioned children now position against the `Tabs` root.
