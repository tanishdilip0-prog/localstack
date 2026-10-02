from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from auth import hash_password, verify_password, create_token
import psycopg
import re
import math
import csv
import io
import json

app = FastAPI(title="LocalStock API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://172.28.82.219:5173",
        "http://172.28.82.219:4173",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATABASE_URL = (
    "dbname=localstock "
    "user=localstock_user "
    "password=localstock123 "
    "host=localhost"
)


def get_connection():
    return psycopg.connect(DATABASE_URL)


# =========================================================
# REQUEST MODELS
# =========================================================

class SearchRequest(BaseModel):
    message: str
    latitude: float | None = None
    longitude: float | None = None

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "customer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProductRequest(BaseModel):
    shop: str
    product: str
    category: str
    price: int
    online_price: int
    stock: int
    distance: float = 0
    rating: float = 0
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class ReservationRequest(BaseModel):
    product_id: int
    shop: str
    customer_name: str = "Guest"


class ReservationStatusRequest(BaseModel):
    status: str


# =========================================================
# GEOLOCATION
# =========================================================

def calculate_distance(
    user_latitude,
    user_longitude,
    shop_latitude,
    shop_longitude,
):
    """
    Calculate straight-line distance between two GPS coordinates
    using the Haversine formula.
    """

    if (
        user_latitude is None
        or user_longitude is None
        or shop_latitude is None
        or shop_longitude is None
    ):
        return None

    earth_radius_km = 6371.0

    lat1 = math.radians(user_latitude)
    lat2 = math.radians(shop_latitude)

    delta_lat = math.radians(
        shop_latitude - user_latitude
    )

    delta_lon = math.radians(
        shop_longitude - user_longitude
    )

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius_km * c


# =========================================================
# AI / NLP
# =========================================================

def extract_budget(text: str):

    patterns = [
        r"(?:under|below|less than|within|max(?:imum)|budget(?: of)?)[^\d₹]*₹?\s*(\d+)",
        r"₹\s*(\d+)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text.lower(),
        )

        if match:
            return int(match.group(1))

    return None


def detect_product(text: str):

    text = text.lower()

    products = [

        (
            "fast charger",
            [
                "fast charger",
                "fast charging",
                "quick charger",
            ],
        ),

        (
            "laptop charger",
            [
                "laptop charger",
                "laptop adapter",
            ],
        ),

        (
            "phone charger",
            [
                "phone charger",
                "mobile charger",
                "charger",
            ],
        ),

        (
            "power bank",
            [
                "power bank",
                "powerbank",
            ],
        ),

        (
            "usb-c cable",
            [
                "usb c cable",
                "usb-c cable",
                "type c cable",
            ],
        ),

        (
            "earphones",
            [
                "earphones",
                "earbuds",
                "headphones",
            ],
        ),

        (
            "mouse",
            [
                "mouse",
                "computer mouse",
            ],
        ),

        (
            "keyboard",
            [
                "keyboard",
            ],
        ),

        (
            "phone",
            [
                "smartphone",
                "mobile phone",
                "phone",
            ],
        ),

        (
            "laptop",
            [
                "laptop",
                "notebook",
            ],
        ),
    ]

    for product, keywords in products:

        for keyword in keywords:

            if keyword in text:
                return product

    return "general product"


def detect_urgency(text: str):

    text = text.lower()

    high_urgency = [
        "urgent",
        "urgently",
        "right now",
        "immediately",
        "today",
        "asap",
        "quickly",
        "tonight",
        "emergency",
    ]

    medium_urgency = [
        "tomorrow",
        "soon",
        "this evening",
        "this morning",
    ]

    if any(word in text for word in high_urgency):
        return "high"

    if any(word in text for word in medium_urgency):
        return "medium"

    return "normal"


def detect_sentiment(text: str):

    text = text.lower()

    frustrated_words = [
        "frustrated",
        "annoyed",
        "angry",
        "tired",
        "everywhere",
        "nobody",
        "can't find",
        "cannot find",
        "already searched",
        "already checked",
    ]

    positive_words = [
        "great",
        "thanks",
        "thank you",
        "happy",
        "perfect",
    ]

    if any(word in text for word in frustrated_words):
        return "frustrated"

    if any(word in text for word in positive_words):
        return "positive"

    return "neutral"


# =========================================================
# DATABASE SETUP + MIGRATION
# =========================================================

def setup_database():

    conn = get_connection()
    cur = conn.cursor()

    # -----------------------------------------------------
    # Inventory table
    # -----------------------------------------------------

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            shop VARCHAR(255) NOT NULL,
            product VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            price INTEGER NOT NULL,
            online_price INTEGER NOT NULL,
            stock INTEGER NOT NULL,
            distance FLOAT NOT NULL DEFAULT 0,
            rating FLOAT NOT NULL DEFAULT 0
        )
        """
    )

    # -----------------------------------------------------
    # Add new columns to existing database
    # -----------------------------------------------------

    cur.execute(
        """
        ALTER TABLE inventory
        ADD COLUMN IF NOT EXISTS address VARCHAR(500)
        """
    )

    cur.execute(
        """
        ALTER TABLE inventory
        ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION
        """
    )

    cur.execute(
        """
        ALTER TABLE inventory
        ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
        """
    )

    # -----------------------------------------------------
    # Reservations
    # -----------------------------------------------------

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS reservations (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL,
            shop VARCHAR(255) NOT NULL,
            product VARCHAR(255) NOT NULL,
            price INTEGER NOT NULL,
            customer_name VARCHAR(255) DEFAULT 'Guest',
            status VARCHAR(50) DEFAULT 'reserved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # -----------------------------------------------------
    # Users
    # -----------------------------------------------------

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # -----------------------------------------------------
    # Seed demo products ONLY if inventory is empty
    # -----------------------------------------------------

    cur.execute(
        "SELECT COUNT(*) FROM inventory"
    )

    count = cur.fetchone()[0]

    if count == 0:

        sample_products = [

            (
                "Sri Electronics",
                "Fast Charging Adapter",
                "fast charger",
                649,
                799,
                12,
                0.8,
                4.8,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),

            (
                "Tech Zone",
                "65W Fast Charger",
                "fast charger",
                699,
                849,
                5,
                1.2,
                4.6,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),

            (
                "City Mobiles",
                "USB-C Fast Charger",
                "fast charger",
                749,
                899,
                8,
                1.8,
                4.7,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),

            (
                "Mobile World",
                "Phone Charger",
                "phone charger",
                499,
                599,
                15,
                1.1,
                4.5,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),

            (
                "Digital Point",
                "Power Bank 10000mAh",
                "power bank",
                899,
                1099,
                7,
                2.0,
                4.6,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),

            (
                "Laptop Hub",
                "Laptop Charger 65W",
                "laptop charger",
                1299,
                1499,
                4,
                2.4,
                4.4,
                "Chennai, Tamil Nadu",
                None,
                None,
            ),
        ]

        cur.executemany(
            """
            INSERT INTO inventory
            (
                shop,
                product,
                category,
                price,
                online_price,
                stock,
                distance,
                rating,
                address,
                latitude,
                longitude
            )
            VALUES
            (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            sample_products,
        )

    conn.commit()

    cur.close()
    conn.close()


