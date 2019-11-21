import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'

import useIsMobile from 'utils/useIsMobile'
import Site from 'constants/Site'
import dataUrl from 'utils/dataUrl'

import Bars from 'components/icons/Bars.js'
import Link from 'components/Link'

import Nav from './_Nav'
import MobileMenu from './_MobileMenu'
import Products from './Products'
import Product from './Product'
import About from './About'
import Cart from './cart/Cart'

const Content = () => (
  <>
    <main>
      <Switch>
        <Route path="/products/:id" component={Product} />
        <Route path="/cart" component={Cart} />
        <Route
          path="/collections/:collection/products/:id"
          component={Product}
        ></Route>
        <Route path="/collections/:collection" component={Products} />
        <Route path="/search" component={Products} />
        <Route path="/about" component={About} />
        <Route component={Products} />
      </Switch>
    </main>
    <div className="footer my-4 py-4">&copy; 2019 Origin Protocol</div>
  </>
)

const Main = () => {
  const isMobile = useIsMobile()
  const [menu, setMenu] = useState(false)
  if (isMobile) {
    return (
      <>
        <div className="container">
          <header>
            <Link to="/" onClick={() => setMenu(false)}>
              <h1>
                {Site.logo ? <img src={`${dataUrl()}${Site.logo}`} /> : null}
                {Site.title}
              </h1>
            </Link>
            <button className="btn" onClick={() => setMenu(!menu)}>
              <Bars />
            </button>
          </header>
          <MobileMenu open={menu} onClose={() => setMenu(false)} />
          <Content />
        </div>
      </>
    )
  }
  return (
    <>
      <Nav />
      <div className="container">
        <header>
          <Link to="/">
            <h1>
              {Site.logo ? <img src={`${dataUrl()}${Site.logo}`} /> : null}
              {Site.title}
            </h1>
          </Link>
          {!Site.byline ? null : (
            <div dangerouslySetInnerHTML={{ __html: Site.byline }} />
          )}
        </header>
        <Content />
      </div>
    </>
  )
}

export default Main

require('react-styl')(`
  header
    display: flex
    align-items: center
    justify-content: space-between
    margin-top: 2rem
    margin-bottom: 2rem
    flex-wrap: wrap
    > a
      color: #000
    h1
      display: flex
      font-size: 38px
      font-weight: 300
      svg,img
        width: 2rem
        margin-right: 1rem

  main
    min-height: 5rem

  .footer
    border-top: 1px solid #eee
    font-size: 12px

  .breadcrumbs
    margin-bottom: 1.5rem
    a,span
      &:after
        content: "›"
        padding: 0 0.25rem
      &:last-child:after
        content: ""

  @media (max-width: 767.98px)
    body
      border-top: 5px solid black
    header
      margin-top: 1rem
      margin-bottom: 1rem
      .icon-bars
        width: 2rem
      h1
        margin: 0
        font-weight: 300
        font-size: 2rem
        svg,img
          width: 1.5rem
          margin-right: 0.75rem
    .footer
      text-align: center
`)
