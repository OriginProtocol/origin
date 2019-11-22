module.exports = vars => `
***************************************
${vars.siteName} ( ${vars.storeUrl} )
***************************************

Order #${vars.orderNumber}

----------------------------
Thank you for your purchase!
----------------------------

Hi ${vars.firstName}, we're getting your order ready to be shipped. We
will notify you when it has been sent.

View your order
( ${vars.orderUrl} )


or Visit our store (${vars.storeUrl} )

Order summary
-------------

${vars.orderItemsTxt.join('\n')}

Subtotal: ${vars.subTotal}
Shipping: ${vars.shipping}

Total: ${vars.total}

Customer information
--------------------

Shipping address
----------------

${vars.shippingAddress.join('\n')}

Billing address
---------------

${vars.billingAddress.join('\n')}

Shipping method
---------------

${vars.shippingMethod}

Payment method
--------------

${vars.paymentMethod}

If you have any questions, reply to this email or
contact us at ${vars.supportEmail}
`