setup_database()


# =========================================================
# INVENTORY SEARCH
# =========================================================

def search_inventory(
    product,
    budget,
    user_latitude=None,
    user_longitude=None,
):

    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT
            id,
            shop,
            product,
            category,
            price,
            online_price,
            stock,
            distance,
            rating,
            address,
            latitude,
            longitude
        FROM inventory
        WHERE stock > 0
    """

    params = []

    if product != "general product":

        query += """
            AND (
                category = %s
                OR category ILIKE %s
                OR product ILIKE %s
            )
        """

        params.extend(
            [
                product,
                f"%{product}%",
                f"%{product}%",
            ]
        )

    if budget is not None:

        query += """
            AND price <= %s
        """

        params.append(budget)

    cur.execute(
        query,
        params,
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    results = []

    for row in rows:

        (
            product_id,
            shop,
            product_name,
            category,
            price,
            online_price,
            stock,
            stored_distance,
            rating,
            address,
            shop_latitude,
            shop_longitude,
        ) = row

        # -------------------------------------------------
        # Use real GPS distance when both sides have coords
        # -------------------------------------------------

        gps_distance = calculate_distance(
            user_latitude,
            user_longitude,
            shop_latitude,
            shop_longitude,
        )

        if gps_distance is not None:
            final_distance = round(
                gps_distance,
                2,
            )
        else:
            final_distance = stored_distance

        results.append(
            {
                "id": product_id,
                "shop": shop,
                "product": product_name,
                "category": category,
                "price": price,
                "online_price": online_price,
                "stock": stock,
                "distance": final_distance,
                "rating": rating,
                "savings": max(
                    online_price - price,
                    0,
                ),
                "address": address,
                "latitude": shop_latitude,
                "longitude": shop_longitude,
                "location_verified": (
                    gps_distance is not None
                ),
            }
        )

    # -----------------------------------------------------
    # Sort by actual distance when GPS is available
    # -----------------------------------------------------

    if user_latitude is not None and user_longitude is not None:

        results.sort(
            key=lambda item: (
                item["distance"]
                if item["distance"] is not None
                else 999999
            )
        )

    else:

        results.sort(
            key=lambda item: (
                item["distance"]
                if item["distance"] is not None
                else 999999
            )
        )

    return results


# =========================================================
# BASIC ENDPOINTS
# =========================================================

@app.get("/")
def home():

    return {
        "message": "LocalStock API is running",
        "status": "success",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
    }


# =========================================================
# INVENTORY
# =========================================================
@app.post("/auth/register")
def register_user(data: RegisterRequest):

    if data.role not in ["customer", "shopkeeper"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (data.email.lower(),)
        )

        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        password_hash = hash_password(data.password)

        cur.execute(
            """
            INSERT INTO users
            (name, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, email, role
            """,
            (
                data.name,
                data.email.lower(),
                password_hash,
                data.role
            )
        )

        user = cur.fetchone()
        conn.commit()

        return {
            "message": "Account created successfully",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3]
            }
        }

    finally:
        conn.close()


@app.post("/auth/login")
def login_user(data: LoginRequest):

    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, name, email, password_hash, role
            FROM users
            WHERE email = %s
            """,
            (data.email.lower(),)
        )

        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not verify_password(
            data.password,
            user[3]
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_token(
            user[0],
            user[4]
        )

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4]
            }
        }

    finally:
        conn.close()
        
