const gtag = window.gtag || function(){}

export const setClickEventHandler = () => {
  document.body.addEventListener('click', (event) => {
    const { target } = event
    const category = target.getAttribute('ga-category')
    const label = target.getAttribute('ga-label')

    if (label) {
      gtag('event', 'click', {
        'event_category': category,
        'event_label': label
      })
    }
  })
}
