import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Chip,
  Input,
  List,
  ListItemButton,
  ListItemContent,
  Modal,
  ModalDialog,
  Typography,
} from '@hintoric/ui';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { search } from './search.ts';
import type { SearchEntry } from './types.ts';

export interface CommandPaletteProps {
  entries: SearchEntry[];
}

/**
 * Ctrl/Cmd+K over the pages and their sections.
 *
 * Built out of @hintoric/ui rather than a palette library: everything it
 * needs is already in the box — Modal, Input, List, ListItemButton with its
 * `selected` state — and a docs site that reached for a foreign widget would
 * be arguing against its own library on its own front page.
 */
export function CommandPalette({ entries }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  const hits = React.useMemo(() => search(entries, query), [entries, query]);
  // The list shrinks as you type; the highlight follows it down rather than
  // pointing past the end.
  const index = Math.min(active, Math.max(hits.length - 1, 0));

  const show = React.useCallback(() => {
    setQuery('');
    setActive(0);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    // A ref, not `open` in the deps: rebinding a window listener on every
    // open would be a listener swap in the middle of the keystroke that
    // caused it.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((was) => {
        if (!was) {
          setQuery('');
          setActive(0);
        }
        return !was;
      });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function go(entry: SearchEntry | undefined) {
    if (!entry) return;
    setOpen(false);
    void navigate(entry.hash ? `${entry.path}#${entry.hash}` : entry.path);
  }

  function onFieldKeyDown(event: React.KeyboardEvent) {
    if (hits.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((was) => (Math.min(was, hits.length - 1) + 1) % hits.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((was) => (Math.min(was, hits.length - 1) - 1 + hits.length) % hits.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(hits[index]);
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="neutral"
        size="sm"
        className="docs-search-button"
        startDecorator={<SearchRoundedIcon fontSize="small" />}
        onClick={show}
      >
        Search
        <Chip size="sm" variant="soft" color="neutral" className="docs-palette-kbd">
          ⌘K
        </Chip>
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog layout="center" className="docs-palette">
          <Input
            type="search"
            autoFocus
            aria-label="Search the documentation"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={hits.length > 0 ? `${listId}-${index}` : undefined}
            placeholder="Search pages and sections…"
            startDecorator={<SearchRoundedIcon fontSize="small" />}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onFieldKeyDown}
          />

          {hits.length === 0 ? (
            <Typography level="body-sm" className="docs-palette-empty">
              Nothing matches “{query}”.
            </Typography>
          ) : (
            // component="div": a listbox's children are options, and an <li>
            // between them is a role the pattern does not allow.
            <List
              component="div"
              id={listId}
              role="listbox"
              aria-label="Results"
              className="docs-palette-list"
            >
              {hits.map((hit, position) => (
                <ListItemButton
                  key={`${hit.path}#${hit.hash ?? ''}`}
                  id={`${listId}-${position}`}
                  role="option"
                  aria-selected={position === index}
                  selected={position === index}
                  onMouseEnter={() => setActive(position)}
                  onClick={() => go(hit)}
                >
                  <ListItemContent>{hit.title}</ListItemContent>
                  <Typography level="body-xs" className="docs-palette-where">
                    {hit.hash ? hit.page : hit.group}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </ModalDialog>
      </Modal>
    </>
  );
}
