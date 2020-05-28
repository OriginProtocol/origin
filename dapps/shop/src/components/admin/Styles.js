/*
  Styles
*/

require('react-styl')(`
  .admin
    margin-bottom: 5rem
    -webkit-font-smoothing: antialiased
    h1,h2,h3
      color: #000
    h1
      font-size: 24px
    nav
      border-bottom: 1px solid #dfe2e6
      padding: 1.25rem 0
      margin-bottom: 4rem
      color: #000
      > .container
        display: flex
        align-items: center
        justify-content: between
        flex-wrap: wrap
      h1
        margin: 0
        display: flex
        flex: 1
        font-size: 1rem
        img
          max-height: 2.5rem
        div
          display: flex
          align-items: center
          margin-left: 1rem
          padding-left: 1rem
          border-left: 1px solid #5666
    .table
      thead
        th
          background-color: #f8f8f8
          font-size: 14px
          color: #666
          font-weight: normal
          border-bottom-width: 1px
          padding: 0.5rem 0.75rem
    form
      label:not(.form-check-label)
        font-weight: 600
    .admin-title
      display: flex
      align-items: center
      &.with-border
        padding-bottom: 1rem
        border-bottom: 1px solid #dfe2e6
        margin-bottom: 1.5rem
      .muted
        color: #666
      .chevron
        margin: 0 1rem
        &::before
          content: ""
          display: inline-block
          width: 10px
          height: 10px
          border-width: 0 2px 2px 0
          border-style: solid
          border-color: #3b80ee
          transform: rotate(-45deg) translateY(-4px);
`)
