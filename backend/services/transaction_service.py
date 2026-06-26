from datetime import datetime, timezone

import mongomock
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError, OperationFailure, PyMongoError

from database.db import get_client, get_db
from utils.reward_calculator import calculate_points
from utils.validators import validate_transaction_payload


class DailyLimitExceeded(Exception):
    pass


def _is_duplicate_error(exc):
    return isinstance(exc, DuplicateKeyError) or getattr(exc, "code", None) == 11000


def _apply_user_updates(db, user_id, amount, points, now, session=None):
    db.users.update_one(
        {"_id": user_id},
        {
            "$inc": {
                "totalAmount": amount,
                "totalPoints": points,
                "transactionCount": 1,
            },
            "$set": {"lastTransactionAt": now},
        },
        upsert=True,
        session=session,
    )


def _apply_daily_limit(db, user_id, date_key, now, session=None):
    limit_doc = db.daily_limits.find_one_and_update(
        {"userId": user_id, "date": date_key},
        {"$inc": {"count": 1}, "$setOnInsert": {"createdAt": now}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
        session=session,
    )
    if limit_doc["count"] > 50:
        raise DailyLimitExceeded("Daily transaction limit exceeded")


def _transaction_ops(db, transaction_doc, user_id, amount, points, now, session):
    date_key = now.date().isoformat()
    _apply_daily_limit(db, user_id, date_key, now, session=session)
    db.transactions.insert_one(transaction_doc, session=session)
    _apply_user_updates(db, user_id, amount, points, now, session=session)
    return {"pointsEarned": points}


def _non_transaction_ops(db, transaction_doc, user_id, amount, points, now):
    date_key = now.date().isoformat()
    db.transactions.insert_one(transaction_doc)
    try:
        _apply_daily_limit(db, user_id, date_key, now)
    except DailyLimitExceeded:
        db.transactions.delete_one({"transactionId": transaction_doc["transactionId"]})
        raise
    _apply_user_updates(db, user_id, amount, points, now)
    return {"pointsEarned": points}


def process_transaction(payload):
    is_valid, message = validate_transaction_payload(payload)
    if not is_valid:
        return {"ok": False, "status": 400, "message": message}

    transaction_id = payload["transactionId"].strip()
    user_id = payload["userId"].strip()
    amount = float(payload["amount"])
    tx_type = payload["type"]
    now = datetime.now(timezone.utc)
    points = calculate_points(amount)

    transaction_doc = {
        "transactionId": transaction_id,
        "userId": user_id,
        "amount": amount,
        "pointsEarned": points,
        "type": tx_type,
        "createdAt": now,
    }

    db = get_db()
    client = get_client()

    if isinstance(client, mongomock.MongoClient) or not hasattr(client, "start_session"):
        try:
            result = _non_transaction_ops(db, transaction_doc, user_id, amount, points, now)
            return {
                "ok": True,
                "status": 201,
                "message": "Transaction processed successfully",
                "data": result,
            }
        except DuplicateKeyError:
            return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
        except DailyLimitExceeded:
            return {"ok": False, "status": 429, "message": "Daily transaction limit exceeded"}
        except PyMongoError as exc:
            if _is_duplicate_error(exc):
                return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
            return {"ok": False, "status": 500, "message": f"Database error: {exc}"}

    try:
        with client.start_session() as session:
            result = session.with_transaction(
                lambda current_session: _transaction_ops(
                    db,
                    transaction_doc,
                    user_id,
                    amount,
                    points,
                    now,
                    current_session,
                )
            )
            return {
                "ok": True,
                "status": 201,
                "message": "Transaction processed successfully",
                "data": result,
            }
    except OperationFailure as exc:
        if _is_duplicate_error(exc):
            return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}

        # Fallback for local Mongo deployments without replica set transaction support.
        if "Transaction numbers are only allowed" in str(exc):
            try:
                result = _non_transaction_ops(db, transaction_doc, user_id, amount, points, now)
                return {
                    "ok": True,
                    "status": 201,
                    "message": "Transaction processed successfully",
                    "data": result,
                }
            except DuplicateKeyError:
                return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
            except DailyLimitExceeded:
                return {
                    "ok": False,
                    "status": 429,
                    "message": "Daily transaction limit exceeded",
                }
            except PyMongoError as db_exc:
                if _is_duplicate_error(db_exc):
                    return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
                return {"ok": False, "status": 500, "message": f"Database error: {db_exc}"}
        return {"ok": False, "status": 500, "message": f"Database error: {exc}"}
    except DuplicateKeyError:
        return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
    except DailyLimitExceeded:
        return {"ok": False, "status": 429, "message": "Daily transaction limit exceeded"}
    except PyMongoError as exc:
        if _is_duplicate_error(exc):
            return {"ok": False, "status": 409, "message": "Duplicate transaction detected"}
        return {"ok": False, "status": 500, "message": f"Database error: {exc}"}
