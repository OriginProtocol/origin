import React, { useState, useEffect } from 'react'
import get from 'lodash/get'

import useConfig from 'utils/useConfig'
import useIsMobile from 'utils/useIsMobile'
import { useStateValue } from 'data/state'

const Uphold = ({ value, onChange }) => {
  const { config } = useConfig()
  const [{ cart }, dispatch] = useStateValue()
  const isMobile = useIsMobile()
  const [upholdAuth, setUpholdAuth] = useState()
  const [redirect, setRedirect] = useState()
  const [upholdCards, setUpholdCards] = useState([])
  const paymentMethods = get(config, 'paymentMethods', [])
  const paymentMethod = get(cart, 'paymentMethod.id')
  const upholdPaymentMethod = paymentMethods.find(o => o.id === 'uphold')
  if (!upholdPaymentMethod) {
    return null
  }

  useEffect(() => {
    if (!config.backend) {
      return
    }
    async function checkAuthed() {
      const url = `${config.backend}/uphold/authed`
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          authorization: `bearer ${config.backendAuthToken}`
        }
      })
      const json = await res.json()
      setRedirect(json.redirect)
      setUpholdAuth(json.authed ? true : false)
    }
    checkAuthed()
  }, [config])

  useEffect(() => {
    if (!upholdAuth) {
      return
    }
    async function getCards() {
      const url = `${config.backend}/uphold/cards`
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          authorization: `bearer ${config.backendAuthToken}`
        }
      })
      const json = await res.json()
      if (typeof json === 'object' && json[0]) {
        setUpholdCards(json)
        onChange(json[0].id)
      }
    }
    getCards()
  }, [upholdAuth])

  const selectedCard = upholdCards.find(c => c.id === value)
  const hasBalance =
    selectedCard && selectedCard.normalizedBalance * 100 >= cart.total

  return (
    <>
      <label
        className={`radio align-items-center${
          paymentMethod === 'uphold' ? '' : ' inactive'
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          checked={paymentMethod === 'uphold'}
          onChange={() =>
            dispatch({
              type: 'updatePaymentMethod',
              method: upholdPaymentMethod
            })
          }
        />
        Uphold
      </label>

      {paymentMethod === 'uphold' && (
        <div className="pl-4 pb-3 pt-3">
          {upholdAuth ? (
            <>
              <table className="table table-sm table-hover uphold-cards">
                <thead>
                  <tr>
                    <th>Select a card:</th>
                    {isMobile ? null : <th>Amount</th>}
                    <th>Amount (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {upholdCards.map(card => {
                    return (
                      <tr key={card.id} onClick={() => onChange(card.id)}>
                        <td>
                          <input
                            type="radio"
                            className="mr-2"
                            checked={value === card.id}
                            onChange={() => onChange(card.id)}
                          />
                          <span
                            className={`uphold-currency currency--${card.currency.toLowerCase()}`}
                          >
                            {card.currency}
                          </span>
                          {isMobile ? null : (
                            <span className="d-none d-xl-inline">
                              {card.label}
                            </span>
                          )}
                        </td>
                        {isMobile ? null : (
                          <td>{`${card.balance} ${card.currency}`}</td>
                        )}
                        <td>{`$ ${card.normalizedBalance} USD`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {/* <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="form-control"
              >
                {upholdCards.map(card => {
                  const label = `${card.label}: $${card.normalizedBalance} (${card.balance} ${card.currency})`
                  return (
                    <option key={card.id} value={card.id}>
                      {label}
                    </option>
                  )
                })}
              </select> */}
            </>
          ) : (
            <a
              href={redirect}
              onClick={e => {
                e.preventDefault()
                const w = window.open(redirect, '', 'width=330,height=400')
                const finish = e => {
                  console.log('Got data', e.data)
                  if (!String(e.data).match(/ok/)) {
                    return
                  }
                  setUpholdAuth(true)

                  window.removeEventListener('message', finish, false)

                  if (!w.closed) {
                    w.close()
                  }
                }
                window.addEventListener('message', finish, false)
              }}
            >
              <img src="images/connect_with_uphold.svg" />
            </a>
          )}

          {hasBalance || !upholdAuth || !upholdCards.length ? null : (
            <div className="alert alert-danger mt-3 mb-0">
              Insufficient balance
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Uphold

require('react-styl')(`
  .uphold-cards
    tr
      cursor: pointer
      font-size: 0.875rem
      th
        border-top: 0
  .uphold-currency
    padding: 2px
    display: inline-block
    border-radius: 3px
    margin-right: 0.5rem
    width: 2.5rem
    color: #fff
    text-align: center
    font-size: 0.75rem
  .currency--aapl
    background-color: #000

  .currency--ada
    background-color: #0d1e30

  .currency--adbe
    background-color: #ed1c24

  .currency--aed
    background-color: #248d48

  .currency--amd
    background-color: #000

  .currency--amzn
    background-color: #ff9d22

  .currency--ars
    background-color: #75aadb

  .currency--atom
    background-color: #1b1e36

  .currency--aud
    background-color: #febd23

  .currency--ba
    background-color: #115fab

  .currency--baba
    background-color: #ff6a00

  .currency--bac
    background-color: #e31837

  .currency--bat
    background-color: #808696

  .currency--bch
    background-color: #f7931a

  .currency--bgn
    background-color: #00966e

  .currency--bmy
    background-color: #be2bbb

  .currency--brk.b
    background-color: #452138

  .currency--brl
    background-color: #2d6447

  .currency--btc
    background-color: #ffb251

  .currency--btg
    background-color: #eba808

  .currency--c
    background-color: #452138

  .currency--cad
    background-color: #ed2939

  .currency--chf
    background-color: #d52b1e

  .currency--cmcsa
    background-color: #0089cf

  .currency--cny
    background-color: #eb4242

  .currency--csco
    background-color: #049fd9

  .currency--czk
    background-color: #d7141a

  .currency--dash
    background-color: #1b77b8

  .currency--dcr
    background-color: #2ed6a1

  .currency--dhr
    background-color: #013c81

  .currency--dis
    background-color: #1300bc

  .currency--dgb
    background-color: #06c

  .currency--dkk
    background-color: #cc0001

  .currency--doge
    background-color: #c2a633

  .currency--eem
    background-color: #176cd2

  .currency--efa
    background-color: #1780d2

  .currency--eos
    background-color: #111a44

  .currency--eth
    background-color: #444341

  .currency--eur
    background-color: #557bc8

  .currency--ewz
    background-color: #1776d2

  .currency--fb
    background-color: #1777f2

  .currency--fxi
    background-color: #179ed2

  .currency--gbp
    background-color: #9f6ecc

  .currency--gdx
    background-color: #221e1f

  .currency--gld
    background-color: #13a96c

  .currency--goog
    background-color: #34a853

  .currency--googl
    background-color: #4285f4

  .currency--hd
    background-color: #ee7125

  .currency--hkd
    background-color: #c8102e

  .currency--hrk
    background-color: #ff202d

  .currency--huf
    background-color: #087b39

  .currency--hyg
    background-color: #1794d2

  .currency--ils
    background-color: #69f

  .currency--inr
    background-color: #f47500

  .currency--intc
    background-color: #0071c5

  .currency--iota
    background-color: #000

  .currency--isk
    background-color: #00589d

  .currency--ivv
    background-color: #17a8d2

  .currency--iwm
    background-color: #1762d2

  .currency--jnj
    background-color: #d51900

  .currency--jpm
    background-color: #117aca

  .currency--jpy
    background-color: #ccc

  .currency--kes
    background-color: #a1250f

  .currency--lba
    background-color: #0957c3

  .currency--link
    background-color: #2a5ada

  .currency--lqd
    background-color: #178ad2

  .currency--ltc
    background-color: #6d6d6d

  .currency--ma
    background-color: #f90

  .currency--msft
    background-color: #737373

  .currency--mu
    background-color: #0077c8

  .currency--mxn
    background-color: #005d40

  .currency--nano
    background-color: #4a90e2

  .currency--neo
    background-color: #58bf00

  .currency--nflx
    background-color: #e50914

  .currency--nok
    background-color: #ef2b2d

  .currency--nvda
    background-color: #77b900

  .currency--nzd
    background-color: #212121

  .currency--omg
    background-color: #1a53f0

  .currency--pg
    background-color: #003cae

  .currency--php
    background-color: #4169e1

  .currency--pln
    background-color: crimson

  .currency--qqq
    background-color: #193989

  .currency--roku
    background-color: #6c3c97

  .currency--ron
    background-color: #fcd116

  .currency--sek
    background-color: #0071b8

  .currency--sgd
    background-color: #f42a41

  .currency--spy
    background-color: #189f71

  .currency--storm
    background-color: #6b38df

  .currency--t
    background-color: #00a8e0

  .currency--tlt
    background-color: #17b2d2

  .currency--tqqq
    background-color: #03576a

  .currency--trx
    background-color: #dc062b

  .currency--tsla
    background-color: #c00

  .currency--unh
    background-color: #1c3d95

  .currency--usd
    background-color: #5a9f4f

  .currency--upbtc
    background-color: #2744f7

  .currency--upeur
    background-color: #2744f7

  .currency--upt
    background-color: #2744f7

  .currency--upusd
    background-color: #2744f7

  .currency--v
    background-color: #00579f

  .currency--vox
    background-color: #4a4a4f

  .currency--wfc
    background-color: #b31e30

  .currency--xag
    background-color: #b2b2b2

  .currency--xau
    background-color: #eed06f

  .currency--xem
    background-color: #78b6e4

  .currency--xlf
    background-color: #0fbd67

  .currency--xlm
    background-color: #000

  .currency--xlu
    background-color: #1c8b76

  .currency--xom
    background-color: #ed1b2d

  .currency--xpd
    background-color: #acb4b7

  .currency--xpt
    background-color: #c9bcb5

  .currency--xrp
    background-color: #222

  .currency--zil
    background-color: #00c3bf

  .currency--zrx
    background-color: #000

  .currency--brave
    background-color: #ff2000

`)
