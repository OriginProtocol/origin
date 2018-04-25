from sqlalchemy import func

from database import db


class VerificationCode(db.Model):
    phone = db.Column(db.String(20), index=True)
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

    price = db.Column(db.Integer())
    units = db.Column(db.Integer())
    expired = db.Column(db.Boolean())

    ipfs_hash = db.Column(db.String(255))
    ipfs_data = db.Column(db.JSON())

    created_at = db.Column(db.DateTime(timezone=True))
    expires_at = db.Column(db.DateTime(timezone=True))


class EventTracker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_read = db.Column(db.Integer())
