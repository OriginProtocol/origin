module.exports = vars => `
<mjml>
  ${vars.head}
  <mj-body>
    <mj-section padding-bottom="0">
      <mj-column>
        <mj-text mj-class="xlarge">${vars.siteName}</mj-text>
      </mj-column>
      <mj-column>
        <mj-text mj-class="light" align="right">ORDER #${
          vars.orderNumber
        }</mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text mj-class="large">Thank you for your purchase!</mj-text>
        <mj-text mj-class="light">
          Hi ${
            vars.firstName
          }, we're getting your order ready to be shipped. We will notify you when it has been sent.
        </mj-text>
        <mj-text css-class="view-order">
          <a href="${vars.orderUrl}" class="btn">
            View your order
          </a>
          <span class="visit-store">
           or <a href="${vars.storeUrl}">Visit our store</a>
          </span>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-divider />
    <mj-section>
      <mj-column>
        <mj-text mj-class="medium">Order Summary</mj-text>
        <mj-table padding-top="15px">
          ${vars.orderItems.join('\n')}
        </mj-table>
        <mj-divider />
        <mj-table width="50%" align="right">
          <tr class="cart-summary">
            <td class="label">Subtotal</td>
            <td class="price">${vars.subTotal}</td>
          </tr>
          <tr class="cart-summary">
            <td class="label">Shipping</td>
            <td class="price">${vars.shipping}</td>
          </tr>
          <tr class="cart-summary total">
            <td class="label">Total</td>
            <td class="price large">${vars.total}</td>
          </tr>
        </mj-table>
      </mj-column>
    </mj-section>
    <mj-divider />
    <mj-section padding-bottom="0">
      <mj-column>
        <mj-text mj-class="medium">Shipping address</mj-text>
        <mj-text mj-class="light">
          ${vars.shippingAddress.join('<br />')}
        </mj-text>
      </mj-column>
      <mj-column>
        <mj-text mj-class="medium">Billing address</mj-text>
        <mj-text mj-class="light">
          ${vars.billingAddress.join('<br />')}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-text mj-class="medium">Shipping method</mj-text>
        <mj-text mj-class="light">
          ${vars.shippingMethod}
        </mj-text>
      </mj-column>
      <mj-column>
        <mj-text mj-class="medium">Payment Method</mj-text>
        <mj-text mj-class="light">
          ${vars.paymentMethod}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-divider />
    <mj-section>
      <mj-column>
        <mj-text mj-class="light small">
          If you have any questions, reply to this email or contact us at ${
            vars.supportEmail
          }
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`
