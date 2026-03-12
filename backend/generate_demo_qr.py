"""
generate_demo_qr.py
-------------------
Run this script once to generate a demo QR code image that matches
your Supabase dummy record exactly.

The QR text format MUST match the regex patterns in verify_handler.py:
  Name:  ([^|,\n]+)
  ID:    ([\w]+)
  Semester: (\w+)
  CGPA:  ([\d\.]+)

Usage:
    python generate_demo_qr.py

Output:
    demo_qr.png  (stick this onto your test certificate image)
"""

import hashlib
import qrcode


# ── ① Configure these to EXACTLY match your Supabase official_records row ──
STUDENT_NAME = "GAUTAM BABEL JAIN"
STUDENT_ID   = "160822733176"
SEMESTER     = "5"
CGPA         = "8.67"
# ───────────────────────────────────────────────────────────────────────────


def generate_canonical_hash(name, s_id, sem, cgpa):
    """Mirror of verify_handler.generate_canonical_hash."""
    components = [str(name), str(s_id), str(sem), str(cgpa)]
    canonical_string = "".join(c.strip().lower() for c in components)
    raw_hash = hashlib.sha256(canonical_string.encode("utf-8")).hexdigest()
    return f"0x{raw_hash}"


if __name__ == "__main__":
    # Build the QR text
    qr_text = (
        f"Name: {STUDENT_NAME} | "
        f"ID: {STUDENT_ID} | "
        f"Semester: {SEMESTER} | "
        f"CGPA: {CGPA}"
    )

    # Show the canonical hash so you can paste it into Supabase
    canon_hash = generate_canonical_hash(STUDENT_NAME, STUDENT_ID, SEMESTER, CGPA)

    print("=" * 60)
    print("QR Text:")
    print(f"  {qr_text}")
    print()
    print("Canonical Hash (paste this into official_records.blockchain_hash):")
    print(f"  {canon_hash}")
    print("=" * 60)

    # Generate and save the QR image
    img = qrcode.make(qr_text)
    output_file = "demo_qr.png"
    img.save(output_file)
    print(f"\nQR image saved to: {output_file}")
    print("Stick this onto your test certificate image and upload to verify.")
