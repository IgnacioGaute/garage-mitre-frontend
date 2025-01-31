export type SortOrder = 'ASC' | 'DESC';

export interface PaginationMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: [string, SortOrder][];
  search?: string;
  filter?: Record<string, string>;
}

export interface PaginationLinks {
  first: string;
  previous?: string;
  current: string;
  next?: string;
  last: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}
