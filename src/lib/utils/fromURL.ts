export function fromURL(url: URL | string): Record<string, any> {
  const u = typeof url === 'string' ? new URL(url, 'http://localhost') : url;
  const params = u.searchParams;
  
  const input: Record<string, any> = {
    filters: {}
  };
  
  for (const [key, value] of params.entries()) {
    if (key === 'page') {
      input.pagination = input.pagination || {};
      input.pagination.page = parseInt(value, 10);
    } else if (key === 'perPage') {
      input.pagination = input.pagination || {};
      input.pagination.perPage = parseInt(value, 10);
    } else if (key === 'search') {
      input.search = value;
    } else if (key === 'sort') {
      input.sorting = [value];
    } else {
      input.filters[key] = value;
    }
  }
  
  return input;
}
