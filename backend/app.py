import logging
import time
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from database.db import init_indexes
from routes.ranking_routes import ranking_bp
from routes.summary_routes import summary_bp
from routes.transaction_routes import transaction_bp


app = Flask(__name__)
app.config.from_object(Config)

logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger("fairrank")

CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS.split(",") if Config.CORS_ORIGINS != "*" else "*"}})


@app.before_request
def before_request_logging():
    request.start_time = time.perf_counter()


@app.after_request
def after_request_logging(response):
    elapsed = (time.perf_counter() - request.start_time) * 1000
    logger.info(
        "%s %s %s %.2fms",
        request.method,
        request.path,
        response.status_code,
        elapsed,
    )
    return response


@app.errorhandler(Exception)
def global_exception_handler(exc):
    logger.exception("Unhandled exception: %s", exc)
    return jsonify({"success": False, "message": "Internal server error"}), 500


@app.get("/")
def health():
    return jsonify(
        {
            "success": True,
            "name": "FairRank API",
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


app.register_blueprint(transaction_bp)
app.register_blueprint(summary_bp)
app.register_blueprint(ranking_bp)


init_indexes()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.FLASK_ENV == "development")
