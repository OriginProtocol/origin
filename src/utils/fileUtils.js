export const getDataUri = async file => {
  const reader = new FileReader()

  return new Promise(resolve => {
    reader.onloadend = () => {
      const { result } = reader
      const simicolonIdx = result.indexOf(';') + 1
      // react-jsonschema-form requires the name in the URI for an unknown reason
      const uriWithFileName = `${result.substring(0, simicolonIdx)}name=${
        file.name
      };${result.substring(simicolonIdx, result.length)}`
      resolve(uriWithFileName)
    }

    reader.readAsDataURL(file)
  })
}
