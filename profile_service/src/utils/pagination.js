export function getPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const size = Math.min(Math.max(parseInt(query.size || '20', 10), 1), 100);
  const offset = (page - 1) * size;
  const limit = size;
  return { page, size, offset, limit };
}
