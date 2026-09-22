import os
import sys

# Allow root-level imports of 'app' to resolve directly into 'backend/app'
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
_backend_app_dir = os.path.join(_backend_dir, "app")

if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

__path__ = [_backend_app_dir]