@app.get("/inventory")
def get_inventory():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            id,
            shop,
            product,
            category,
            price,
            online_price,
            stock,
            distance,
            rating,
            address,
            latitude,
            longitude
        FROM inventory
        ORDER BY id
        """
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    products = []

    for row in rows:

        (
            product_id,
            shop,
            product,
            category,
            price,
            online_price,
            stock,
            distance,
            rating,
            address,
            latitude,
            longitude,
        ) = row

        products.append(
            {
                "id": product_id,
                "shop": shop,
                "product": product,
                "category": category,
                "price": price,
                "online_price": online_price,
                "stock": stock,
                "distance": distance,
                "rating": rating,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
                "savings": max(
                    online_price - price,
                    0,
                ),
            }
        )

    return {
        "count": len(products),
        "products": products,
    }


# =========================================================
# ADD PRODUCT
# =========================================================

@app.post("/inventory")
def add_product(request: ProductRequest):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO inventory
        (
            shop,
            product,
            category,
            price,
            online_price,
            stock,
            distance,
            rating,
            address,
            latitude,
            longitude
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id
        """,
        (
            request.shop,
            request.product,
            request.category.lower(),
            request.price,
            request.online_price,
            request.stock,
            request.distance,
            request.rating,
            request.address,
            request.latitude,
            request.longitude,
        ),
    )

    new_id = cur.fetchone()[0]

    conn.commit()

    cur.close()
    conn.close()

    return {
        "success": True,
        "message": "Product added successfully",
        "product": {
            "id": new_id,
            "shop": request.shop,
            "product": request.product,
            "category": request.category.lower(),
            "price": request.price,
            "online_price": request.online_price,
            "stock": request.stock,
            "distance": request.distance,
            "rating": request.rating,
            "address": request.address,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "savings": max(
                request.online_price - request.price,
                0,
            ),
        },
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.delete("/inventory/{product_id}")
def delete_product(product_id: int):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        DELETE FROM inventory
        WHERE id = %s
        RETURNING id, shop, product
        """,
        (product_id,),
    )

    row = cur.fetchone()

    if row is None:

        cur.close()
        conn.close()

        return {
            "success": False,
            "message": "Product not found",
        }

    conn.commit()

    cur.close()
    conn.close()

    return {
        "success": True,
        "message": "Product deleted",
        "product": {
            "id": row[0],
            "shop": row[1],
            "product": row[2],
        },
    }


# =========================================================
# BULK INVENTORY UPLOAD (CSV / JSON)
# =========================================================

@app.post("/inventory/upload")
async def upload_inventory_file(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    if not (filename.endswith(".csv") or filename.endswith(".json")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a .csv or .json file."
        )

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to decode file content.")

    products_to_insert = []
    errors = []

    if filename.endswith(".json"):
        try:
            data = json.loads(text)
            if isinstance(data, dict) and "products" in data:
                items = data["products"]
            elif isinstance(data, list):
                items = data
            else:
                items = [data]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")

        for idx, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                errors.append(f"Row {idx}: Item is not a valid JSON object.")
                continue
            shop = str(item.get("shop", "")).strip()
            product = str(item.get("product", "")).strip()
            category = str(item.get("category", "general")).strip().lower()
            try:
                price = int(float(item.get("price", 0)))
                online_price = int(float(item.get("online_price", price) or price))
                stock = int(float(item.get("stock", 1) or 1))
            except (ValueError, TypeError):
                errors.append(f"Row {idx}: Invalid price, online_price or stock numbers.")
                continue

            if not shop or not product or price <= 0:
                errors.append(f"Row {idx}: Missing required fields (shop, product, price > 0).")
                continue

            distance = float(item.get("distance", 0) or 0)
            rating = float(item.get("rating", 0) or 0)
            address = item.get("address")
            lat = float(item["latitude"]) if item.get("latitude") is not None else None
            lng = float(item["longitude"]) if item.get("longitude") is not None else None

            products_to_insert.append((
                shop, product, category, price, online_price, stock,
                distance, rating, address, lat, lng
            ))

    elif filename.endswith(".csv"):
        try:
            reader = csv.DictReader(io.StringIO(text))
            if not reader.fieldnames:
                raise HTTPException(status_code=400, detail="CSV file has no headers.")

            for idx, row in enumerate(reader, start=2):
                if not row or not any(row.values()):
                    continue
                norm_row = {k.strip().lower().replace(" ", "_"): (v.strip() if v else "") for k, v in row.items() if k}
                shop = norm_row.get("shop") or norm_row.get("shop_name") or norm_row.get("store") or ""
                product = norm_row.get("product") or norm_row.get("product_name") or norm_row.get("item") or ""
                category = (norm_row.get("category") or "general").lower()

                if not shop or not product:
                    errors.append(f"Line {idx}: Missing shop or product name.")
                    continue

                try:
                    price = int(float(norm_row.get("price", 0) or 0))
                    online_price = int(float(norm_row.get("online_price", price) or price))
                    stock = int(float(norm_row.get("stock", 1) or 1))
                except ValueError:
                    errors.append(f"Line {idx}: Invalid numeric value for price, online_price, or stock.")
                    continue

                if price <= 0:
                    errors.append(f"Line {idx}: Price must be greater than 0.")
                    continue

                distance = float(norm_row.get("distance", 0) or 0) if norm_row.get("distance") else 0.0
                rating = float(norm_row.get("rating", 0) or 0) if norm_row.get("rating") else 0.0
                address = norm_row.get("address") or None
                lat = float(norm_row["latitude"]) if norm_row.get("latitude") else None
                lng = float(norm_row["longitude"]) if norm_row.get("longitude") else None

                products_to_insert.append((
                    shop, product, category, price, online_price, stock,
                    distance, rating, address, lat, lng
                ))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if not products_to_insert:
        return {
            "success": False,
            "message": "No valid product records found matching required pattern.",
            "inserted_count": 0,
            "errors": errors[:25]
        }

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.executemany(
            """
            INSERT INTO inventory
            (
                shop,
                product,
                category,
                price,
                online_price,
                stock,
                distance,
                rating,
                address,
                latitude,
                longitude
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            products_to_insert
        )
        conn.commit()
        return {
            "success": True,
            "message": f"Successfully imported {len(products_to_insert)} products.",
            "inserted_count": len(products_to_insert),
            "errors": errors[:25],
            "total_rows_processed": len(products_to_insert) + len(errors)
        }
    finally:
        conn.close()


# =========================================================
# AI SEARCH
# =========================================================

@app.post("/ai/search")
def ai_search(request: SearchRequest):

    message = request.message.strip()

    product = detect_product(message)

    budget = extract_budget(message)

    urgency = detect_urgency(message)

    sentiment = detect_sentiment(message)

    matched_products = search_inventory(
        product,
        budget,
        request.latitude,
        request.longitude,
    )

    using_real_location = (
        request.latitude is not None
        and request.longitude is not None
    )

    return {
        "original_message": message,

        "location": {
            "available": using_real_location,
            "latitude": request.latitude,
            "longitude": request.longitude,
        },

        "understanding": {
            "product": product,
            "budget": budget,
            "urgency": urgency,
            "sentiment": sentiment,
        },

        "results": {
            "count": len(matched_products),
            "products": matched_products,
        },

        "message": (
            "LocalStock used your current location "
            "to rank nearby stores."
            if using_real_location
            else
            "LocalStock understood your request. "
            "Allow location access for GPS-based distance."
        ),
    }


# =========================================================
# RESERVE PRODUCT
# =========================================================

@app.post("/reserve")
def reserve_product(request: ReservationRequest):

    conn = get_connection()

    try:

        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                shop,
                product,
                price,
                stock
            FROM inventory
            WHERE id = %s
            AND shop = %s
            FOR UPDATE
            """,
            (
                request.product_id,
                request.shop,
            ),
        )

        row = cur.fetchone()

        if row is None:

            conn.rollback()

            return {
                "success": False,
                "message": "Product not found",
            }

        (
            product_id,
            shop,
            product,
            price,
            stock,
        ) = row

        if stock <= 0:

            conn.rollback()

            return {
                "success": False,
                "message": "Product is out of stock",
            }

        # Reduce stock
        cur.execute(
            """
            UPDATE inventory
            SET stock = stock - 1
            WHERE id = %s
            """,
            (product_id,),
        )

        # Create reservation
        cur.execute(
            """
            INSERT INTO reservations
            (
                product_id,
                shop,
                product,
                price,
                customer_name,
                status
            )
            VALUES
            (%s,%s,%s,%s,%s,'reserved')
            RETURNING id
            """,
            (
                product_id,
                shop,
                product,
                price,
                request.customer_name,
            ),
        )

        reservation_id = cur.fetchone()[0]

        conn.commit()

        return {
            "success": True,
            "message": "Product reserved successfully",
            "reservation_id": reservation_id,
            "product": product,
            "shop": shop,
            "price": price,
            "remaining_stock": stock - 1,
            "status": "reserved",
        }

    except Exception as error:

        print("Reservation error:", error)

        conn.rollback()

        return {
            "success": False,
            "message": "Reservation failed",
        }

    finally:

        conn.close()


# =========================================================
# GET RESERVATIONS
# =========================================================

@app.get("/reservations")
def get_reservations():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            id,
            product_id,
            shop,
            product,
            price,
            customer_name,
            status,
            created_at
        FROM reservations
        ORDER BY id DESC
        """
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    reservations = []

    for row in rows:

        (
            reservation_id,
            product_id,
            shop,
            product,
            price,
            customer_name,
            status,
            created_at,
        ) = row

        reservations.append(
            {
                "id": reservation_id,
                "product_id": product_id,
                "shop": shop,
                "product": product,
                "price": price,
                "customer_name": customer_name,
                "status": status,
                "created_at": created_at.isoformat(),
            }
        )

    return {
        "count": len(reservations),
        "reservations": reservations,
    }


# =========================================================
# UPDATE RESERVATION STATUS
# =========================================================

@app.patch("/reservations/{reservation_id}/status")
def update_reservation_status(
    reservation_id: int,
    request: ReservationStatusRequest,
):

    allowed_statuses = [
        "reserved",
        "ready",
        "completed",
        "cancelled",
    ]

    new_status = request.status.lower().strip()

    if new_status not in allowed_statuses:

        return {
            "success": False,
            "message": (
                "Invalid status. Use: "
                "reserved, ready, completed, cancelled"
            ),
        }

    conn = get_connection()

    try:

        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                product,
                shop,
                status
            FROM reservations
            WHERE id = %s
            FOR UPDATE
            """,
            (reservation_id,),
        )

        row = cur.fetchone()

        if row is None:

            conn.rollback()

            return {
                "success": False,
                "message": "Reservation not found",
            }

        (
            reservation_id_db,
            product,
            shop,
            old_status,
        ) = row

        if old_status in [
            "completed",
            "cancelled",
        ]:

            conn.rollback()

            return {
                "success": False,
                "message": (
                    f"Reservation is already {old_status}"
                ),
            }

        cur.execute(
            """
            UPDATE reservations
            SET status = %s
            WHERE id = %s
            """,
            (
                new_status,
                reservation_id,
            ),
        )

        conn.commit()

        return {
            "success": True,
            "message": "Reservation status updated",
            "reservation_id": reservation_id_db,
            "product": product,
            "shop": shop,
            "old_status": old_status,
            "status": new_status,
        }

    except Exception as error:

        print("Status update error:", error)

        conn.rollback()

        return {
            "success": False,
            "message": "Failed to update reservation status",
        }

    finally:

        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)