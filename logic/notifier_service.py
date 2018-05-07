from database.db_models import EthNotificationToken, EthNotificationType
from util import ContractHelper
from util.ipfs import hex_to_base58, IPFSHelper
from enum import Enum

PurchaseStages = ContractHelper.get_contract_enums("Purchase", "Stages")

class Notification(Enum):
    LIST = 1
    SOLD = 2
    PURCHASED = 3
    UPDATED = 4
    SOLD_UPDATE = 5
    PURCHASED_UPDATE = 6

notification_messages = {
        Notification.LIST:"New listing online:%{name}",
        Notification.SOLD:"You just sold %{name}",
        Notification.PURCHASED:"You just bought %{name}",
        Notification.UPDATED:"Your listing, %{name} has been updated",
        Notification.PENDING_PAYMENT:"Waiting for buyer payment",
        Notification.PENDING_PAY:"Payment required",
        Notification.Notification.PENDING_SHIP:"Waiting on shipment",
        Notification.PENDING_SHIPMENT:"Item is being shipped",
        Notification.PENDING_BUYER_CONFIRMATION:"Waiting for buyer confirmation",
        Notification.PENDING_BUY_CONFIRM:"Please confirm purchase",
        Notification.PENDING_SELLER_CONFIRM:"Please confirm sale",
        Notification.PENDING_SELLER_CONFIRMATION:"Waiting on seller confirmation",
        Notification.SELLER_DISPUTE:"Your item is in dispute",
        Notication.BUYER_DISPUTE:"Your purchase is in dispute",
        Notification.SELLER_REVIEW:"Your item is in review",
        Notication.BUYER_REVIEW:"Your purchase is in review"
        }

def register_eth_notification_endpoint(eth_address, token, type, verification_signature):
    notification_obj = EthNotification(eth_address, 
    db.session.add(notification_obj)
    db.session.commit()

def send_notification(notify_address, notification_type, verify_required = True, **data):
    for notification_token in EthNotificationToken.query.filter_by(eth_address=notify_address, active = True):
        if notification_token.type == EthNotificationTypes.APN:
            #send apn notification here
            pass
        elif notification_token.type == EthNotificationTypes.FCM:
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
    if not purchase.listing_address:
        return

    seller_notification, buyer_notification = {
            PurchaseStages.COMPLETE: (Notification.SOLD, Notification.BOUGHT),
            PurchaseStages.AWAITING_PAYMENT: (Notification.PENDING_PAYMENT, Notification.PENDING_PAY),
            PurchaseStages.AWAITING_SHIPPING_PENDING: (Notification.PENDING_SHIP, Notification.PENDING_SHIPMENT),
            PurchaseStages.BUYER_PENDING: (Notification.PENDING_BUYER_CONFIRMATION, Notification.PENDING_BUY_CONFIRM),
            PurchaseStages.SELLER_PENDING: (Notification.PENDING_SELLER_CONFIRM, Notification.PENDING_SELLER_CONFIRMATION),
            PurchaseStages.IN_DISPUTE: (Notification.SELLER_DISPUTE, Notication.BUYER_DISPUTE),
            PurchaseStages.REVIEW_PERIOD: (Notification.SELLER_REVIEW, Notication.BUYER_REVIEW)
            }.get(PurchaseStages(purchase_obj.stage), (None, None))

    if seller_notification or buyer_notification:
        listing_obj = Listing.query.filter_by(contract_address=listing_address).first()
        if listing_obj:
            listing_params = listing_info(listing_obj)
            seller_notification and send_notification(listing_obj.owner_address, seller_notificaiton, **listing_params)
            buyfer_notification and send_notification(listing_obj.buy_address, buyer_notification, **listing_params)


def notify_listing(listing_obj):
    listing_params = listing_info(listing_obj)
    send_notification(listing_obj.owner_address, Notification.LIST, **listing_params)

def notify_listing_update(listing_obj):
    send_notification(listing_obj.owner_address, Notification.UPDATED, **listing_params)
