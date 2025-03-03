import re
import json
import sys
import os
import traceback
from datetime import datetime

is_dev = os.getenv("NODE_ENV") == "development"

if sys.stdout:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        sys.stdout = None

if len(sys.argv) > 1:
    base_path = sys.argv[1]
else:
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data"))

config_file_path = os.path.join(base_path, "sys", "config.json")
log_file_path = os.path.join(base_path, "app.log")

def log_message(message, log_file_path, level = "info"):
    """Menulis pesan ke file log"""
    try:
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"[{timestamp}] [{level}] | get_cookies.py | {message}\n")          
    except Exception as e:
        print(f"Gagal menulis log: {e}")

def log_error(e, log_file_path):
    """Menulis error ke file log"""
    error_message = f"Error: {str(e)}\n{traceback.format_exc()}"
    log_message(error_message, log_file_path)
    send_to_frontend(f"❌ Error: {str(e)}")

def send_to_frontend(message):
    sys.stdout.write(message + "\n")
    sys.stdout.flush()

try:

    log_message("tester", log_file_path)
    log_message(f"basePath: {base_path}", log_file_path)
    log_message(f"logfilePath: {log_file_path}", log_file_path)
    
    if not os.path.exists(config_file_path):
        raise FileNotFoundError(f"File config.json tidak ditemukan di {config_file_path}")

    with open(config_file_path, "r", encoding="utf-8") as file:
        config_data = json.load(file)

    cookie_str = config_data.get("raw_cookies", "")

    if not cookie_str:
        raise ValueError("Cookie tidak ditemukan atau kosong. Harap periksa config.json")

    cookie_pattern = r'(?P<key>[^=;]+)=(?P<value>[^;]+)'
    cookies = dict(re.findall(cookie_pattern, cookie_str))

    cookies = {key.strip(): value for key, value in cookies.items()}

    if not cookies:
        raise ValueError("Format cookie tidak valid atau parsing gagal.")

    config_data["fix_cookies"] = cookies

    with open(config_file_path, "w", encoding="utf-8") as json_file:
        json.dump(config_data, json_file, indent=4)

    success_message = "Success: Cookie berhasil disimpan setelah parsing"
    send_to_frontend(success_message)
    log_message(success_message, log_file_path)

except Exception as e:
    log_error(e, log_file_path)
    sys.exit(1)
