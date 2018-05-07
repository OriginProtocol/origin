import {
  Attestations,
  AttestationObject
} from "../src/resources/attestations.js"
import ContractService from "../src/contract-service"
import { expect } from "chai"
import Web3 from "web3"
import fetchMock from "fetch-mock"

const sampleWallet = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
const sampleAttestation = {
  "claim-type": 1,
  data: "some data",
  signature: "0x1a2b3c"
}

let expectParams = (requestBody, params) => {
  params.forEach(param => {
    expect(requestBody[param], `Param ${param} should be in the request`).to
      .exist
  })
}

let expectAttestation = result => {
  expect(result.signature).to.equal(sampleAttestation.signature)
  expect(result.data).to.equal(Web3.utils.soliditySha3(sampleAttestation.data))
  expect(result.claimType).to.equal(sampleAttestation["claim-type"])
}

let setup = () => {
  let provider = new Web3.providers.HttpProvider("http://localhost:8545")
  let web3 = new Web3(provider)
  let contractService = new ContractService({ web3 })
  return new Attestations({ contractService })
}

let setupWithServer = ({
  expectedMethod,
  expectedPath,
  expectedParams,
  responseStub
}) => {
  let provider = new Web3.providers.HttpProvider("http://localhost:8545")
  let web3 = new Web3(provider)
  let contractService = new ContractService({ web3 })
  let serverUrl = "http://fake.url/api/attestations" // fake url
  let fetch = fetchMock.sandbox().mock(
    (requestUrl, opts) => {
      expect(opts.method).to.equal(expectedMethod)
      expect(requestUrl).to.equal(serverUrl + "/" + expectedPath)
      if (expectedParams) {
        let requestBody = JSON.parse(opts.body)
        expectParams(requestBody, expectedParams)
      }
      return true
    },
    { body: JSON.stringify(responseStub) }
  )
  return new Attestations({ fetch, serverUrl, contractService })
}

describe("Attestation Resource", function() {
  this.timeout(5000) // default is 2000

  describe("getIdentityAddress", () => {
    it("should predict identity address from wallet", async () => {
      let attestations = setup()
      let wallet = await attestations.contractService.currentAccount()
      let identityAddress = await attestations.getIdentityAddress(wallet)
      expect(identityAddress).to.be.a("string")
    })
  })

  describe("phoneGenerateCode", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "phone/generate-code",
        responseStub: {}
      })
      let response = await attestations.phoneGenerateCode({
        phone: "555-555-5555"
      })
      expect(response).to.be.an("object")
    })
  })

  describe("phoneVerify", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "phone/verify",
        expectedParams: ["identity", "phone", "code"],
        responseStub: sampleAttestation
      })
      let response = await attestations.phoneVerify({
        wallet: sampleWallet,
        phone: "555-555-5555",
        code: "12345"
      })
      expectAttestation(response)
    })
  })

  describe("emailGenerateCode", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "email/generate-code",
        expectedParams: ["email"],
        responseStub: {}
      })
      let response = await attestations.emailGenerateCode({
        email: "asdf@asdf.asdf"
      })
      expect(response).to.be.an("object")
    })
  })

  describe("emailVerify", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "email/verify",
        expectedParams: ["identity", "email", "code"],
        responseStub: sampleAttestation
      })
      let response = await attestations.emailVerify({
        wallet: sampleWallet,
        email: "asdf@asdf.asdf",
        code: "12345"
      })
      expectAttestation(response)
    })
  })

  describe("facebookAuthUrl", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "GET",
        expectedPath: "facebook/auth-url?redirect-url=http://redirect.url",
        responseStub: { url: "foo.bar" }
      })
      let response = await attestations.facebookAuthUrl({
        redirectUrl: "http://redirect.url"
      })
      expect(response).to.equal("foo.bar")
    })
  })

  describe("facebookVerify", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "facebook/verify",
        expectedParams: ["identity", "code", "redirect-url"],
        responseStub: sampleAttestation
      })
      let response = await attestations.facebookVerify({
        wallet: sampleWallet,
        redirectUrl: "foo.bar",
        code: "12345"
      })
      expectAttestation(response)
    })
  })

  describe("twitterAuthUrl", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "GET",
        expectedPath: "twitter/auth-url",
        responseStub: { url: "foo.bar" }
      })
      let response = await attestations.twitterAuthUrl()
      expect(response).to.equal("foo.bar")
    })
  })

  describe("twitterVerify", () => {
    it("should process the request", async () => {
      let attestations = setupWithServer({
        expectedMethod: "POST",
        expectedPath: "twitter/verify",
        expectedParams: ["identity", "oauth-verifier"],
        responseStub: sampleAttestation
      })
      let response = await attestations.twitterVerify({
        wallet: sampleWallet,
        oauthVerifier: "foo.bar"
      })
      expectAttestation(response)
    })
  })
})
