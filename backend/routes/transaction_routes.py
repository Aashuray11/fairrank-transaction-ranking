from flask import Blueprint, jsonify, request

from database.db import get_db
from services.transaction_service import process_transaction


transaction_bp = Blueprint("transaction_bp", __name__)


@transaction_bp.post("/transaction")
def create_transaction():
    result = process_transaction(request.get_json(silent=True) or {})
    if result["ok"]:
        return jsonify({"success": True, "message": result["message"], "data": result["data"]}), result["status"]
    return jsonify({"success": False, "message": result["message"]}), result["status"]


@transaction_bp.get("/transactions/recent")
def recent_transactions():
    limit = request.args.get("limit", default=10, type=int)
    limit = min(max(limit, 1), 100)

    db = get_db()
    rows = list(db.transactions.find({}, {"_id": 0}).sort("createdAt", -1).limit(limit))
    return jsonify({"success": True, "data": rows}), 200
