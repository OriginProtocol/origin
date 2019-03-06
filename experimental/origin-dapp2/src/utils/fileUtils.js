export async function postFile(ipfsRPC, file) {
  const body = new FormData()
  body.append('file', file)
  const rawRes = await fetch(`${ipfsRPC}/api/v0/add`, { method: 'POST', body })
  const res = await rawRes.json()
  return res.Hash
}

export function fileSize(number) {
  if (number < 1024) {
    return number + 'bytes'
  } else if (number >= 1024 && number < 100000) {
    return (number / 1024).toFixed(1) + 'KB'
  } else if (number >= 100000 && number < 1048576) {
    return (number / 1024).toFixed() + 'KB'
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + 'MB'
  }
}
