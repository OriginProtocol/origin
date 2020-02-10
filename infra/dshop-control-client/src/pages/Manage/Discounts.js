import React, { useEffect } from 'react'
import axios from 'axios'
import { useStoreState } from 'pullstate'

import usePaginate from 'utils/usePaginate'
import Paginate from 'components/Paginate'
import store from '@/store'

const Discounts = () => {
  const backendConfig = useStoreState(store, s => s.backend)

  useEffect(() => {
    const fetchDiscounts = async () => {
      console.debug('Fetching discounts...')
      const response = await axios.get(`${backendConfig.url}/discounts`)
      store.update(s => (s.discounts = response.data))
    }
    fetchDiscounts()
  }, [])

  const discounts = useStoreState(store, s => s.discounts) || []
  const { start, end } = usePaginate()
  const pagedDiscounts = discounts.slice(start, end)

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Discounts</h3>
        {/*
        <SortBy />
        */}
      </div>
      {pagedDiscounts.length > 0 ? (
        <table className="table table-condensed table-bordered table-striped">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Used</th>
              <th>Valid</th>
            </tr>
          </thead>
          <tbody>
            {pagedDiscounts.map((order, i) => (
              <tr key={i}>
                <td>{order.code}</td>
                <td>{order.status}</td>
                <td>{order.used}</td>
                <td>{order.start_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-muted text-center bg-light rounded">
          You don&apos;t have any discounts yet
        </div>
      )}

      <Paginate total={discounts.length} />
    </>
  )
}

export default Discounts
