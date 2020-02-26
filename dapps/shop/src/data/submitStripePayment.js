const { BACKEND_AUTH_TOKEN } = process.env

async function submitStripePayment({
  backend,
  stripe,
  cart,
  encryptedData,
  listingId
}) {
  const res = await fetch(`${backend}/pay`, {
    headers: {
      'content-type': 'application/json',
      authorization: `bearer ${BACKEND_AUTH_TOKEN}`
    },
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      amount: Math.round(cart.total),
      data: encryptedData.hash,
      listingId
    })
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
