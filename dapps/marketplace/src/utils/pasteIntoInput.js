/**
 * Insert text to a certain input field at current cursor position.
 * After text is inserted at the certain position of the input field,
 * that position is focused (in textarea it is scrolled)
 * @param { inputfield } el the input field
 * @param { string } text the text to be inserted
 *
 * @returns { void }
 */
export default function pasteIntoInput(el, text) {
  if (
    typeof el.selectionStart === 'number' &&
    typeof el.selectionEnd === 'number'
  ) {
    const val = el.value
    const selStart = el.selectionStart
    el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd)
    el.selectionEnd = el.selectionStart = selStart + text.length
  } else if (typeof document.selection !== 'undefined') {
    // In the old version of IE (6-8), selectionStart and selectionEnd are not supported
    const textRange = document.selection.createRange()
    textRange.text = text
    textRange.collapse(false)
    textRange.select()
  }
  // Next two lines scrolls the textarea to the cursor position.
  el.blur()
  el.focus()
}
