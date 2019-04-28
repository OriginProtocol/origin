// Safe get method
export function get(object, path, defval = null) {
  if (typeof path === "string") path = path.split(".");
  return path.reduce((xs, x) => (xs && xs[x] ? xs[x] : defval), object);
}
