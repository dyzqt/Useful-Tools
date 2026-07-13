import os
from pathlib import Path


def get_database_path() -> Path:
    override = os.getenv("APP_DB_PATH")
    if override:
        return Path(override).expanduser().resolve()
    return Path(__file__).resolve().parent.parent / "data" / "app.db"


DATABASE_PATH = get_database_path()
