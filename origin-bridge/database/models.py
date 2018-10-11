from database import db
from datetime import datetime
from enum import Enum
from sqlalchemy.dialects import postgresql


class AttestationTypes(Enum):
    PHONE = 1
    EMAIL = 2
    AIRBNB = 3
    FACEBOOK = 4
    TWITTER = 5


class Attestation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    method = db.Column(db.Enum(AttestationTypes))
    eth_address = db.Column(db.String)
    value = db.Column(db.String)
    signature = db.Column(db.String)
    remote_ip_address = db.Column(postgresql.INET)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
