from flask import Blueprint, jsonify, request
from sqlalchemy import select, func, exists, and_
from ..extensions import db
from ..models import Lot, Space, ParkingSession

lots_bp = Blueprint("lots", __name__)

@lots_bp.get("/lots")
def list_lots():
    rows = db.session.execute(select(Lot.lot_id, Lot.name, Lot.address).order_by(Lot.name)).all()
    return jsonify([{"id": r.lot_id, "name": r.name, "address": r.address} for r in rows])

@lots_bp.get("/lots/<int:lot_id>/spaces")
def list_spaces(lot_id: int):
    # include availability flag and is_quick_15
    now = func.now()
    subq_active = exists().where(and_(ParkingSession.space_id == Space.space_id, ParkingSession.end_time > now))
    rows = (
        db.session.execute(
            select(
                Space.space_id,
                Space.space_number,
                Space.is_quick_15,
                (~subq_active).label("is_available"),
            ).where(Space.lot_id == lot_id).order_by(Space.space_number)
        ).all()
    )
    return jsonify([
        {
            "spaceId": r.space_id,
            "number": r.space_number,
            "isQuick15": r.is_quick_15,
            "isAvailable": bool(r.is_available),
        } for r in rows
    ])

@lots_bp.get("/availability")
def availability():
    # Purchasable availability (exclude quick-15)
    lot_id = request.args.get("lotId", type=int)
    if not lot_id:
        return jsonify({"error": "lotId required"}), 400
    now = func.now()
    subq_active = exists().where(and_(ParkingSession.space_id == Space.space_id, ParkingSession.end_time > now))
    rows = (
        db.session.execute(
            select(Space.space_number)
            .where(and_(Space.lot_id == lot_id, Space.is_quick_15.is_(False), ~subq_active))
            .order_by(Space.space_number)
        ).scalars().all()
    )
    return jsonify({"available": rows})
