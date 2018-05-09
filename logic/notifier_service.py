from database import db
from database.db_models import EthNotificationEndpoint, EthNotificationTypes, Listing
from util.contract import ContractHelper
from util.ipfs import hex_to_base58, IPFSHelper
from config import settings
from enum import Enum

#for apns2
from apns2.client import APNsClient
from apns2.payload import Payload

PurchaseStages = ContractHelper.get_contract_enums("Purchase", "Stages")

class Notification(Enum):
    LIST = 1
    SOLD = 2
    PURCHASED = 3
    UPDATED = 4
    PENDING_PAYMENT = 5
    PENDING_PAY = 6
    PENDING_SHIP = 7
    PENDING_SHIPMENT = 8
    PENDING_BUYER_CONFIRMATION = 9
    PENDING_BUY_CONFIRM = 10
    PENDING_SELLER_CONFIRM = 11
    PENDING_SELLER_CONFIRMATION = 12
    SELLER_DISPUTE = 13
    BUYER_DISPUTE = 14
    SELLER_REVIEW = 15
    BUYER_REVIEW = 16

notification_messages = {
        Notification.LIST:"New listing online:{name}",
        Notification.SOLD:"You just sold {name}",
        Notification.PURCHASED:"You just purchased {name}",
        Notification.UPDATED:"Your listing, {name} has been updated",
        Notification.PENDING_PAYMENT:"Waiting for buyer payment",
        Notification.PENDING_PAY:"Payment required",
        Notification.PENDING_SHIP:"Waiting on shipment",
        Notification.PENDING_SHIPMENT:"Item is being shipped",
        Notification.PENDING_BUYER_CONFIRMATION:"Waiting for buyer confirmation",
        Notification.PENDING_BUY_CONFIRM:"Please confirm purchase",
        Notification.PENDING_SELLER_CONFIRM:"Please confirm sale",
        Notification.PENDING_SELLER_CONFIRMATION:"Waiting on seller confirmation",
        Notification.SELLER_DISPUTE:"Your item is in dispute",
        Notification.BUYER_DISPUTE:"Your purchase is in dispute",
        Notification.SELLER_REVIEW:"Your item is in review",
        Notification.BUYER_REVIEW:"Your purchase is in review"
        }

require_verified_messages = () #list of types in here

def register_eth_notification(eth_address, type, device_token, verification_signature = None):
    #todo check verification sig if we want this to be a verified endpoint
    notification_obj = EthNotificationEndpoint(eth_address = eth_address,
                        device_token = device_token,
                        type = type,
                        active = True)
    db.session.add(notification_obj)
    db.session.commit()

def send_apn_notification(message, endpoint):
    token = endpoint.device_token
    payload = Payload(alert=message, sound = "default", badge = 1)
    if settings.APNS_CERT_FILE:
        client = APNsClient(settings.APNS_CERT_FILE, password = settings.APNS_CERT_PASSWORD, use_sandbox = settings.DEBUG, use_alternative_port=False)
        topic = settings.APNS_APP_BUNDLE_ID
        client.send_notification(token, payload, topic)

def send_notification(notify_address, notification_type, **data):
    for notification_endpoint in EthNotificationEndpoint.query.filter_by(eth_address=notify_address, active = True):
        notify_message = notification_messages[notification_type].format(**data)
        if notification_endpoint.type == EthNotificationTypes.APN:
            #send apn notification here
            send_apn_notification(notify_message, notification_endpoint)
        elif notification_endpoint.type == EthNotificationTypes.FCM:
            #send FCM notification here
            pass

def get_listing_picture(listing_obj, index = 0):
    data = IPFSHelper().file_from_hash(listing_obj.ipfs_hash, root_attr='data')
    if data:
        pictures = data.get('pictures')
        if isinstance(pictures, list) and len(pictures) > index:
            return pictures[index]

def listing_info(listing_obj):
    return dict(name = listing_obj.ipfs_data.get('name'),
            description = listing_obj.ipfs_data.get('description'),
            pictures = get_listing_picture(listing_obj))


def notify_purchased(purchase_obj):
    if not purchase_obj.listing_address:
        return

    seller_notification, buyer_notification = {
            PurchaseStages.COMPLETE: (Notification.SOLD, Notification.PURCHASED),
            PurchaseStages.AWAITING_PAYMENT: (Notification.PENDING_PAYMENT, Notification.PENDING_PAY),
            PurchaseStages.SHIPPING_PENDING: (Notification.PENDING_SHIP, Notification.PENDING_SHIPMENT),
            PurchaseStages.BUYER_PENDING: (Notification.PENDING_BUYER_CONFIRMATION, Notification.PENDING_BUY_CONFIRM),
            PurchaseStages.SELLER_PENDING: (Notification.PENDING_SELLER_CONFIRM, Notification.PENDING_SELLER_CONFIRMATION),
            PurchaseStages.IN_DISPUTE: (Notification.SELLER_DISPUTE, Notification.BUYER_DISPUTE),
            PurchaseStages.REVIEW_PERIOD: (Notification.SELLER_REVIEW, Notification.BUYER_REVIEW)
            }.get(PurchaseStages(purchase_obj.stage), (None, None))

    if seller_notification or buyer_notification:
        listing_obj = Listing.query.filter_by(contract_address=purchase_obj.listing_address).first()
        if listing_obj:
            listing_params = listing_info(listing_obj)
            seller_notification and send_notification(listing_obj.owner_address, seller_notification, **listing_params)
            buyer_notification and send_notification(purchase_obj.buyer_address, buyer_notification, **listing_params)


def notify_listing(listing_obj):
    listing_params = listing_info(listing_obj)
    send_notification(listing_obj.owner_address, Notification.LIST, **listing_params)

def notify_listing_update(listing_obj):
    listing_params = listing_info(listing_obj)
    send_notification(listing_obj.owner_address, Notification.UPDATED, **listing_params)
