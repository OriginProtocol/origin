CREATE TABLE listing (
  id              VARCHAR(32) PRIMARY KEY,
  seller_address  CHAR(42) NOT NULL,        -- Seller's ETH address. 20 bytes, in hexa notation.
  active          BOOLEAN NOT NULL DEFAULT true,
  ipfs_hash       CHAR(68) NOT NULL,        -- JSON's data IPFS hash. 32 bytes in hexa notation (not base58 encoded).
  data            JSONB NOT NULL
);

CREATE INDEX listing_idx_seller_address_active ON listing(seller_address, active);
