from datetime import datetime, timedelta, timezone

from database.db import get_db


def _recent_bonus(last_transaction_at, now):
    if not last_transaction_at:
        return 0
    if last_transaction_at.tzinfo is None:
        last_transaction_at = last_transaction_at.replace(tzinfo=timezone.utc)
    if last_transaction_at >= now - timedelta(hours=24):
        return 50
    if last_transaction_at >= now - timedelta(days=7):
        return 20
    return 0


def _compute_fairness(total_points, transaction_count, last_transaction_at, now):
    bonus = _recent_bonus(last_transaction_at, now)
    score = (0.6 * total_points) + (0.3 * transaction_count) + (0.1 * bonus)
    return round(score, 2), bonus


def build_rankings(search="", page=1, limit=20):
    db = get_db()
    now = datetime.now(timezone.utc)
    query = {}
    if search:
        query["_id"] = {"$regex": search, "$options": "i"}

    users = list(db.users.find(query))
    ranked = []
    for user in users:
        fairness_score, bonus = _compute_fairness(
            user.get("totalPoints", 0),
            user.get("transactionCount", 0),
            user.get("lastTransactionAt"),
            now,
        )
        ranked.append(
            {
                "userId": user["_id"],
                "totalAmount": user.get("totalAmount", 0),
                "points": user.get("totalPoints", 0),
                "transactions": user.get("transactionCount", 0),
                "lastActivity": user.get("lastTransactionAt"),
                "recentActivityBonus": bonus,
                "fairnessScore": fairness_score,
            }
        )

    ranked.sort(key=lambda item: (item["fairnessScore"], item["points"], item["transactions"]), reverse=True)

    for idx, row in enumerate(ranked, start=1):
        row["rank"] = idx

    start = (page - 1) * limit
    end = start + limit
    return {"rows": ranked[start:end], "total": len(ranked), "all": ranked}


def get_user_summary(user_id):
    db = get_db()
    user = db.users.find_one({"_id": user_id})
    if not user:
        return None

    all_ranked = build_rankings(page=1, limit=1000000)["all"]
    current = next((row for row in all_ranked if row["userId"] == user_id), None)

    recent_transactions = list(
        db.transactions.find({"userId": user_id}, {"_id": 0}).sort("createdAt", -1).limit(5)
    )

    return {
        "userId": user_id,
        "totalAmount": user.get("totalAmount", 0),
        "totalPoints": user.get("totalPoints", 0),
        "transactionCount": user.get("transactionCount", 0),
        "fairnessScore": current["fairnessScore"] if current else 0,
        "rank": current["rank"] if current else None,
        "lastActivity": user.get("lastTransactionAt"),
        "recentTransactions": recent_transactions,
    }


def get_dashboard_metrics():
    db = get_db()
    total_users = db.users.count_documents({})
    total_transactions = db.transactions.count_documents({})

    revenue_cursor = db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}])
    points_cursor = db.users.aggregate([{"$group": {"_id": None, "total": {"$sum": "$totalPoints"}}}])

    total_revenue = next(revenue_cursor, {"total": 0}).get("total", 0)
    total_points = next(points_cursor, {"total": 0}).get("total", 0)

    recent_transactions = list(db.transactions.find({}, {"_id": 0}).sort("createdAt", -1).limit(8))
    top_users = build_rankings(page=1, limit=5)["rows"]

    return {
        "kpis": {
            "totalUsers": total_users,
            "totalTransactions": total_transactions,
            "totalRevenue": total_revenue,
            "totalRewardPoints": total_points,
        },
        "recentTransactions": recent_transactions,
        "topUsers": top_users,
    }


def get_analytics_metrics():
    db = get_db()

    revenue_trend = list(
        db.transactions.aggregate(
            [
                {
                    "$group": {
                        "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                        "revenue": {"$sum": "$amount"},
                        "points": {"$sum": "$pointsEarned"},
                    }
                },
                {"$sort": {"_id": 1}},
                {"$limit": 30},
            ]
        )
    )

    tx_distribution = list(
        db.transactions.aggregate(
            [
                {"$group": {"_id": "$type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ]
        )
    )

    weekly_activity = list(
        db.transactions.aggregate(
            [
                {
                    "$group": {
                        "_id": {"$isoDayOfWeek": "$createdAt"},
                        "transactions": {"$sum": 1},
                    }
                },
                {"$sort": {"_id": 1}},
            ]
        )
    )

    points_distribution = list(
        db.users.aggregate(
            [
                {
                    "$project": {
                        "bucket": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$lte": ["$totalPoints", 200]}, "then": "0-200"},
                                    {"case": {"$lte": ["$totalPoints", 500]}, "then": "201-500"},
                                    {"case": {"$lte": ["$totalPoints", 1000]}, "then": "501-1000"},
                                ],
                                "default": "1000+",
                            }
                        }
                    }
                },
                {"$group": {"_id": "$bucket", "users": {"$sum": 1}}},
            ]
        )
    )

    return {
        "revenueTrend": [{"date": item["_id"], "revenue": item["revenue"], "points": item["points"]} for item in revenue_trend],
        "transactionDistribution": [{"type": item["_id"], "count": item["count"]} for item in tx_distribution],
        "weeklyActivity": [{"day": item["_id"], "transactions": item["transactions"]} for item in weekly_activity],
        "pointsDistribution": [{"range": item["_id"], "users": item["users"]} for item in points_distribution],
    }

