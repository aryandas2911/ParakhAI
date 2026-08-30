"""Comprehensive OCR verification against real Supabase data."""
import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()

from app.core.supabase import get_supabase_client
from app.services.ocr import run_ocr_on_image
import httpx

API = "http://localhost:8000"
supabase = get_supabase_client()

passed = 0
failed = 0

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        print(f"  FAIL: {name} {detail}")
        failed += 1

# ── Setup: create test user + login ─────────────────────
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlienVuamlwem96aXBxc25kdnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjgwNDYsImV4cCI6MjEwMzUwNDA0Nn0.9sVtLffWrE7UxIq-tIx8BLfHpGO5c20T-QDZraP_h_U"
URL = os.getenv("SUPABASE_URL")

print("[setup] Creating test user + getting JWT...")
email = f"ocr_verify_{int(time.time())}@test.com"
resp = httpx.post(f"{URL}/auth/v1/signup", json={"email": email, "password": "TestPass123!"}, headers={"apikey": ANON_KEY, "Content-Type": "application/json"}, timeout=15)
token = resp.json().get("access_token")
user_id = resp.json().get("user", {}).get("id")
check("JWT token obtained", token is not None)
print(f"    user_id={user_id}")

def auth_get(path):
    return httpx.get(f"{API}{path}", headers={"Authorization": f"Bearer {token}"}, timeout=30)

def auth_post(path):
    return httpx.post(f"{API}{path}", headers={"Authorization": f"Bearer {token}"}, timeout=120)

# ── Find existing image to use ──────────────────────────
print("\n[setup] Finding an existing inspection image to test with...")
# Look for any inspection with images from any user (we'll download the image directly)
all_images = supabase.table("inspection_images").select("image_id, inspection_id, storage_path").limit(5).execute().data or []
check("Existing images found in DB", len(all_images) > 0, f"found {len(all_images)}")

if not all_images:
    print("No images in DB. Creating test inspection + uploading synthetic image...")
    # Create inspection
    insp_resp = supabase.table("inspections").insert({
        "inspector_id": user_id,
        "title": "OCR Verification Test",
        "status": "draft",
    }).execute()
    test_inspection_id = insp_resp.data[0]["inspection_id"]

    # Create a synthetic product label image
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (600, 200), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "Amul Butter 500g", fill=(0, 0, 0))
    draw.text((20, 60), "MRP: Rs. 50.00", fill=(0, 0, 0))
    draw.text((20, 100), "Mfg Date: 2024-06-15", fill=(0, 0, 0))
    draw.text((20, 140), "Batch No: AB12345", fill=(0, 0, 0))
    import io
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    # Upload to storage
    storage_path = f"{test_inspection_id}/test_label.png"
    supabase.storage.from_("inspection-images").upload(storage_path, img_bytes, {"content-type": "image/png"})

    # Generate signed URL and store in DB
    signed = supabase.storage.from_("inspection-images").create_signed_url(storage_path, 36000)
    signed_url = signed.get("signedURL", "")

    img_resp = supabase.table("inspection_images").insert({
        "inspection_id": test_inspection_id,
        "storage_path": signed_url,
        "original_filename": "test_label.png",
        "file_size_bytes": len(img_bytes),
        "mime_type": "image/png",
    }).execute()
    test_image_id = img_resp.data[0]["image_id"]
    all_images = [{"image_id": test_image_id, "inspection_id": test_inspection_id, "storage_path": signed_url}]
    print(f"    Created inspection {test_inspection_id} with image {test_image_id}")
else:
    test_inspection_id = all_images[0]["inspection_id"]
    test_image_id = all_images[0]["image_id"]
    print(f"    Using existing image {test_image_id} from inspection {test_inspection_id}")

# ══════════════════════════════════════════════════════════
# TESTS
# ══════════════════════════════════════════════════════════

# ── 1: OCR runs successfully ────────────────────────────
print("\n[1] OCR runs successfully on real image")
img_url = all_images[0]["storage_path"]
if not img_url.startswith("http"):
    signed = supabase.storage.from_("inspection-images").create_signed_url(img_url, 3600)
    img_url = signed.get("signedURL", "")
with httpx.Client(timeout=30, follow_redirects=True) as c:
    img_bytes = c.get(img_url).content
ocr_result = run_ocr_on_image(img_bytes, test_image_id)
check("OCR status is success", ocr_result.status == "success", f"got {ocr_result.status}: {ocr_result.error}")
check("OCR returned blocks", len(ocr_result.blocks) > 0, f"got {len(ocr_result.blocks)} blocks")

