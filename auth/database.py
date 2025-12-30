"""
Database session and engine management for authentication subsystem.
"""
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import config


if not config.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. Set it in the environment before starting the server."
    )

# SQLAlchemy 2.0 style engine (synchronous)
engine = create_engine(config.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@contextmanager
def get_db_session():
    """
    Context manager for DB sessions. Can be used outside FastAPI dependencies.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db():
    """
    FastAPI dependency that yields a session.
    """
    with get_db_session() as session:
        yield session
