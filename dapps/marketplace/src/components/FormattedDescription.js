import React, { Fragment } from 'react'

const FormattedDescription = ({ text }) =>
  text.split('\n').map((d, idx) => (
    <Fragment key={idx}>
      {d}
      <br />
    </Fragment>
  ))

export default FormattedDescription
