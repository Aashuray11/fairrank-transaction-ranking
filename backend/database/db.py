from pymongo import ASCENDING, MongoClient
from pymongo.errors import PyMongoError
import mongomock

from config import Config


_client = None
_db = None


def _is_development():
    return Config.FLASK_ENV.lower() != "production"


def _use_memory_client():
    return mongomock.MongoClient()


def reset_to_memory_db():
    global _client, _db
    _client = _use_memory_client()
    _db = _client[Config.DB_NAME]
    return _db


def get_client():
    global _client
    if _client is None:
        if not Config.MONGO_URI:
            _client = _use_memory_client()
        else:
            _client = MongoClient(
                Config.MONGO_URI,
                retryWrites=True,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
            )
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()[Config.DB_NAME]
    return _db


def init_indexes():
    db = get_db()
    try:
        db.transactions.create_index("transactionId", unique=True, name="idx_unique_transaction")
        db.transactions.create_index([("userId", ASCENDING), ("createdAt", ASCENDING)], name="idx_user_date")
        db.daily_limits.create_index([("userId", ASCENDING), ("date", ASCENDING)], unique=True, name="idx_daily_limit")
    except PyMongoError as exc:
        if not _is_development():
            raise RuntimeError(f"Failed to initialize indexes: {exc}") from exc

        db = reset_to_memory_db()
        db.transactions.create_index("transactionId", unique=True, name="idx_unique_transaction")
        db.transactions.create_index([("userId", ASCENDING), ("createdAt", ASCENDING)], name="idx_user_date")
        db.daily_limits.create_index([("userId", ASCENDING), ("date", ASCENDING)], unique=True, name="idx_daily_limit")
