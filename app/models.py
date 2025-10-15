from datetime import datetime, timedelta, timezone
from sqlalchemy import UniqueConstraint, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from .extensions import db

UTC = timezone.utc

class Lot(db.Model):
    __tablename__ = "lots"
    lot_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False, unique=True)
    address = db.Column(db.Text, nullable=False)
    spaces = db.relationship("Space", backref="lot", cascade="all, delete-orphan")

class Space(db.Model):
    __tablename__ = "spaces"
    space_id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey("lots.lot_id", ondelete="CASCADE"), nullable=False)
    space_number = db.Column(db.Integer, nullable=False)  # 1..53
    is_quick_15 = db.Column(db.Boolean, nullable=False, default=False)
    __table_args__ = (UniqueConstraint("lot_id", "space_number", name="uq_space_per_lot"),)

class ParkingSession(db.Model):
    __tablename__ = "parking_sessions"
    session_id = db.Column(UUID(as_uuid=True), primary_key=True,
                           server_default=db.text("uuid_generate_v4()"))
    space_id = db.Column(db.Integer, db.ForeignKey("spaces.space_id", ondelete="CASCADE"), nullable=False)
    plate = db.Column(db.String(16), nullable=False)
    amount_cents = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint("amount_cents >= 50 AND amount_cents % 50 = 0", name="ck_amount_steps"),
        Index("idx_sessions_active", "space_id", "end_time", postgresql_where=db.text("end_time > now()")),
    )

    @staticmethod
    def calc_end(start_dt, amount_cents: int):
        # $0.50 -> 30 minutes
        units = amount_cents // 50  # integer count of 50¢
        minutes = 30 * units
        return start_dt + timedelta(minutes=minutes)
