import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import Avatar from 'components/avatar'

class ProfileScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const { profile = {} } = navigation.getParam('user')
    const { firstName = '', lastName = '' } = profile
    const title = `${firstName} ${lastName}`.trim() || 'Unnamed User'

    return ({
      title,
      headerTitleStyle : {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal',
      },
    })
  }

  render() {
    const { navigation } = this.props
    const { address, profile = {} } = navigation.getParam('user')

    return (
      <View style={styles.container}>
        <Avatar image={profile.avatar} size={150} style={[
          styles.avatar,
          profile.avatar ? { paddingTop : 0 } : {},
        ]} />
        <Address address={address} label="User Address" style={styles.address} />
        <Text style={styles.description}>
          {profile.description || 'An Origin user without a description'}
        </Text>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address)),
})

export default connect(undefined, mapDispatchToProps)(ProfileScreen)

const styles = StyleSheet.create({
  address: {
    color: '#3e5d77',
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 30,
  },
  avatar: {
    borderRadius: 15,
    marginBottom: 15,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    padding: 30,
  },
  description: {
    color: '#111d28',
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
  },
})
