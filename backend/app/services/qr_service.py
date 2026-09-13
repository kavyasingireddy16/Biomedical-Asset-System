import os
import qrcode


def generate_qr(asset_id: int):

    # Create QR folder if it doesn't exist
    os.makedirs("qr_codes", exist_ok=True)

    # Data stored in QR
    qr_data = f"http://127.0.0.1:8000/assets/{asset_id}"

    # Create QR
    qr = qrcode.make(qr_data)

    # File name
    file_path = f"qr_codes/asset_{asset_id}.png"

    # Save QR
    qr.save(file_path)

    return file_path