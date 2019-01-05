export default function rnd(objs) {
  if (!objs) return null
  return objs[Math.floor(Math.random() * objs.length)]
}
