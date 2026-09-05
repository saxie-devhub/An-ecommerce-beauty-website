# backend/make_admin.py - Python CLI tool to promote any user to Admin
import sys
from app import app
from extensions import db
from models import User

def promote_user_to_admin(email: str):
    with app.app_context():
        user = User.query.filter(User.email.ilike(email.strip())).first()
        if not user:
            print(f"\n[ERROR] No user found with email '{email}'.")
            print("Available users in database:")
            for u in User.query.all():
                print(f" - {u.email} ({u.name}) [Role: {u.role}]")
            return

        user.role = "admin"
        user.is_admin = True
        db.session.commit()

        print("=" * 60)
        print(f"[SUCCESS] User '{user.name}' ({user.email}) is now an ADMIN!")
        print("Role:       admin (is_admin = True)")
        print("Next step:  Log out and log back in on http://localhost:5500/login.html")
        print("=" * 60)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("Example: python make_admin.py saxiemary248@gmail.com")
        sys.exit(1)

    promote_user_to_admin(sys.argv[1])
