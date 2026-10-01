from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI(title="LocalStock API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REQUEST MODELS
# =========================

class SearchRequest(BaseModel):
    message: str


class ProductRequest(BaseModel):
    shop: str
    product: str
    category: str
    price: int
    online_price: int
    stock: int
    distance: float
    rating: float


class ReservationRequest(BaseModel):
    product_id: int
    shop: str


# =========================
# SAMPLE INVENTORY
# =========================

inventory = [
    {
        "id": 1,
        "shop": "Sri Electronics",
        "product": "Fast Charging Adapter",
        "category": "fast charger",
        "price": 649,
        "online_price": 799,
        "stock": 12,
        "distance": 0.8,
        "rating": 4.8,
    },
    {
        "id": 2,
        "shop": "Tech Zone",
        "product": "65W Fast Charger",
        "category": "fast charger",
        "price": 699,
        "online_price": 849,
        "stock": 5,
        "distance": 1.2,
        "rating": 4.6,
    },
    {
        "id": 3,
        "shop": "City Mobiles",
        "product": "USB-C Fast Charger",
        "category": "fast charger",
        "price": 749,
        "online_price": 899,
        "stock": 8,
        "distance": 1.8,
        "rating": 4.7,
    },
    {
        "id": 4,
        "shop": "Mobile World",
        "product": "Phone Charger",
        "category": "phone charger",
        "price": 499,
        "online_price": 599,
        "stock": 15,
        "distance": 1.1,
        "rating": 4.5,
    },
    {
        "id": 5,
        "shop": "Digital Point",
        "product": "Power Bank 10000mAh",
        "category": "power bank",
        "price": 899,
        "online_price": 1099,
        "stock": 7,
        "distance": 2.0,
        "rating": 4.6,
    },
    {
        "id": 6,
        "shop": "Laptop Hub",
        "product": "Laptop Charger 65W",
        "category": "laptop charger",
        "price": 1299,
        "online_price": 1499,
        "stock": 4,
        "distance": 2.4,
        "rating": 4.4,
    },
]


# =========================
# AI / NLP
# =========================

def extract_budget(text: str):
    patterns = [
        r"(?:under|below|less than|within|max(?:imum)?|budget(?: of)?)[^\d₹]*₹?\s*(\d+)",
        r"₹\s*(\d+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text.lower())

        if match:
            return int(match.group(1))

    return None


def detect_product(text: str):
    text = text.lower()

    products = [
        ("fast charger", [
            "fast charger",
            "fast charging",
            "quick charger",
        ]),
        ("laptop charger", [
            "laptop charger",
            "laptop adapter",
        ]),
        ("phone charger", [
            "phone charger",
            "mobile charger",
            "charger",
        ]),
        ("power bank", [
            "power bank",
            "powerbank",
        ]),
        ("usb-c cable", [
            "usb c cable",
            "usb-c cable",
            "type c cable",
        ]),
        ("earphones", [
            "earphones",
            "earbuds",
            "headphones",
        ]),
        ("mouse", [
            "mouse",
            "computer mouse",
        ]),
        ("keyboard", [
            "keyboard",
        ]),
        ("phone", [
            "smartphone",
            "mobile phone",
            "phone",
        ]),
        ("laptop", [
            "laptop",
            "notebook",
        ]),
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


# =========================
# INVENTORY SEARCH
# =========================

def search_inventory(product, budget):
    results = []

    for item in inventory:

        product_match = (
            product == item["category"]
            or product in item["category"]
            or product in item["product"].lower()
        )

        if not product_match:
            continue

        if item["stock"] <= 0:
            continue

        if budget is not None and item["price"] > budget:
            continue

        result = item.copy()

        result["savings"] = (
            item["online_price"] - item["price"]
        )

        results.append(result)

    results.sort(key=lambda x: x["distance"])

    return results


# =========================
# BASIC ROUTES
# =========================

@app.get("/")
def home():
    return {
        "message": "LocalStock API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================
# GET INVENTORY
# =========================

@app.get("/inventory")
def get_inventory():
    products = []

    for item in inventory:
        product = item.copy()

        product["savings"] = (
            item["online_price"] - item["price"]
        )

        products.append(product)

    return {
        "count": len(products),
        "products": products
    }


# =========================
# SHOPKEEPER ADD PRODUCT
# =========================

@app.post("/inventory")
def add_product(request: ProductRequest):

    new_id = max(
        [item["id"] for item in inventory],
        default=0
    ) + 1

    new_product = {
        "id": new_id,
        "shop": request.shop,
        "product": request.product,
        "category": request.category.lower(),
        "price": request.price,
        "online_price": request.online_price,
        "stock": request.stock,
        "distance": request.distance,
        "rating": request.rating,
    }

    inventory.append(new_product)

    return {
        "success": True,
        "message": "Product added successfully",
        "product": new_product
    }


# =========================
# DELETE PRODUCT
# =========================

@app.delete("/inventory/{product_id}")
def delete_product(product_id: int):

    for index, item in enumerate(inventory):

        if item["id"] == product_id:

            deleted_product = inventory.pop(index)

            return {
                "success": True,
                "message": "Product deleted",
                "product": deleted_product
            }

    return {
        "success": False,
        "message": "Product not found"
    }


# =========================
# AI SEARCH
# =========================

@app.post("/ai/search")
def ai_search(request: SearchRequest):

    message = request.message.strip()

    product = detect_product(message)
    budget = extract_budget(message)
    urgency = detect_urgency(message)
    sentiment = detect_sentiment(message)

    matched_products = search_inventory(
        product,
        budget
    )

    return {
        "original_message": message,

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

        "message": "LocalStock understood your request"
    }


# =========================
# RESERVATION
# =========================

@app.post("/reserve")
def reserve_product(request: ReservationRequest):

    for item in inventory:

        if (
            item["id"] == request.product_id
            and item["shop"] == request.shop
        ):

            if item["stock"] <= 0:
                return {
                    "success": False,
                    "message": "Product is out of stock"
                }

            return {
                "success": True,
                "message": "Reservation request created",
                "product": item["product"],
                "shop": item["shop"],
                "price": item["price"],
            }

    return {
        "success": False,
        "message": "Product not found"
    }
