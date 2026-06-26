from flask import Blueprint, jsonify, request

from services.ranking_service import build_rankings, get_analytics_metrics, get_dashboard_metrics


ranking_bp = Blueprint("ranking_bp", __name__)


@ranking_bp.get("/ranking")
def ranking():
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=20, type=int)
    search = request.args.get("search", default="", type=str)

    page = max(page, 1)
    limit = min(max(limit, 1), 100)

    data = build_rankings(search=search, page=page, limit=limit)
    leaderboard = [
        {
            "rank": row["rank"],
            "userId": row["userId"],
            "score": row["fairnessScore"],
            "points": row["points"],
            "transactions": row["transactions"],
        }
        for row in data["rows"]
    ]

    return jsonify({"success": True, "data": leaderboard, "total": data["total"], "page": page, "limit": limit}), 200


@ranking_bp.get("/dashboard")
def dashboard():
    return jsonify({"success": True, "data": get_dashboard_metrics()}), 200


@ranking_bp.get("/analytics")
def analytics():
    return jsonify({"success": True, "data": get_analytics_metrics()}), 200
