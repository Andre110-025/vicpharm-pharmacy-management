export function useChatbot() {
  const mount = () => {
    if (document.querySelector('chatbot-widget')) return

    const bot = document.createElement('chatbot-widget')
    bot.setAttribute('website', 'https://wholesales.storehive.com.ng/')
    bot.setAttribute(
      'api',
      'pk_220Q6Cf98J8hGUtOwbbmfnutNFgOR3nLC4YOy465ISU'
    )

    document.body.appendChild(bot)
  }

  const unmount = () => {
    const bot = document.querySelector('chatbot-widget')
    if (bot) bot.remove()
  }

  return {
    mount,
    unmount
  }
}
