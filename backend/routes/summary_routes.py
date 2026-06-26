from flask import Blueprint, jsonify

from services.ranking_service import get_user_summary


summary_bp = Blueprint("summary_bp", __name__)


@summary_bp.get("/summary/<user_id>")
def summary(user_id):
    data = get_user_summary(user_id)
    if not data:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify({"success": True, "data": data}), 200
