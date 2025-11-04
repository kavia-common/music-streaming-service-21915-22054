from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings read from environment variables."""

    SECRET_KEY: str = Field(default="devsecret_change_me", description="JWT signing secret")
    JWT_ISSUER: str = Field(default="music-streaming-backend", description="JWT issuer claim")
    DATABASE_URL: str = Field(default="sqlite:///./app.db", description="SQLAlchemy database URL")
    CORS_ORIGINS: str = Field(default="", description="Comma-separated list of allowed CORS origins")
    PORT: int = Field(default=8000, description="Server port")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    # PUBLIC_INTERFACE
    def cors_origin_list(self) -> List[str]:
        """Return parsed CORS origins as list."""
        if not self.CORS_ORIGINS:
            return []
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
# PUBLIC_INTERFACE
def get_settings() -> Settings:
    """Get cached Settings instance."""
    return Settings()
