# -*- coding: utf-8 -*-
"""Test configs."""
from app.app_config import AppConfig


def test_app_config():
    assert hasattr(AppConfig, 'SQLALCHEMY_DATABASE_URI')
