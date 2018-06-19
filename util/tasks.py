from celery import Celery
from celery.utils.log import get_task_logger

from config import settings
from flask import Flask
from database import db
from database import db_models
from .contract import ContractHelper
from logic.indexer_service import EventHandler

logger = get_task_logger(__name__)


class CeleryConfig(object):
    SQLALCHEMY_DATABASE_URI = settings.DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


def make_celery(app):
    celery = Celery(app.import_name,
                    backend=settings.REDIS_URL,
                    broker=settings.REDIS_URL,
                    task_always_eager=settings.CELERY_DEBUG)
    celery.conf.update(app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)
    celery.Task = ContextTask
    return celery


flask_app = Flask(__name__)

flask_app.config.from_object(__name__ + '.CeleryConfig')

db.init_app(flask_app)
celery = make_celery(flask_app)


@celery.task
def event_listener(web3=None):
    # Load our block cursor from the event_tracker table.
    event_tracker = db_models.EventTracker.query.first()
    if not event_tracker:
        # No cursor found. Start from the beginning at block 0.
        event_tracker = db_models.EventTracker(block_index=0,
                                               log_index=0,
                                               transaction_index=0)
        db.session.add(event_tracker)
        db.session.commit()

    # Create an event handler and attempt to fetch events from the network.
    handler = EventHandler(web3=web3)
    ContractHelper().fetch_events(['NewListing(uint256,address)',
                                   'ListingPurchased(address)',
                                   'ListingChange()',
                                   'PurchaseChange(uint8)',
                                   'PurchaseReview(address,address,uint8,uint8,bytes32)'],
                                  block_from=event_tracker.block_index,
                                  block_to='latest',
                                  callback=handler.process,
                                  log_index=event_tracker.log_index,
                                  transaction_index=event_tracker.transaction_index)


@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(10.0, event_listener)
