CREATE TABLE offer (
  listing_id      VARCHAR(32) NOT NULL,
  offer_id        INT NOT NULL,
  status          SMALLINT NOT NULL,
  seller_address  CHAR(42) NOT NULL, -- Seller's ETH address. 20 bytes in hexa notation.
  buyer_address   CHAR(42) NOT NULL, -- Buyer's ETH address. 20 bytes in hexa notation.
  ipfs_hash       CHAR(68) NOT NULL, -- JSON's data IPFS hash. 32 bytes in hexa notation (not base58 encoded).
  data            JSONB NOT NULL,
  PRIMARY KEY(listing_id, offer_id, status)
);

CREATE INDEX offer_idx_seller_address_status ON offer(seller_address, status);
CREATE INDEX offer_idx_buyer_address_status ON offer(buyer_address, status);
