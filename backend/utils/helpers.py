# backend/utils/helpers.py - Security, File Upload & Loyalty Helpers
import os
import uuid
from werkzeug.utils import secure_filename
from extensions import db
from models import User

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'mov', 'webm'}
MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024 # 8MB limit

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_media(file_obj, subfolder: str = "") -> str:
    """
    Validates and saves uploaded multipart file securely, returning the relative URL
    """
    if not file_obj or file_obj.filename == '':
        return None

    if not allowed_file(file_obj.filename):
        raise ValueError("Invalid file format. Allowed: PNG, JPG, JPEG, WEBP, GIF, MP4, WEBM.")

    target_dir = os.path.join(UPLOAD_FOLDER, subfolder) if subfolder else UPLOAD_FOLDER
    os.makedirs(target_dir, exist_ok=True)

    ext = file_obj.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex[:16]}.{ext}"
    destination = os.path.join(target_dir, unique_filename)
    
    file_obj.save(destination)
    
    # Return web-accessible path
    return f"/static/uploads/{subfolder + '/' if subfolder else ''}{unique_filename}"

def award_gleam_points(user_id: str, points: int, reason: str = ""):
    """
    Awards loyalty Gleam Points to a user (for purchases, reviews, referrals)
    """
    try:
        user = User.query.get(user_id)
        if user:
            user.gleam_points = (user.gleam_points or 0) + int(points)
            db.session.commit()
            print(f"✨ Awarded {points} Gleam Points to {user.email} (Reason: {reason}). Total: {user.gleam_points}")
            return user.gleam_points
    except Exception as e:
        print(f"❌ Error awarding gleam points: {e}")
    return 0
