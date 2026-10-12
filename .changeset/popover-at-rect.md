---
'@hintoric/ui': minor
---

New `Popover`: a popup that stands at a rectangle (`anchorRect={{ x, y, width, height }}`, viewport coordinates) instead of at an element — for a toolbar over a text selection or a map marker. It stays beside the rectangle without covering it, flips to the other side and shifts at the edge of the page like `Menu`, and closes on Escape or a press outside (`onClose`). Focus is not moved into it, so a text selection survives. It paints nothing by default (`variant="plain"`), so a `FloatingBar` inside keeps its own surface.
