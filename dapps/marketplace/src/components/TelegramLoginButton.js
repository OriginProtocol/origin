import React, { useEffect, memo } from 'react'

const TelegramLoginButton = ({ redirectURL, buttonText, className }) => {
  let rootEl

  useEffect(() => {
    if (
      !process.env.TELEGRAM_BOT_USERNAME ||
      process.env.TELEGRAM_BOT_USERNAME === 'origin_protocol_test_bot'
    ) {
      // origin_protocol_test_bot is the default value set in dapps/marketplace/webpack.config.js
      console.error(`Create a bot and set TELEGRAM_BOT_USERNAME env variable`)
    }

    const script = document.createElement('script')
    script.async = true
    script.setAttribute('src', 'https://telegram.org/js/telegram-widget.js?7')
    script.setAttribute(
      'data-telegram-login',
      process.env.TELEGRAM_BOT_USERNAME
    )
    script.setAttribute('data-auth-url', redirectURL)
    script.setAttribute('data-userpic', false)
    script.setAttribute('data-size', 'large')

    rootEl.appendChild(script)
  }, [redirectURL])

  return (
    <div ref={el => (rootEl = el)} className="telegram-login-button">
      <button className={className}>{buttonText}</button>
    </div>
  )
}

export default memo(TelegramLoginButton)

require('react-styl')(`
  .telegram-login-button
    position: relative
    width: 100%
    max-width: 226px
    max-height: 40px
    margin-bottom: 1rem
    button.btn
      max-width: 226px
      max-height: 40px
      padding: 0.375rem 2rem
      & + iframe
        z-index: 10000
        position: absolute
        left: 0
        right: 0
        bottom: 0
        top: 0
        opacity: 0
  
`)
