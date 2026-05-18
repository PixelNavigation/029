import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import qrcode
except ImportError as exc:
    raise SystemExit(
        "Missing dependency 'qrcode'. Install with: pip install qrcode[pil]"
    ) from exc

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from supabase_client import get_supabase
from ocr_pipeline import create_certificate_hash
from verify_handler import build_extracted_data_from_row


def _safe_name(value):
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "_", str(value or "")).strip("_")
    return cleaned or "record"


def _build_payload(row, computed_hash):
    return {
        "version": "1.0",
        "hash": computed_hash,
        "record_id": row.get("id"),
        "student_id": row.get("student_id"),
        "issued_at": row.get("issue_date") or row.get("created_at") or datetime.utcnow().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Generate QR codes from Supabase records")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of records")
    parser.add_argument(
        "--output",
        default=None,
        help="Output directory (default: <project>/dataset/qr)",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[2]
    output_dir = Path(args.output) if args.output else project_root / "dataset" / "qr"
    output_dir.mkdir(parents=True, exist_ok=True)

    supabase = get_supabase()
    if not supabase:
        raise SystemExit("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.")

    query = supabase.table("official_records").select("*")
    if args.limit and args.limit > 0:
        query = query.limit(args.limit)

    result = query.execute()
    rows = result.data or []

    if not rows:
        print("No records found in official_records.")
        return

    generated = 0
    for row in rows:
        extracted_data = build_extracted_data_from_row(row)
        hash_salt = row.get("hash_salt")
        if not hash_salt:
            print(f"Skipping row without hash_salt: {row.get('id')}")
            continue

        computed_hash = create_certificate_hash(extracted_data, hash_salt=hash_salt)
        payload = _build_payload(row, computed_hash)
        payload_str = json.dumps(payload, separators=(",", ":"))

        student_id = _safe_name(row.get("student_id"))
        record_id = _safe_name(row.get("id"))
        hash_suffix = _safe_name(computed_hash[-8:])
        filename = f"{student_id}_{record_id}_{hash_suffix}.png"
        file_path = output_dir / filename

        img = qrcode.make(payload_str)
        img.save(file_path)
        generated += 1

    print(f"Generated {generated} QR code(s) in {output_dir}")


if __name__ == "__main__":
    main()
