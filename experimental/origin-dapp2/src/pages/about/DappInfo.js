import React, { Component } from 'react';
import { Query } from "react-apollo";
import query from "queries/Config";

const DAPP_VERSION = require('../../../package.json').version



const sectionThead = ({title}) => (<thead>
        <tr><th colSpan="2"><h3>{title}</h3></th></tr>
    </thead>)
const dataTr = ({key, value}) => <tr key={key}><th>{key}</th><td>{value}</td></tr>

class DappInfo extends Component {
  render() {
    return <div className="container">
      <h1>About Dapp</h1>
      <p>Developer information about this Dapp's current build and configuration.</p>
      <table className="ConfigTable">

        {sectionThead({title: "Dapp Config"})}
        <tbody>
            {dataTr({ key:"DAPP Version", value: DAPP_VERSION })}
        </tbody>

        {sectionThead({title: "Origin GraphQL Config"})}
        <Query
          query={query}
          notifyOnNetworkStatusChange={true}
        >
            {({ error, data, fetchMore, networkStatus }) => {
              if (networkStatus === 1) {
                  return <tbody><tr><td>Loading...</td></tr></tbody>;
              } else if (error) {
                  return <tbody><tr><td>Error :(</td></tr></tbody>;
              }
              return <tbody>
                {dataTr({ key:"Network", value: data.config })}
                {Object.entries(data.configObj).map((entry)=>{
                  let [key, value] = entry
                  if(key == "__typename") { return }
                  return dataTr({ key, value })
                })}
              </tbody>
            }}
          </Query>

      </table>
    </div>
  }
}

require("react-styl")(`
  .ConfigTable
    thead
      th
        border-bottom: solid 1px #eee
      h3
        margin-top: 1.4rem
        margin-bottom: 0.3rem
`);

export default DappInfo






