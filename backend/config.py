import os
from dotenv import load_dotenv


load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME", "fairrank")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    PORT = int(os.getenv("PORT", "5000"))
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
