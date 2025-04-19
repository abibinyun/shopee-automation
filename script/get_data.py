import requests
import json
import time
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

def log_message(message, level="info"):
    try:
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"[{timestamp}] [{level}] | get_data.py | {message}\n")
    except Exception as e:
        print(f"Gagal menulis log: {e}")

def send_to_frontend(message):
    try:
        sys.stdout.write(message + "\n")
        sys.stdout.flush()
    except Exception as e:
        log_message(f"Error mengirim pesan ke frontend: {e}", "error")

# Load konfigurasi dengan validasi
config = {}
try:
    with open(config_file_path, 'r', encoding="utf-8") as json_file:
        config = json.load(json_file) or {}
except json.JSONDecodeError:
    log_message("❌ config.json bukan JSON valid!", "error")
    send_to_frontend("❌ Gagal membaca konfigurasi (format JSON tidak valid).")
except FileNotFoundError:
    log_message("❌ config.json tidak ditemukan!", "error")
    send_to_frontend("❌ Konfigurasi tidak ditemukan.")

cookie = config.get("fix_cookies", {}) or {}
user_agent = config.get("user_agent", "")
spc_cds = cookie.get("SPC_CDS", "")

if not cookie:
    log_message("⚠️ Cookies kosong atau tidak ditemukan!", "warning")
    send_to_frontend("⚠️ Cookies kosong atau tidak ditemukan! Harap periksa config.json")

headers = {
    "User-Agent": user_agent,
    "Referer": "https://seller.shopee.co.id/portal/sale/shipment?type=toship&source=to_process",
    "Content-Type": "application/json",
    "Origin": "https://seller.shopee.co.id"
}

url_package_param_list = f"https://seller.shopee.co.id/api/v3/order/search_order_list_index?SPC_CDS={spc_cds}&SPC_CDS_VER=2"

payload_package_param_list = {
    "order_list_tab": 300,
    "entity_type": 1,
    "pagination": {
        "from_page_number": 1,
        "page_number": 1,
        "page_size": 40
    },
    "filter": {
        "order_to_ship_status": 1,
        "fulfillment_type": 0,
        "is_drop_off": 0,
        "action_filter": 0,
        "fulfillment_source": 0
    },
    "sort": {
        "sort_type": 1,
        "ascending": True
    }
}

# Inisialisasi order_list_path
order_list_path = os.path.join(base_path, "sys", "order_list.json")

try:
    response_package_param_list = requests.post(url_package_param_list, headers=headers, cookies=cookie, json=payload_package_param_list)
    response_package_param_list.raise_for_status()

    try:
        package_param_list = response_package_param_list.json()
    except json.JSONDecodeError:
        log_message("❌ Response package_param_list bukan JSON valid!", "error")
        package_param_list = {}

    total_order = package_param_list.get("data", {}).get("pagination", {}).get("total", 0)
    index_list = package_param_list.get("data", {}).get("index_list", [])
    
    if total_order == 0 or not index_list:
        log_message("⚠️ Tidak ada pesanan yang ditemukan di package_param_list.", "warning")
        send_to_frontend("⚠️ Tidak ada pesanan yang ditemukan.")
        
        # Simpan order_list.json dengan data kosong
        try:
            with open(order_list_path, "w", encoding="utf-8") as json_file:
                json.dump([], json_file, indent=2)
            
            log_message("✅ order_list.json disimpan dengan data kosong.")
        except Exception as e:
            log_message(f"❌ Gagal menyimpan order_list kosong: {str(e)}", "error")
        
        # Lanjutkan proses tanpa menghentikan program
        sys.exit()

    formatted_data_package_param_list = [
        {
            "package_number": order.get("package_number", ""),
            "shop_id": order.get("shop_id", ""),
            "region_id": order.get("region_id", "")
        }
        for order in index_list
    ]

    log_message(f"Sukses ambil package_param_list, total pesanan: {total_order}")
    send_to_frontend(f"✅ Sukses ambil package_param_list, total pesanan: {total_order}")

except requests.RequestException as e:
    log_message(f"❌ Error mengambil package_param_list: {e}", "error")
    send_to_frontend("❌ Error mengambil package_param_list")
    
    # Simpan order_list.json dengan data kosong
    try:
        with open(order_list_path, "w", encoding="utf-8") as json_file:
            json.dump([], json_file, indent=2)
        
        log_message("✅ order_list.json disimpan dengan data kosong.")
    except Exception as e:
        log_message(f"❌ Gagal menyimpan order_list kosong: {str(e)}", "error")
    
    # Lanjutkan proses tanpa menghentikan program
    sys.exit()

time.sleep(3)

url_order_list = f"https://seller.shopee.co.id/api/v3/order/get_order_list_card_list?SPC_CDS={spc_cds}&SPC_CDS_VER=2"

payload_order_list = {
    "order_list_tab": 300,
    "need_count_down_desc": True,
    "package_param_list": formatted_data_package_param_list
}

try:
    response_order_list = requests.post(url_order_list, headers=headers, cookies=cookie, json=payload_order_list)
    response_order_list.raise_for_status()

    try:
        order_list = response_order_list.json()
    except json.JSONDecodeError:
        log_message("❌ Response order_list bukan JSON valid!", "error")
        order_list = {}

    formatted_data_order_list = [
        {
            "order_sn": order["package_card"]["card_header"]["order_sn"],
            "buyer_username": order["package_card"]["card_header"]["buyer_info"]["username"],
            "items": [
                {
                    "item_name": item["name"],
                    "item_description": item.get("description", ""),
                    "item_amount": item["amount"]
                }
                for item_group in order.get("package_card", {}).get("item_info_group", {}).get("item_info_list", [])
                for item in item_group.get("item_list", [])
            ],
        }
        for order in order_list.get("data", {}).get("card_list", [])
    ]

    with open(order_list_path, "w", encoding="utf-8") as json_file:
        json.dump(formatted_data_order_list, json_file, indent=2)

    log_message(f"Sukses ambil order_list, total pesanan: {len(formatted_data_order_list)}")
    send_to_frontend(f"✅ Sukses ambil order_list, total pesanan: {len(formatted_data_order_list)}")

except requests.RequestException as e:
    log_message(f"❌ Error mengambil order_list: {e}", "error")
    send_to_frontend("❌ Error mengambil order_list")

except Exception as e:
    error_trace = traceback.format_exc()
    log_message(f"❌ Error di get_data.py: {e}\n{error_trace}", "error")
    send_to_frontend(f"❌ Error di get_data.py: {e}")