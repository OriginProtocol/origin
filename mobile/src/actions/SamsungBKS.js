'use strict'

import RNSamsungBKS from 'react-native-samsung-bks'

import keyMirror from 'utils/keyMirror'

export const SamsungBKSConstants = keyMirror(
  {
    GET_ADDRESS_LIST_PENDING: null,
    GET_ADDRESS_LIST_SUCCESS: null,
    GET_ADDRESS_LIST_ERROR: null,
    GET_SUPPORTED_PENDING: null,
    GET_SUPPORTED_SUCCESS: null,
    GET_SUPPORTED_ERROR: null,
    GET_SEEDHASH_PENDING: null,
    GET_SEEDHASH_SUCCESS: null,
    GET_SEEDHASH_ERROR: null,
    SET_IS_USED: null
  },
  'SAMSUNG_BKS'
)

function getAddressListPending() {
  return {
    type: SamsungBKSConstants.GET_ADDRESS_LIST_PENDING
  }
}

function getAddressListSuccess(payload) {
  return {
    type: SamsungBKSConstants.GET_ADDRESS_LIST_SUCCESS,
    payload
  }
}

function getAddressListError(error) {
  return {
    type: SamsungBKSConstants.GET_ADDRESS_LIST_ERROR,
    error
  }
}

function getSupportedPending() {
  return {
    type: SamsungBKSConstants.GET_SUPPORTED_PENDING
  }
}

function getSupportedSuccess(payload) {
  return {
    type: SamsungBKSConstants.GET_SUPPORTED_SUCCESS,
    payload
  }
}

function getSupportedError(error) {
  return {
    type: SamsungBKSConstants.GET_SUPPORTED_ERROR,
    error
  }
}

function getSeedHashPending() {
  return {
    type: SamsungBKSConstants.GET_SEEDHASH_PENDING
  }
}

function getSeedHashSuccess(payload) {
  return {
    type: SamsungBKSConstants.GET_SEEDHASH_SUCCESS,
    payload
  }
}

function getSeedHashError(error) {
  return {
    type: SamsungBKSConstants.GET_SEEDHASH_ERROR,
    error
  }
}

export function getAddressList(hdPath) {
  return async dispatch => {
    dispatch(getAddressListPending())

    return RNSamsungBKS.getAddressList(hdPath)
      .then(result => {
        return dispatch(getAddressListSuccess(result))
      })
      .catch(error => {
        return dispatch(getAddressListError(error))
        throw error
      })
  }
}

export function getSupported() {
  return async dispatch => {
    dispatch(getSupportedPending())

    let isSupported
    try {
      isSupported = await RNSamsungBKS.isSupported()
    } catch (error) {
      return dispatch(getSupportedError(error))
    }

    return dispatch(getSupportedSuccess(isSupported))
  }
}

export function getSeedHash() {
  return async dispatch => {
    dispatch(getSeedHashPending())

    return RNSamsungBKS.getSeedHash()
      .then(result => {
        return dispatch(getSeedHashSuccess(result))
      })
      .catch(error => {
        return dispatch(getSeedHashError(error))
        throw error
      })
  }
}
