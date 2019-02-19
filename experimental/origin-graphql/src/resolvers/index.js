import Query from './Query'
import Subscription from './Subscription'
import Web3 from './Web3'
import Account from './Account'
import Marketplace from './Marketplace'
import Listing from './Listing'
import User from './User'
import Offer from './Offer'
import TokenHolder from './TokenHolder'
import Event from './Event'
import Token from './Token'
import Conversation from './messaging/Conversation'
import Messaging from './messaging/Messaging'
import IdentityEvents from './IdentityEvents'
import WalletLinker from './linker/WalletLinker'
import Config from './Config'
import Mutation from '../mutations/index'

export default {
  Query,
  Mutation,
  Subscription,
  Web3,
  Event,
  Account,
  Marketplace,
  Listing,
  UnitListing: Listing,
  FractionalListing: Listing,
  ListingResult: {
    __resolveType(obj) {
      return obj.__typename
    }
  },
  User,
  Offer,
  Token,
  TokenHolder,
  Conversation,
  Messaging,
  IdentityEvents,
  WalletLinker,
  Config
}
