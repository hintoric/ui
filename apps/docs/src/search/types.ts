/** A heading inside a page, and the anchor it can be reached by. */
export interface DocsSection {
  id: string;
  title: string;
}

/** One documentation page, as the build-time index records it. */
export interface DocsPage {
  path: string;
  title: string;
  sections: DocsSection[];
}

/** One line in the palette: a page, or a section of one. */
export interface SearchEntry {
  path: string;
  /** Set on a section entry; absent on the page itself. */
  hash?: string;
  title: string;
  /** The page this entry belongs to — the same as `title` for a page entry. */
  page: string;
  /** The sidebar group the page sits in. */
  group: string;
}
