from sqlalchemy import func

from database import db
from .notification_models import *  # NOQA


class VerificationCode(db.Model):
    email = db.Column(db.String(256), index=True)
    code = db.Column(db.String(10), primary_key=True)
    expires_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(
        db.DateTime(
            timezone=True),
        server_default=func.now())
    updated_at = db.Column(
        db.DateTime(
            timezone=True),
        server_default=func.now(),
        onupdate=func.now())


class Listing(db.Model):
    contract_address = db.Column(db.String(255),
                                 primary_key=True)
    owner_address = db.Column(db.String(255), index=True)
    registry_id = db.Column(db.Integer())

    price = db.Column(db.Numeric(10, 2))
    units = db.Column(db.Integer())
    expired = db.Column(db.Boolean())

    ipfs_hash = db.Column(db.String(255))
    ipfs_data = db.Column(db.JSON())

    created_at = db.Column(db.DateTime(timezone=True))
    expires_at = db.Column(db.DateTime(timezone=True))


class EventTracker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    block_index = db.Column(db.Integer())
    transaction_index = db.Column(db.Integer())
    log_index = db.Column(db.Integer())


class Purchase(db.Model):
    contract_address = db.Column(db.String(255),
                                 primary_key=True)
    buyer_address = db.Column(db.String(255),
                              index=True)
    listing_address = db.Column(db.String(255),
                                db.ForeignKey('listing.contract_address'),
                                nullable=False)
    stage = db.Column(db.Integer())
    created_at = db.Column(db.DateTime(timezone=True))
    buyer_timeout = db.Column(db.DateTime(timezone=True))


class Review(db.Model):
    ROLES = ['buyer', 'seller']

    id = db.Column(db.Integer, primary_key=True)
    contract_address = db.Column(db.String(255),
                                 db.ForeignKey('purchase.contract_address'),
                                 nullable=False)
    reviewer_address = db.Column(db.String(255),
                                 index=True)
    reviewee_address = db.Column(db.String(255),
                                 index=True)
    rating = db.Column(db.Integer())
    role = db.Column(db.Enum(*ROLES, name='roles'), nullable=False)
    ipfs_hash = db.Column(db.String(255))
    ipfs_data = db.Column(db.JSON())
