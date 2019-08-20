import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getIsLoading as getTransferIsLoading
} from '@/reducers/transfer'
import BorderedCard from '@/components/BorderedCard'
import EthAddress from '@/components/EthAddress'

const WithdrawalDetail = props => {
  useEffect(() => {
    props.fetchTransfers()
  }, [])

  if (
    props.transferIsLoading
  ) {
    return (
      <div className="spinner-grow mb-3" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const transfer = props.transfers.find(t => t.id == props.match.params.id)

  if (!transfer) {
    return <div>Transfer not found</div>
  }

  return (
    <>
      <div className="row">
        <div className="col">
          <BorderedCard shadowed={true}>
            <div className="row mb-3">
              <div className="col">
                Amount
              </div>
              <div className="col">
                {transfer.amount.toLocaleString()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                IP
              </div>
              <div className="col">
                {transfer.data.ip}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                UserAgent
              </div>
              <div className="col">
                {transfer.data.device.source}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                Destination
              </div>
              <div className="col">
                <EthAddress address={transfer.toAddress} />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                Time
              </div>
              <div className="col">
                {moment(transfer.createdAt).fromNow()}
              </div>
            </div>
          </BorderedCard>
        </div>
        <div className="col">
          <BorderedCard shadowed={true}>
            <ul>
              <li className="mb-3">Ut non eleifend enim. Curabitur tempor tellus nunc, sit amet vehicula enim porttitor id.</li>
              <li className="mb-3">Nam consequat est mi, eu semper augue interdum nec.</li>
              <li className="mb-3">Duis posuere lectus velit, vitae cursus velit molestie congue.</li>
              <li className="mb-3">Aenean justo tellus, vestibulum sit amet pharetra id, ultricies ut neque.</li>
            </ul>
          </BorderedCard>
        </div>
      </div>
      <small>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed arcu non odio euismod. Donec massa sapien faucibus et molestie. Massa massa ultricies mi quis hendrerit dolor magna. Malesuada fames ac turpis egestas integer.
      </small>
    </>
  )
}

const mapStateToProps = ({ transfer }) => {
  return {
    transfers: getTransfers(transfer),
    transferIsLoading: getTransferIsLoading(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawalDetail)
