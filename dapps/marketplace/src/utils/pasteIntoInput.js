export default function pasteIntoInput(el, text) {
  if (
    typeof el.selectionStart == 'number' &&
    typeof el.selectionEnd == 'number'
  ) {
    const val = el.value
    const selStart = el.selectionStart
    el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd)
    el.selectionEnd = el.selectionStart = selStart + text.length
  } else if (typeof document.selection != 'undefined') {
    const textRange = document.selection.createRange()
    textRange.text = text
    textRange.collapse(false)
    textRange.select()
  }
  el.blur()
  el.focus()
}
