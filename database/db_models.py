from sqlalchemy import func

from database import db

class VerificationCode(db.Model):
    eth_address = db.Column(db.Numeric(precision=50, scale=0), primary_key=True)
    phone = db.Column(db.String(20), index=True)
    code = db.Column(db.String(10))
    expires_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Identity(db.Model):
    eth_address = db.Column(db.Numeric(precision=50, scale=0), primary_key=True)
    phone = db.Column(db.String(20), index=True)
    verified = db.Column(db.Boolean())
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