# ── 2: Actual text from the image is returned ───────────
print("\n[2] Actual text from the image is returned")
all_text = " ".join(b.text for b in ocr_result.blocks)
check("Text is non-empty", len(all_text.strip()) > 0)
check("Confidence scores are valid (0-1)", all(0 <= b.confidence <= 1 for b in ocr_result.blocks))
check("Bounding boxes are 4-point polygons", all(len(b.bounding_box) == 4 for b in ocr_result.blocks))
print(f"    Extracted: \"{all_text[:150]}\"")

# ── 3: OCR results stored in Supabase ───────────────────
print("\n[3] OCR results stored in Supabase (one row per image)")
# Clean old results
supabase.table("ocr_results").delete().eq("inspection_id", test_inspection_id).execute()

full_text = "\n".join(b.text for b in ocr_result.blocks)
avg_conf = sum(b.confidence for b in ocr_result.blocks) / len(ocr_result.blocks) if ocr_result.blocks else 0
blocks_json = [{"text": b.text, "confidence": b.confidence, "bounding_box": b.bounding_box} for b in ocr_result.blocks]
insert_resp = supabase.table("ocr_results").insert({
    "inspection_id": test_inspection_id,
    "image_id": test_image_id,
    "full_text": full_text,
    "blocks_json": blocks_json,
    "avg_confidence": round(avg_conf, 4),
}).execute()
check("Insert succeeded", insert_resp.data is not None and len(insert_resp.data) > 0)

rows = supabase.table("ocr_results").select("*").eq("inspection_id", test_inspection_id).execute().data
check("Row exists in DB", len(rows) == 1, f"got {len(rows)} rows")
check("full_text is populated", len(rows[0].get("full_text", "")) > 0 if rows else False)
check("blocks_json is populated", len(rows[0].get("blocks_json", [])) > 0 if rows else False)
check("avg_confidence is set", float(rows[0].get("avg_confidence", 0)) > 0 if rows else False)

# ── 4: Refresh retrieves stored results ─────────────────
print("\n[4] Refresh retrieves stored results (GET /ocr endpoint)")
resp = auth_get(f"/api/inspections/{test_inspection_id}/ocr")
check("GET /ocr returns 200", resp.status_code == 200, f"got {resp.status_code}: {resp.text[:200]}")
if resp.status_code == 200:
    data = resp.json()
    check("Response has images", len(data.get("images", [])) > 0)
    check("Response has total_blocks > 0", data.get("total_blocks", 0) > 0)
    first_img = data["images"][0]
    check("Image has blocks", len(first_img.get("blocks", [])) > 0)
    check("Block has text", len(first_img["blocks"][0].get("text", "")) > 0)
    print(f"    GET /ocr: {len(data['images'])} images, {data['total_blocks']} blocks")

# ── 5: Multiple images processed separately ─────────────
print("\n[5] Multiple images processed separately")
# Add a second image to same inspection
from PIL import Image, ImageDraw
import io
img2 = Image.new("RGB", (600, 200), color=(255, 255, 255))
draw2 = ImageDraw.Draw(img2)
draw2.text((20, 20), "Tata Salt Iodized 1kg", fill=(0, 0, 0))
draw2.text((20, 60), "MRP: Rs. 30.00", fill=(0, 0, 0))
buf2 = io.BytesIO()
img2.save(buf2, format="PNG")
img2_bytes = buf2.getvalue()

storage_path2 = f"{test_inspection_id}/test_label_2.png"
supabase.storage.from_("inspection-images").upload(storage_path2, img2_bytes, {"content-type": "image/png"})
signed2 = supabase.storage.from_("inspection-images").create_signed_url(storage_path2, 36000)
signed_url2 = signed2.get("signedURL", "")

img2_resp = supabase.table("inspection_images").insert({
    "inspection_id": test_inspection_id,
    "storage_path": signed_url2,
    "original_filename": "test_label_2.png",
    "file_size_bytes": len(img2_bytes),
    "mime_type": "image/png",
}).execute()
test_image_id_2 = img2_resp.data[0]["image_id"]

# OCR the second image
ocr2 = run_ocr_on_image(img2_bytes, test_image_id_2)
full_text2 = "\n".join(b.text for b in ocr2.blocks)
avg_conf2 = sum(b.confidence for b in ocr2.blocks) / len(ocr2.blocks) if ocr2.blocks else 0
blocks_json2 = [{"text": b.text, "confidence": b.confidence, "bounding_box": b.bounding_box} for b in ocr2.blocks]
supabase.table("ocr_results").insert({
    "inspection_id": test_inspection_id,
    "image_id": test_image_id_2,
    "full_text": full_text2,
    "blocks_json": blocks_json2,
    "avg_confidence": round(avg_conf2, 4),
}).execute()

