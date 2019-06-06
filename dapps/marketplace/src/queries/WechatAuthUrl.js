import gql from 'graphql-tag'

export default gql`
  query WechatAuthUrl($redirect: String) {
    identityEvents {
      wechatAuthUrl(redirect: $redirect)
    }
  }
`
