from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from sqlalchemy import select, func, and_, exists
from ..extensions import db
from ..models import Space, ParkingSession

sessions_bp = Blueprint("sessions", __name__)

@sessions_bp.post("/pay")
def pay():
    """
    JSON body: { "lotId": 1, "spotNumber": 12, "plate": "ABC123", "amount": 1.50 }
    Rules:
      - amount >= 0.50 and a multiple of 0.50
      - spot must exist in lot and not be quick-15
      - spot must be currently available (no active session)
    """
    data = request.get_json(silent=True) or {}
    lot_id = data.get("lotId")
    spot_number = data.get("spotNumber")
    plate = (data.get("plate") or "").strip().upper()[:16]
    amount = data.get("amount")

    if not all([lot_id, spot_number, plate, amount is not None]):
        return jsonify({"error": "lotId, spotNumber, plate, amount are required"}), 400
    try:
        dollars = float(amount)
    except Exception:
        return jsonify({"error": "amount must be numeric"}), 400

    # Validate pricing: >= 0.50 and step of 0.50
    cents = int(round(dollars * 100))
    if cents < 50 or (cents % 50) != 0:
        return jsonify({"error": "amount must be >= $0.50 and in $0.50 increments"}), 400

    # Find space and ensure not quick-15
    space = db.session.execute(
        select(Space).where(and_(Space.lot_id == lot_id, Space.space_number == spot_number))
    ).scalar_one_or_none()
    if not space:
        return jsonify({"error": "space not found in lot"}), 404
    if space.is_quick_15:
        return jsonify({"error": "quick-15 spots are not purchasable"}), 400

    # Availability check (no active session)
    now = func.now()
    active_exists = db.session.execute(
        select(exists().where(and_(ParkingSession.space_id == space.space_id, ParkingSession.end_time > now)))
    ).scalar()
    if active_exists:
        return jsonify({"error": "space currently unavailable"}), 409

    # Create session
    now_py = datetime.now(timezone.utc)
    end_py = ParkingSession.calc_end(now_py, cents)

    session = ParkingSession(
        space_id=space.space_id,
        plate=plate,
        amount_cents=cents,
        start_time=now_py,
        end_time=end_py,
    )
    db.session.add(session)
    db.session.commit()

    minutes = int((end_py - now_py).total_seconds() // 60)
    return jsonify({
        "ok": True,
        "spaceNumber": spot_number,
        "plate": plate,
        "amount": cents / 100.0,
        "minutes": minutes,
        "endsAt": end_py.isoformat()
    }), 201
