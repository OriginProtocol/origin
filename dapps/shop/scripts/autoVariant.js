function variants(product, key, values) {
  const variants = values.map((v, idx) => {
    return {
      id: idx,
      title: product.title,
      option1: v,
      option2: null,
      option3: null,
      image: product.image,
      available: true,
      options: [v],
      price: product.price
    }
  })
  return JSON.stringify({ ...product, variants }, null, 2)
}

module.exports = variants
