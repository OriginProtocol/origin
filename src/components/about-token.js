import React from 'react'
import { FormattedMessage } from 'react-intl'

const AboutToken = () => {
  return (
    <div className="about-token-wrapper">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h1>
              <FormattedMessage
                id={'about-token.about'}
                defaultMessage={'About Origin Tokens & Boosting Listings'}
              />
            </h1>
            <h3 className="lead">
              <FormattedMessage
                id={'about-token.use'}
                defaultMessage={'What are Origin Tokens used for?'}
              />
            </h3>
            <h6>
              <strong>
                <FormattedMessage
                  id={'about-token.boosting'}
                  defaultMessage={'Boosting'}
                />
              </strong>
            </h6>
            <p>
              <FormattedMessage
                id={'about-token.boosting-text'}
                defaultMessage={'Vivamus faucibus tortor ultrices arcu consectetur convallis. Fusce eget fringilla velit, vitae dignissim ipsum. Curabitur hendrerit, massa sit amet molestie tincidunt, lacus purus aliquam urna, at venenatis nibh dui sit amet nunc. Nunc tortor leo, pretium id convallis et, sollicitudin in ex.'}
              />
  	        </p>
            <h6>
              <strong>
                <FormattedMessage
                  id={'about-token.arbitration'}
                  defaultMessage={'Arbitration'}
                />
              </strong>
            </h6>
            <p>
              <FormattedMessage
                id={'about-token.arbitration-text'}
                defaultMessage={'Vivamus faucibuss tortor ultrices arcu consectetur convallis. Fusce eget fringilla velit, vitae dignissim ipsum. Curabitur hendrerit, massa sit amet molestie tincidunt, lacus purus aliquam urna, at venenatis nibh dui sit amet nunc. Nunc tortor leo, pretium id convallis et, sollicitudin in ex.'}
              />
            </p>
            <h3 className="lead lead-text">
              <FormattedMessage
                id={'about-token.buying-tokens'}
                defaultMessage={'Where can I buy Origin Tokens?'}
              />
            </h3>
            <h6>
              <strong>
                <FormattedMessage
                  id={'about-token.exchanges'}
                  defaultMessage={'List of Approved Exchanges'}
                />
              </strong>
            </h6>
            <p>
              <FormattedMessage
                id={'about-token.exchanges-text'}
                defaultMessage={'The following are the only approved exchanges where you can buy Origin Tokens. Never attempt to buy anywhere else.'}
              />
            </p>
            <p>
              <a href="#">
                <FormattedMessage
                  id={'about-token.exchange-1'}
                  defaultMessage={'Exchange Name >'}
                />
              </a>
            </p>
            <p>
              <a href="#">
                <FormattedMessage
                  id={'about-token.exchange-2'}
                  defaultMessage={'Exchange Name >'}
                />
              </a>
            </p>
            <p>
              <a href="#">
                <FormattedMessage
                  id={'about-token.exchange-3'}
                  defaultMessage={'Exchange Name >'}
                />
              </a>
            </p>
\            <h3 className="lead lead-text">
              <FormattedMessage
                id={'about-token.earn'}
                defaultMessage={'Can I earn Origin Tokens?'}
              />
            </h3>
            <h6>
              <strong>
                <FormattedMessage
                  id={'about-token.earning'}
                  defaultMessage={'Earning Origin Tokens'}
                />
              </strong>
            </h6>
            <p>
              <FormattedMessage
                id={'about-token.earning-text'}
                defaultMessage={'You can earn Origin Tokens by following any of the steps below:'}
              />
            </p>
            <ul>
              <li>
                <FormattedMessage
                  id={'about-token.earn-step-1'}
                  defaultMessage={'Do this to earn tokens'}
                />
              </li>
              <li>
                <FormattedMessage
                  id={'about-token.earn-step-2'}
                  defaultMessage={'Do this to earn tokens'}
                />
              </li>
              <li>
                <FormattedMessage
                  id={'about-token.earn-step-3'}
                  defaultMessage={'Do this to earn tokens'}
                />
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <div className="video-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutToken
