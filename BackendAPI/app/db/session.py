from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session

from app.config import get_settings

settings = get_settings()

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
    future=True,
    echo=False,
)

# SQLite pragmas for better defaults
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False, future=True)

# PUBLIC_INTERFACE
def get_db() -> Generator[Session, None, None]:
    """Provide a new SQLAlchemy session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
# PUBLIC_INTERFACE
def session_scope() -> Generator[Session, None, None]:
    """Context manager that manages a DB session transaction lifecycle."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:  # noqa: BLE001
        session.rollback()
        raise
    finally:
        session.close()
