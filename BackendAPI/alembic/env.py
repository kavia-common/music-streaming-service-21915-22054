from __future__ import annotations

import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Connection
from alembic import context

# Import application settings and metadata
# We avoid importing app.main to prevent side effects (like create_all/seed)
from app.config import get_settings
from app.db.models import Base  # SQLAlchemy metadata
from app.db.session import engine as app_engine  # created engine with settings and pragmas

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Provide target metadata for 'autogenerate' support.
target_metadata = Base.metadata

def get_url() -> str:
    """Return database URL from app settings or environment override."""
    # Prefer explicit env var if provided, else use app settings (defaults to sqlite)
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    settings = get_settings()
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Use the application's engine to ensure identical configuration (PRAGMAs etc.)
    # However, if DATABASE_URL env overrides at runtime, app_engine already respects it via get_settings().
    connectable = app_engine

    def process_revision_directives(context_, revision, directives):
        # Enforce empty migration if no changes
        if getattr(context_.config.cmd_opts, "autogenerate", False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []

    with connectable.connect() as connection:  # type: Connection
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            process_revision_directives=process_revision_directives,
            render_as_batch=connectable.url.get_backend_name() == "sqlite",
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