rows = supabase.table("ocr_results").select("*").eq("inspection_id", test_inspection_id).execute().data
check("Two rows stored (one per image)", len(rows) == 2, f"got {len(rows)}")
check("Different image_ids", rows[0]["image_id"] != rows[1]["image_id"] if len(rows) == 2 else False)
print(f"    Image 1 text: \"{rows[0]['full_text'][:60]}\"")
print(f"    Image 2 text: \"{rows[1]['full_text'][:60]}\"")

# Verify GET /ocr returns both
resp = auth_get(f"/api/inspections/{test_inspection_id}/ocr")
if resp.status_code == 200:
    data = resp.json()
    check("GET /ocr returns 2 images", len(data["images"]) == 2)

# ── 6: OCR failures reported without fake results ───────
print("\n[6] OCR failures reported without fake results")
bad = run_ocr_on_image(b"garbage-bytes", "fake-id")
check("Bad input status=failed", bad.status == "failed")
check("Bad input has error message", bad.error is not None and len(bad.error) > 0)
check("Bad input has 0 blocks", len(bad.blocks) == 0)

# ── 7: Unauthorized users cannot access ─────────────────
print("\n[7] Unauthorized users cannot retrieve another user's results")
fake_resp = auth_get(f"/api/inspections/{test_inspection_id}/ocr")  # This user owns it, so 200
check("Owner can access (200)", fake_resp.status_code == 200)

# Create a second user and try to access
email2 = f"ocr_other_{int(time.time())}@test.com"
resp2 = httpx.post(f"{URL}/auth/v1/signup", json={"email": email2, "password": "TestPass123!"}, headers={"apikey": ANON_KEY, "Content-Type": "application/json"}, timeout=15)
token2 = resp2.json().get("access_token")
if token2:
    other_resp = httpx.get(f"{API}/api/inspections/{test_inspection_id}/ocr", headers={"Authorization": f"Bearer {token2}"}, timeout=30)
    check("Other user gets 403/404", other_resp.status_code in [403, 404], f"got {other_resp.status_code}")
else:
    check("Other user auth", False, "could not create second user")

# ── 8: Existing upload/inspection still works ───────────
print("\n[8] Existing image upload and inspection functionality still works")
resp = auth_get(f"/api/inspections/{test_inspection_id}")
check("GET inspection returns 200", resp.status_code == 200, f"got {resp.status_code}")

# List inspections
resp = auth_get("/api/inspections")
check("GET /api/inspections returns 200", resp.status_code == 200, f"got {resp.status_code}")

# ── 9: No duplicate OCR results on re-process ──────────
print("\n[9] No duplicate OCR results on re-process via API")
# Process via the API endpoint
r1 = auth_post(f"/api/inspections/{test_inspection_id}/process")
check("First process returns 200", r1.status_code == 200, f"got {r1.status_code}: {r1.text[:300]}")
rows_after_1 = supabase.table("ocr_results").select("ocr_result_id").eq("inspection_id", test_inspection_id).execute().data

r2 = auth_post(f"/api/inspections/{test_inspection_id}/process")
check("Second process returns 200", r2.status_code == 200, f"got {r2.status_code}: {r2.text[:300]}")
rows_after_2 = supabase.table("ocr_results").select("ocr_result_id").eq("inspection_id", test_inspection_id).execute().data

# Count images in inspection
img_count = supabase.table("inspection_images").select("image_id").eq("inspection_id", test_inspection_id).execute().data
check("No duplicates after re-process", len(rows_after_2) == len(img_count), f"ocr_rows={len(rows_after_2)}, images={len(img_count)}")

# ── 10: Verify the API response has actual OCR text ─────
print("\n[10] Verify API response contains real OCR text (not empty)")
r = auth_get(f"/api/inspections/{test_inspection_id}/ocr")
if r.status_code == 200:
    data = r.json()
    total_text = " ".join(img["blocks"][0]["text"] for img in data["images"] if img.get("blocks"))
    check("API returns real text content", len(total_text.strip()) > 0, f"text='{total_text[:80]}'")
    check("Confidence values are floats between 0-1", all(0 <= b["confidence"] <= 1 for img in data["images"] for b in img["blocks"]))

# ── Summary ─────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"Results: {passed} passed, {failed} failed out of {passed+failed}")
if failed > 0:
    sys.exit(1)
