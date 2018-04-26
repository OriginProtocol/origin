# -*- coding: utf-8 -*-
"""Test configs."""
from app.app_config import AppConfig
from util.tasks import CeleryConfig


def test_app_config():
    assert hasattr(AppConfig, 'SQLALCHEMY_DATABASE_URI')


def test_celery_config():
    assert hasattr(CeleryConfig, 'SQLALCHEMY_DATABASE_URI')
