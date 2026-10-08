import os
import tempfile

_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.seed import init_db


@pytest.fixture()
def client():
    init_db(reset=True)
    with TestClient(app) as c:
        yield c
