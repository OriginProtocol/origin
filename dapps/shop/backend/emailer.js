require('dotenv').config()
const config = require('./config')()
const mjml2html = require('mjml')
const nodemailer = require('nodemailer')
const cartData = require('./cartData')
const aws = require('aws-sdk')

const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
    region: 'us-east-1'
  })
})

const head = require('./templates/head')
const vendor = require('./templates/vendor')
const email = require('./templates/email')
const emailTxt = require('./templates/emailTxt')
const orderItem = require('./templates/orderItem')
const orderItemTxt = require('./templates/orderItemTxt')

function formatPrice(num) {
  return `$${(num / 100).toFixed(2)}`
}

const prefix = config.siteData.emailAssets

function optionsForItem(item) {
  const options = []
  if (item.product.options && item.product.options.length && item.variant) {
    item.product.options.forEach((opt, idx) => {
      options.push(`${opt}: ${item.variant.options[idx]}`)
    })
  }
  return options
}

async function sendMail(cart, skip) {
  const items = await cartData(cart.items)

  const orderItems = items.map(item => {
    const img = item.variant.image || item.product.image
    const options = optionsForItem(item)
    return orderItem({
      img: `${prefix}/${item.product.id}/520/${img}`,
      title: item.product.title,
      quantity: item.quantity,
      price: formatPrice(item.price),
      options: options.length
        ? `<div class="options">${options.join(', ')}</div>`
        : ''
    })
  })
  const orderItemsTxt = items.map(item => {
    const options = optionsForItem(item)
    return orderItemTxt({
      title: item.product.title,
      quantity: item.quantity,
      price: formatPrice(item.price),
      options: options.length ? `\n(${options.join(', ')})` : ''
    })
  })

  const vars = {
    head,
    siteName: config.siteData.title,
    supportEmailName: config.siteData.supportEmailName,
    supportEmail: config.siteData.supportEmail,
    subject: config.siteData.emailSubject,
    storeUrl: config.siteData.storeUrl,

    orderNumber: cart.offerId,
    firstName: cart.userInfo.firstName,
    lastName: cart.userInfo.lastName,
    email: cart.userInfo.email,
    orderUrl: `${config.siteData.storeUrl}/#/order/${cart.tx}?auth=${cart.dataKey}`,
    orderUrlAdmin: `${config.siteData.storeUrl}/#/admin/orders/${cart.offerId}`,
    orderItems,
    orderItemsTxt,
    subTotal: formatPrice(cart.subTotal),
    shipping: formatPrice(cart.shipping.amount),
    total: formatPrice(cart.total),
    shippingAddress: [
      `${cart.userInfo.firstName} ${cart.userInfo.lastName}`,
      `${cart.userInfo.address1}`,
      `${cart.userInfo.city} ${cart.userInfo.province} ${cart.userInfo.zip}`,
      `${cart.userInfo.country}`
    ],
    billingAddress: [
      `${cart.userInfo.firstName} ${cart.userInfo.lastName}`,
      `${cart.userInfo.address1}`,
      `${cart.userInfo.city} ${cart.userInfo.province} ${cart.userInfo.zip}`,
      `${cart.userInfo.country}`
    ],
    shippingMethod: cart.shipping.label,
    paymentMethod: cart.paymentMethod.label
  }

  const htmlOutputVendor = mjml2html(vendor(vars), { minify: true })
  const htmlOutput = mjml2html(email(vars), { minify: true })
  const txtOutput = emailTxt(vars)

  const message = {
    from: `${vars.supportEmailName} <${vars.supportEmail}>`,
    to: `${vars.firstName} ${vars.lastName} <${vars.email}>`,
    subject: vars.subject,
    html: htmlOutput.html,
    text: txtOutput
  }

  const messageVendor = {
    from: `${vars.supportEmailName} <${vars.supportEmail}>`,
    to: `${vars.supportEmailName} <${vars.supportEmail}>`,
    subject: `[${vars.siteName}] Order #${cart.offerId}`,
    html: htmlOutputVendor.html,
    text: txtOutput
  }

  if (!skip) {
    transporter.sendMail(message, (err, msg) => {
      if (err) {
        console.log(err)
      } else {
        console.log(msg.envelope)
      }
    })
    transporter.sendMail(messageVendor, (err, msg) => {
      if (err) {
        console.log(err)
      } else {
        console.log(msg.envelope)
      }
    })
  }

  return message
}

module.exports = sendMail
