import React, { useState } from 'react'
import { useStoreState } from 'pullstate'
import { ethers } from 'ethers'
import { get } from 'lodash'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import ipfsClient from 'ipfs-http-client'
import bs58 from 'bs58'

import { baseListing } from '@/constants'
import contracts from '@/constants/contracts'
import store from '@/store'

const Deploy = () => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('Email')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [shopId, setShopId] = useState(null)
  const [redirectTo, setRedirectTo] = useState(null)

  const settings = useStoreState(store, s => s.settings)
  const collections = useStoreState(store, s => s.collections)
  const products = useStoreState(store, s => s.products)
  const ethNetworkId = Number(web3.currentProvider.chainId)
  const config = contracts[ethNetworkId]

  /* Check if a user has an account on the backend,
   */
  const handleEmail = async () => {
    setLoading(true)

    try {
      await checkSellerExists(email)
    } catch (error) {
      console.error(error)
      if (error.response.status === 404) {
        setLoading(false)
        setStep('Password.Create')
      }
      return
    }
    setLoading(false)
    setStep('Password.Login')
  }

  /* If a user already has an account on the backend, they will be logged in. If
   * a user does not have account one will be created and they will be logged in.
   */
  const handlePassword = async () => {
    setLoading(true)

    if (step === 'Password.Create') {
      try {
        await createSeller()
      } catch (error) {
        console.error(error)
        return
      }
    }

    try {
      await loginSeller()
    } catch (error) {
      if (error.response.status === 401) {
        setPasswordError('Invalid password')
      } else {
        console.error(error)
      }
      return
    }

    store.update(s => {
      s.backend = {
        url: settings.backend,
        email,
        password
      }
    })

    setLoading(false)

    const listingId = get(settings.networks, `${ethNetworkId}.listingId`)
    if (!listingId) {
      setStep('Listing')
    } else {
      setStep('Summary')
    }
  }

  /* Check if a seller is already registered
   *
   */
  const checkSellerExists = async email => {
    return await axios.get(`${settings.backend}/auth/${email}`)
  }

  /* Create a seller on the DShop backend
   *
   */
  const createSeller = async () => {
    return await axios.post(`${settings.backend}/auth/registration`, {
      email,
      password,
      name
    })
  }

  /* Log a seller in to the DShop backend
   *
   */
  const loginSeller = async () => {
    return await axios.post(`${settings.backend}/auth/login`, {
      email,
      password
    })
  }

  /* Create a shop on the DShop backend
   *
   */
  const createShop = async () => {
    const authToken = [...Array(30)]
      .map(() => Math.random().toString(36)[2])
      .join('')
    const response = await axios.post(`${settings.backend}/shop`, {
      name: settings.title,
      listingId: settings[ethNetworkId].listingId,
      authToken
    })

    store.update(s => {
      s.settings = {
        ...s.settings,
        networks: {
          ...s.settings.networks[ethNetworkId],
          [ethNetworkId]: {
            ...s.settings.networks[ethNetworkId],
            shopId: response.data.s
          }
        }
      }
    })
  }

  /* Update the configuration for a shop on the DShop backend
   *
   */
  const updateShopConfig = async dataUrl => {
    return await axios.post(`${settings.backend}/shop`, {
      shopId,
      config: {
        data_url: dataUrl
      }
    })
  }

  const deploy = async () => {
    setLoading(true)

    if (!settings[ethNetworkId].shopId) {
      await createShop()
    }

    await uploadToIpfs()
    await updateShopConfig()

    setLoading(false)
  }

  const uploadToIpfs = async () => {
    // Put the shop on IPFS
    const response = await axios.post(`${API_URL}/deploy`, {
      settings,
      collections,
      products
    })

    return `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.data}`
  }

  /* Create a listing on the Origin Marketplace contract
   *
   */
  const createListing = async () => {
    if (!config) {
      console.error(`No configuration for network`, ethNetworkId)
      return
    }

    if (!window.ethereum) return

    setLoading(true)

    await window.ethereum.enable()
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const ipfs = ipfsClient(process.env.IPFS_API_URL)

    const signer = provider.getSigner(0)
    const abi = [
      'event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash)',
      'function createListing(bytes32, uint256, address)'
    ]
    const marketplaceContract = new ethers.Contract(
      config['Marketplace_V01'],
      abi,
      signer
    )
    const listing = {
      ...baseListing,
      title: settings.title,
      description: settings.title
    }

    const response = await ipfs.add(Buffer.from(JSON.stringify(listing)))
    const bytes32Hash = `0x${bs58
      .decode(response[0].hash)
      .slice(2)
      .toString('hex')}`
    await marketplaceContract.createListing(bytes32Hash, 0, config.arbitrator)

    // Wait for ListingCreated event to get listingID
    // Event filter for ListingCreated event with the same IPFS hash, ignore other
    // parameters
    const eventFilter = marketplaceContract.filters.ListingCreated(
      signer._address,
      null,
      null
    )

    const listingId = await new Promise(resolve => {
      marketplaceContract.on(eventFilter, (party, listingId, ipfsHash) => {
        console.debug(`Created listing ${listingId} ${ipfsHash}`)
        resolve(`${ethNetworkId}-001-${Number(listingId)}`)
      })
    })

    store.update(s => {
      s.settings = {
        ...s.settings,
        networks: {
          ...s.settings.networks,
          [ethNetworkId]: {
            marketplaceContract: config['Marketplace_V01'],
            listingId,
            affiliate: '',
            arbitrator: config.arbitrator,
            ipfsGateway: config.ipfsGateway,
            ipfsApi: config.ipfsApi
          }
        }
      }
    })

    setLoading(false)
  }

  const renderEmailForm = () => {
    return (
      <>
        <div className="my-5">
          <p>
            Great! You&apos;ve elected to use Origin&apos;s hosted backend to
            deliver email notifications and manage orders and discounts (if
            you&apos;d prefer to host it yourself, please refer to the
            documentation).
          </p>

          <p>
            Please enter the email address you&apos;d like to use for DShop
            related notifications. If we find you&apos;ve already got an
            account, we&apos;ll use that, otherwise we&apos;ll create one for
            you.
          </p>
        </div>

        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card p-5">
              <form className="mt-3" onSubmit={handleEmail}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className="form-control input-lg"
                    onChange={e => setEmail(e.target.value)}
                    value={email}
                    placeholder="Email address"
                  />
                </div>
                <div className="mt-5">
                  <button
                    type="submit"
                    className="btn btn-lg btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderPasswordForm = () => {
    return (
      <>
        <div className="my-5">
          {step === 'Password.Create' && (
            <p>
              You don&apos;t have an account. We&apos;ll create one now for you.
              Please enter a password.
            </p>
          )}
          {step === 'Password.Login' && (
            <p>
              It looks like you have an account, please enter your password.
            </p>
          )}
        </div>

        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card p-5">
              <form className="mt-3" onSubmit={handlePassword}>
                {step === 'Password.Create' && (
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      className="form-control input-lg"
                      onChange={e => setName(e.target.value)}
                      value={name}
                      placeholder="Name"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control input-lg"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                    placeholder="Password"
                  />
                </div>
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
                <div className="mt-5">
                  <button
                    type="submit"
                    className="btn btn-lg btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderListingForm = () => {
    return (
      <div className="my-5">
        <p>
          Now we will create a listing on the Origin marketplace contract for
          your DShop. You&apos;ll be prompted to sign a transaction in MetaMask.
        </p>
        <div className="mt-5">
          <button onClick={createListing} className="btn btn-lg btn-primary">
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                disabled={loading}
              ></span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    )
  }

  const renderSummary = () => {
    return (
      <div className="my-5">
        <p>Great, you are done. Your DSHop has been deployed at...</p>
        <div className="mt-5">
          <button
            onClick={() => setRedirectTo('/manage')}
            className="btn btn-lg btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              'Open Management Dashboard'
            )}
          </button>
        </div>
      </div>
    )
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Deploy</h3>
      </div>

      {step === 'Email' && renderEmailForm()}
      {(step === 'Password.Create' || step === 'Password.Login') &&
        renderPasswordForm()}
      {step === 'Listing' && renderListingForm()}
      {step === 'Summary' && renderSummary()}
    </>
  )
}

export default Deploy
