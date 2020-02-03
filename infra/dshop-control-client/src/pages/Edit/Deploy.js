import React, { useState } from 'react'
import { useStoreState } from 'pullstate'
import { ethers } from 'ethers'
import { get } from 'lodash'
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
  const [name, setName] = useState('')

  const settings = useStoreState(store, s => s.settings)
  const backendUrl = settings.backend
  const ethNetworkId = Number(web3.currentProvider.chainId)
  const config = contracts[ethNetworkId]

  /* Check if a user has an account on the backend,
   */
  const handleEmail = async () => {
    try {
      await axios.get(`${backendUrl}/auth/${email}`)
    } catch (error) {
      if (error.response.status === 404) {
        setStep('Password.Create')
      }
      return
    }
    setStep('Password.Login')
  }

  /* If a user already has an account on the backend, they will be logged in. If
   * a user does not have account one will be created and they will be logged in.
   */
  const handlePassword = async () => {
    try {
      if (step === 'Password.Create') {
        await axios.post(`${backendUrl}/auth/registration`, {
          email,
          password,
          name
        })
      } else if (step === 'Password.Login') {
        await axios.post(`${backendUrl}/auth/login`, {
          email,
          password
        })
      }
    } catch (error) {
      console.error(error)
      return
    }

    const listingId = get(settings.networks, `${ethNetworkId}.listingId`)
    if (!listingId) {
      setStep('Listing')
    } else {
      setStep('Summary')
    }
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

    const eventPromise = new Promise(resolve => {
      marketplaceContract.on(eventFilter, (party, listingId, ipfsHash) => {
        console.debug(`Created listing ${listingId} ${ipfsHash}`)
        resolve(`${ethNetworkId}-001-${Number(listingId)}`)
      })
    })

    return eventPromise
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
                  <button type="submit" className="btn btn-lg btn-primary">
                    Continue
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
                    className="form-control input-lg"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                    placeholder="Password"
                  />
                </div>
                <div className="mt-5">
                  <button type="submit" className="btn btn-lg btn-primary">
                    Continue
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
            Continue
          </button>
        </div>
      </div>
    )
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
    </>
  )
}

export default Deploy

require('react-styl')(`
`)
