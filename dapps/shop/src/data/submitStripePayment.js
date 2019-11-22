async function submitStripePayment({ stripe, cart, encryptedData }) {
  const res = await fetch(process.env.PAYMENT_URL, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({ amount: cart.total, data: encryptedData.hash })
  })
  const json = await res.json()

  return stripe.handleCardPayment(json.client_secret, {
    payment_method_data: {
      billing_details: {
        name: `${cart.userInfo.firstName} ${cart.userInfo.lastName}`,
        email: cart.userInfo.email,
        address: {
          line1: cart.userInfo.address1,
          city: cart.userInfo.city,
          state: cart.userInfo.province,
          postal_code: cart.userInfo.zip
        }
      }
    },
    shipping: {
      name: `${cart.userInfo.firstName} ${cart.userInfo.lastName}`,
      address: {
        line1: cart.userInfo.address1,
        city: cart.userInfo.city,
        state: cart.userInfo.province,
        postal_code: cart.userInfo.zip
      }
    }
  })
}

export default submitStripePayment
