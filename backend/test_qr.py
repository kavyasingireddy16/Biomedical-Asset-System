from app.services.qr_service import generate_qr

path = generate_qr(101)

print("QR Code Generated Successfully!")

print(path)