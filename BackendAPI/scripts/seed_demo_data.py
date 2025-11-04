#!/usr/bin/env python3
"""
Seed demo data for local development.

- Creates admin user if not present:
  email: admin@example.com
  password: 'adminadmin' (bcrypt hashed)
- Inserts a few demo tracks if the tracks table is empty.

Usage:
  python -m scripts.seed_demo_data
or
  PYTHONPATH=. python scripts/seed_demo_data.py
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.session import session_scope
from app.db.models import User, Track
from app.security.auth import hash_password


def ensure_admin(db: Session) -> None:
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if admin:
        return
    admin = User(
        email="admin@example.com",
        username="Admin",
        password_hash=hash_password("adminadmin"),
        is_admin=True,
    )
    db.add(admin)
    db.commit()


def ensure_demo_tracks(db: Session) -> None:
    count = db.query(Track).count()
    if count and count > 0:
        return
    demo_tracks = [
        Track(title="Sunrise", artist="Aurora", album="Morning Light", genre="Ambient", duration=180),
        Track(title="Night Drive", artist="Neon City", album="Midnight Run", genre="Synthwave", duration=240),
        Track(title="Lo-fi Study", artist="Beat Lab", album="Focus", genre="Lo-fi", duration=210),
    ]
    db.add_all(demo_tracks)
    db.commit()


def main() -> None:
    with session_scope() as db:
        ensure_admin(db)
        ensure_demo_tracks(db)
    print("Seed completed.")


if __name__ == "__main__":
    main()
