module.exports = vars => `
<tr class="item-row">
  <td class="image">
    <img src="${vars.img}" />
  </td>
  <td class="title">${vars.title} × ${vars.quantity}${vars.options || ''}</td>
  <td class="price">${vars.price}</td>
</tr>
`
