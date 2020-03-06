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
  const { userInfo } = cart
  const shippingAddress = {
    line1: userInfo.address1,
    city: userInfo.city,
    state: userInfo.province,
    postal_code: userInfo.zip
  }
  const shippingName = `${userInfo.firstName} ${userInfo.lastName}`
  let billingAddress = shippingAddress
  let billingName = shippingName
  if (userInfo.billingDifferent) {
    billingAddress = {
      line1: userInfo.billingAddress1,
      city: userInfo.billingCity,
      state: userInfo.billingProvince,
      postal_code: userInfo.billingZip
    }
    billingName = `${userInfo.billingFirstName} ${userInfo.billingLastName}`
  }

  return stripe.handleCardPayment(json.client_secret, {
    shipping: {
      name: shippingName,
      address: shippingAddress
    },
    payment_method_data: {
      billing_details: {
        name: billingName,
        email: cart.userInfo.email,
        address: billingAddress
      }
    }
  })
}

export default submitStripePayment
