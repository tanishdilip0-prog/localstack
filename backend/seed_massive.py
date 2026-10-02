#!/usr/bin/env python3
"""
LocalStock — Massive Real Database Seed
200+ shops (small & big), 1000+ products, real Bengaluru locations
"""

import psycopg
import random

conn = psycopg.connect(
    dbname="localstock",
    user="localstock_user",
    password="localstock123",
    host="localhost"
)
cur = conn.cursor()

# ─────────────────────────────────────────────
# CLEAR EXISTING DATA
# ─────────────────────────────────────────────
cur.execute("DELETE FROM inventory")
print("Cleared existing inventory...")

# ─────────────────────────────────────────────
# 200+ SHOPS — real-sounding Bengaluru shops
# (shop_name, address, area, lat, lng, rating, type)
# ─────────────────────────────────────────────
shops = [
    # ── BIG CHAIN STORES ──────────────────────────────────────────────
    ("Croma - Koramangala",        "Forum Mall, 21 Hosur Rd, Koramangala",      12.9352, 77.6245, 4.5, "chain"),
    ("Croma - Indiranagar",        "100 Ft Rd, HAL 2nd Stage, Indiranagar",     12.9719, 77.6412, 4.4, "chain"),
    ("Croma - Whitefield",         "Phoenix Marketcity, Whitefield",            12.9698, 77.7499, 4.5, "chain"),
    ("Croma - Jayanagar",          "4th Block, 11th Main, Jayanagar",           12.9256, 77.5934, 4.3, "chain"),
    ("Croma - Malleswaram",        "Malleswaram Circle, Sampige Rd",            13.0035, 77.5674, 4.4, "chain"),
    ("Reliance Digital - MG Road", "Brigade Road, MG Road",                    12.9752, 77.6077, 4.5, "chain"),
    ("Reliance Digital - Whitefield","VR Bengaluru, Whitefield Main Rd",        12.9700, 77.7503, 4.4, "chain"),
    ("Reliance Digital - Hebbal",  "Elements Mall, NH 44, Hebbal",             13.0358, 77.5970, 4.3, "chain"),
    ("Reliance Digital - JP Nagar","JP Nagar 5th Phase, Bangalore",            12.9081, 77.5858, 4.4, "chain"),
    ("Vijay Sales - Koramangala",  "Sony World Signal, Hosur Rd",              12.9299, 77.6268, 4.3, "chain"),
    ("Vijay Sales - Rajajinagar",  "1st Block, 1st Main, Rajajinagar",         12.9922, 77.5488, 4.2, "chain"),
    ("Poorvika Mobiles - BTM",     "BTM 1st Stage, Dairy Circle",              12.9166, 77.6101, 4.2, "chain"),
    ("Poorvika Mobiles - HSR",     "Sector 6, HSR Layout",                     12.9116, 77.6389, 4.3, "chain"),
    ("Poorvika Mobiles - Yelahanka","Main Road, Yelahanka New Town",            13.1005, 77.5963, 4.2, "chain"),
    ("Samsung SmartCafe - MG Road","Trinity Circle, MG Road",                  12.9747, 77.6127, 4.6, "chain"),
    ("Samsung SmartCafe - Whitefield","Near ITPL, Whitefield",                 12.9814, 77.7305, 4.5, "chain"),
    ("Apple Reseller iStore - UB City","UB City Mall, Vittal Mallya Rd",        12.9718, 77.5982, 4.7, "chain"),
    ("Imagine by Reliance - Orion","Orion Mall, Dr Rajkumar Rd, Rajajinagar",  12.9951, 77.5554, 4.5, "chain"),
    ("Imagine by Reliance - Phoenix","Phoenix Mall, Velankani Tech Pk",         12.9141, 77.6062, 4.4, "chain"),
    ("OnePlus Experience - Indiranagar","100 Ft Rd, Indiranagar",              12.9784, 77.6408, 4.6, "chain"),
    ("Mi Home - Koramangala",      "Sony World Signal, 4th Block Koramangala",  12.9335, 77.6281, 4.4, "chain"),
    ("Mi Home - Malleshwaram",     "11th Cross, Malleshwaram",                  13.0039, 77.5658, 4.3, "chain"),
    ("Bose Store - UB City",       "UB City Mall, Vittal Mallya Rd",            12.9720, 77.5984, 4.8, "chain"),
    ("boAt Service Store - HSR",   "27th Main Rd, HSR Layout",                  12.9113, 77.6369, 4.2, "chain"),
    ("Noise Premium Store - Koramangala","80 Ft Rd, 4th Block, Koramangala",   12.9340, 77.6255, 4.3, "chain"),

    # ── MEDIUM SHOPS ─────────────────────────────────────────────────
    ("Sri Balaji Electronics",     "Avenue Road, Chickpet",                     12.9724, 77.5737, 4.1, "medium"),
    ("Rajesh Mobiles",             "Commercial Street, Shivajinagar",           12.9819, 77.6082, 4.0, "medium"),
    ("Kaveri Electronics",         "Gandhinagar, Bangalore",                    12.9776, 77.5705, 4.2, "medium"),
    ("Lakshmi Computers",          "Chickpet, Bangalore",                       12.9718, 77.5741, 4.0, "medium"),
    ("Tech Hub Bangalore",         "Residency Road, Shivajinagar",              12.9762, 77.6073, 4.3, "medium"),
    ("Electronic Bazaar",          "SP Road, Chickpet",                         12.9726, 77.5750, 3.9, "medium"),
    ("Ganesh Electronics",         "Gandhi Bazaar, Basavanagudi",               12.9422, 77.5736, 4.1, "medium"),
    ("Venus Electronics",          "Jayanagar 4th Block",                       12.9270, 77.5921, 4.0, "medium"),
    ("Horizon Electronics",        "Indiranagar 12th Main",                     12.9764, 77.6400, 4.2, "medium"),
    ("TechMart Banglaore",         "Koramangala 5th Block",                     12.9366, 77.6233, 4.1, "medium"),
    ("City Electronics",           "Marathahalli Bridge, Outer Ring Rd",        12.9560, 77.7011, 4.0, "medium"),
    ("National Electronics",       "RT Nagar Main Rd",                          13.0225, 77.5966, 4.1, "medium"),
    ("Modern Electronics",         "Basaveshwara Nagar, 3rd Stage",             12.9950, 77.5400, 4.0, "medium"),
    ("Star Electronics",           "Banashankari 2nd Stage",                    12.9330, 77.5536, 4.2, "medium"),
    ("Sapna Electronics",          "Sadashivanagar, Palace Rd",                 12.9994, 77.5854, 4.3, "medium"),
    ("Varsha Mobiles & Electronics","KR Market Area, Chickpet",                 12.9676, 77.5756, 3.8, "medium"),
    ("Kumar Electronics",          "Vijayanagar 4th Stage",                     12.9726, 77.5202, 4.0, "medium"),
    ("Sharma Electronics",         "Yeshwanthpur Industrial Area",              13.0221, 77.5416, 3.9, "medium"),
    ("Priya Electronics",          "Electronic City Phase 1",                   12.8458, 77.6681, 4.1, "medium"),
    ("Galaxy Electronics",         "Sarjapur Road, Agara",                      12.9071, 77.6474, 4.2, "medium"),
    ("Pixel Electronics",          "Whitefield Main Rd, Ramagondanahalli",      12.9657, 77.7512, 4.0, "medium"),
    ("Digital Den",                "Marathahalli, Bengaluru",                   12.9564, 77.7010, 4.1, "medium"),
    ("Sunrise Electronics",        "HSR Layout, 5th Sector",                    12.9071, 77.6400, 4.3, "medium"),
    ("Anand Mobiles",              "Bannerghatta Road, JP Nagar",               12.9001, 77.5985, 4.0, "medium"),
    ("New Royal Electronics",      "Shivajinagar Bus Stand Area",               12.9820, 77.6060, 3.9, "medium"),
    ("Premier Electronics",        "Majestic, Gubbi Cross",                     12.9774, 77.5684, 4.0, "medium"),
    ("Swathi Electronics",         "Banashankari Temple Rd",                    12.9272, 77.5487, 4.1, "medium"),
    ("Krishna Mobile World",       "Malleshwaram 8th Cross",                    13.0021, 77.5662, 4.2, "medium"),
    ("Balaji Tech Store",          "Indiranagar CMH Road",                      12.9780, 77.6405, 4.1, "medium"),
    ("Orbit Electronics",          "MG Road, Brigade Rd Junction",              12.9754, 77.6077, 4.3, "medium"),
    ("Maruthi Electronics",        "Rajajinagar 3rd Block",                     12.9928, 77.5494, 4.0, "medium"),
    ("Satyam Computers",           "Ulsoor Road, near Richmond Circle",         12.9699, 77.6175, 4.1, "medium"),
    ("Infotronics",                "Koramangala 8th Block",                     12.9236, 77.6325, 4.2, "medium"),
    ("Future Electronics",         "Domlur Layout, Old Airport Rd",             12.9638, 77.6387, 4.0, "medium"),
    ("Spectrum Electronics",       "Frazer Town, Mosque Rd",                    12.9885, 77.6169, 4.1, "medium"),
    ("Mega Electronics",           "Kengeri Main Rd",                           12.9074, 77.4848, 3.9, "medium"),
    ("Ashoka Electronics",         "Tumkur Road, Yeshwanthpur",                 13.0213, 77.5420, 4.0, "medium"),
    ("Diamond Electronics",        "Kathriguppe, BSK 3rd Stage",                12.9250, 77.5509, 4.1, "medium"),
    ("Metro Electronics",          "Bannerghatta Rd, Arekere",                  12.8880, 77.5989, 3.9, "medium"),
    ("Vega Electronics",           "Peenya Industrial Area",                    13.0324, 77.5101, 3.8, "medium"),
    ("Deccan Electronics",         "Malleswaram West, 15th Cross",              13.0050, 77.5610, 4.0, "medium"),
    ("South Star Mobiles",         "JP Nagar 7th Phase",                        12.8960, 77.5920, 4.1, "medium"),
    ("PowerZone Bangalore",        "Doddanekkundi, Marathahalli",               12.9674, 77.7042, 4.2, "medium"),
    ("Alpha Electronics",          "Bellary Road, Hebbal",                      13.0354, 77.5960, 4.0, "medium"),
    ("Digi World",                 "Sarjapur Road, Bellandur",                  12.9265, 77.6718, 4.1, "medium"),
    ("Smart Choice Electronics",   "Uttarahalli Main Road",                     12.8975, 77.5476, 3.9, "medium"),
    ("TechFirst Bangalore",        "Whitefield Hope Farm Junction",             12.9877, 77.7497, 4.2, "medium"),
    ("Shree Electronics",          "Mysore Road, Kengeri",                      12.9054, 77.4849, 3.9, "medium"),
    ("Raj Computers & Mobiles",    "Vijayanagar Main Rd, 3rd Stage",            12.9731, 77.5215, 4.0, "medium"),
    ("Crystal Electronics",        "HSR Layout, 27th Main",                     12.9104, 77.6348, 4.2, "medium"),

    # ── SMALL LOCAL SHOPS ────────────────────────────────────────────
    ("Raja Mobile Repairs",        "Koramangala BDA Complex",                   12.9328, 77.6267, 3.9, "small"),
    ("Quick Fix Mobiles",          "Indiranagar 100 Ft Road, near LIC",         12.9765, 77.6392, 3.8, "small"),
    ("Venkat Mobile Works",        "Shivajinagar near bus stop",                12.9811, 77.6077, 3.7, "small"),
    ("Murugan Accessories",        "Frazer Town, Richmond Rd",                  12.9878, 77.6171, 3.8, "small"),
    ("Ali Mobile Point",           "Mosque Road, Frazer Town",                  12.9882, 77.6168, 3.9, "small"),
    ("Hameed Mobiles",             "Russell Market, Shivajinagar",              12.9829, 77.6087, 3.8, "small"),
    ("Siva Tech Repair",           "BTM Layout 2nd Stage",                      12.9124, 77.6139, 3.7, "small"),
    ("Mohan Mobiles",             "Vijayanagar 2nd Stage",                      12.9723, 77.5223, 3.9, "small"),
    ("Ganesha Mobile Shop",        "Jayanagar Shopping Complex",                12.9256, 77.5819, 3.8, "small"),
    ("Suresh Electronics Corner",  "Gandhi Bazaar Main, Basavanagudi",          12.9428, 77.5748, 3.9, "small"),
    ("Prince Mobile Zone",         "Banashankari 1st Stage",                    12.9378, 77.5519, 3.8, "small"),
    ("Ravi Accessories Store",     "Yelahanka Old Town",                        13.1006, 77.5963, 3.7, "small"),
    ("Naveen Mobiles",             "Kolar Road, Bommanahalli",                  12.8995, 77.6475, 3.8, "small"),
    ("Chandra Electronics",        "Uttarahalli, near bus depot",               12.8977, 77.5480, 3.7, "small"),
    ("Satish Mobile Care",         "Majestic Area, Gubbi Cross",                12.9772, 77.5680, 3.8, "small"),
    ("Pavan Tech Hub",             "Rajajinagar 5th Block",                     12.9910, 77.5508, 3.9, "small"),
    ("Gopal Electronics",          "RT Nagar 4th Cross",                        13.0222, 77.5969, 3.8, "small"),
    ("Hari Mobile Solutions",      "Banashankari 3rd Stage",                    12.9259, 77.5490, 3.7, "small"),
    ("Sai Telecom",                "Whitefield Road, Brookefield",              12.9672, 77.7413, 3.9, "small"),
    ("Lakshman Mobiles",           "HSR Sector 2, 24th Cross",                  12.9094, 77.6357, 3.8, "small"),
    ("Senthil Mobile Corner",      "Electronic City Phase 2",                   12.8407, 77.6640, 3.7, "small"),
    ("Tech Spot Bangalore",        "Kudlu Gate, Hosur Road",                    12.8889, 77.6509, 3.8, "small"),
    ("Rajan Mobiles",              "Hennur Main Road",                           13.0468, 77.6235, 3.9, "small"),
    ("Bala Electronics",           "Bommasandra Industrial Area",               12.8107, 77.6872, 3.8, "small"),
    ("Sri Sai Mobiles",            "Nagawara Junction",                         13.0495, 77.6247, 3.7, "small"),
    ("Kiran Mobile Store",         "Domlur 2nd Stage",                          12.9641, 77.6391, 3.9, "small"),
    ("Deepak Electronics",         "Kammanahalli Main Road",                    13.0163, 77.6396, 3.8, "small"),
    ("Vijay Accessories",          "Sarjapur Junction",                         12.9069, 77.6863, 3.7, "small"),
    ("Ramesh Mobile Point",        "Hebbal Kempapura",                          13.0357, 77.5955, 3.8, "small"),
    ("Shankar Electronics",        "Peenya 2nd Stage",                          13.0318, 77.5110, 3.7, "small"),
    ("Mobile Care Center",         "Silk Board Junction",                       12.9175, 77.6225, 3.9, "small"),
    ("Digital Dreams",             "Outer Ring Road, Marathahalli",             12.9563, 77.7011, 3.8, "small"),
    ("Param Mobile Works",         "Yeshwanthpur Circle",                       13.0225, 77.5418, 3.7, "small"),
    ("Excel Electronics",          "Bannerghatta Road, Gottigere",              12.8627, 77.5925, 3.8, "small"),
    ("Navneet Mobiles",            "Vijayanagar 4th Stage Main Rd",             12.9728, 77.5198, 3.9, "small"),
    ("Santhosh Electronics",       "Kumaraswamy Layout",                        12.9023, 77.5559, 3.7, "small"),
    ("Tech Care Point",            "Ulsoor Bridge, near Ulsoor Lake",           12.9723, 77.6174, 3.8, "small"),
    ("New Bharat Electronics",     "Old Madras Road, KR Puram",                 13.0003, 77.6885, 3.7, "small"),
    ("Jain Mobiles",               "Commercial St, Seshadripuram",              12.9821, 77.6078, 3.8, "small"),
    ("Nandini Electronics",        "Malleshwaram 18th Cross",                   13.0040, 77.5646, 3.9, "small"),
    ("Srinivasa Mobiles",          "Tavarekere, BTM Layout",                    12.9086, 77.6011, 3.7, "small"),
    ("Kartik Mobile Hub",          "Marathahalli Colony",                        12.9581, 77.7014, 3.8, "small"),
    ("Pradeep Electronics",        "Vimanapura, Old Airport Rd",                12.9607, 77.6612, 3.9, "small"),
    ("Speed Tech Mobiles",         "Langford Town, Richmond Rd",                12.9611, 77.5987, 3.8, "small"),
    ("Royal Mobile Repair",        "Avenue Road, Chickpet",                     12.9720, 77.5738, 3.7, "small"),
    ("Sri Ram Electronics",        "Rajajinagar 1st Block",                     12.9929, 77.5484, 3.8, "small"),
    ("Teja Mobile Center",         "Padmanabhanagar, BSK",                      12.9226, 77.5519, 3.7, "small"),
    ("Arjun Accessories",          "Whitefield Kadugodi",                       12.9900, 77.7598, 3.8, "small"),
    ("Magnum Electronics",         "Doddakallasandra, Uttarahalli",             12.8960, 77.5458, 3.7, "small"),
    ("Tejas Mobile Repair",        "Horamavu Main Road",                        13.0412, 77.6528, 3.8, "small"),
    ("Raj Mobile Accessories",     "Nagarbhavi 2nd Stage",                      12.9594, 77.5118, 3.7, "small"),
    ("Sri Vinayaka Electronics",   "Kathriguppe Main Road",                     12.9244, 77.5497, 3.8, "small"),
    ("Mahesh Mobile Store",        "Visvesvaraya Layout, KR Puram",             12.9960, 77.6869, 3.7, "small"),
    ("Dinesh Electronics",         "Anjanapura Township",                       12.8682, 77.5428, 3.8, "small"),
    ("Sunil Mobile Zone",          "Konanakunte Cross",                         12.8875, 77.5513, 3.7, "small"),
    ("Priya Mobiles",              "JP Nagar 4th Phase",                        12.9074, 77.5816, 3.8, "small"),
    ("Elite Electronics",          "Kadubeesanahalli, ORR",                     12.9349, 77.6951, 3.9, "small"),
    ("Smart Gadgets Store",        "Doddanekundi Industrial Area",              12.9659, 77.7056, 3.8, "small"),
    ("Bright Electronics",         "Ramamurthy Nagar Main Rd",                  13.0291, 77.6632, 3.7, "small"),
    ("Orange Mobiles",             "Hennur Cross, Kalyan Nagar",                13.0484, 77.6328, 3.8, "small"),
    ("Sagar Electronics",          "Mysore Road, Kengeri Satellite Town",       12.9055, 77.4848, 3.7, "small"),
    ("Ananya Electronics",         "Jakkasandra, Koramangala",                  12.9297, 77.6231, 3.9, "small"),
    ("Power Point Electronics",    "Domlur Ring Road",                          12.9631, 77.6398, 3.8, "small"),
    ("Budget Mobiles",             "Shanthinagar Bus Stand",                    12.9628, 77.5985, 3.7, "small"),
    ("Supreme Electronics",        "Banaswadi Main Road",                       13.0221, 77.6500, 3.8, "small"),
    ("Telecom Plaza",              "Majestic Opp. Bus Stand",                   12.9778, 77.5690, 3.7, "small"),
    ("Connect Mobiles",            "Kondapur Main Road, Hyderabad Layout",      12.9312, 77.7215, 3.8, "small"),
    ("Sundar Electronics",         "Nagavara, Thanisandra Rd",                  13.0536, 77.6238, 3.7, "small"),
    ("Bharat Mobile Care",         "Tumkur Road, Jalahalli Cross",              13.0482, 77.5178, 3.8, "small"),
    ("Digital Wave",               "Bellandur Gate, ORR",                       12.9266, 77.6726, 3.9, "small"),
    ("Sri Durga Electronics",      "Attiguppe, Vijayanagar",                    12.9650, 77.5254, 3.7, "small"),
    ("Chandana Electronics",       "Bannerghatta Rd, Gottigere",                12.8622, 77.5918, 3.8, "small"),
    ("Balaji Mobile Point",        "Bommanahalli, Hosur Road",                  12.8990, 77.6446, 3.7, "small"),
    ("Sunshine Telecom",           "Thanisandra Main Road",                     13.0542, 77.6239, 3.8, "small"),
    ("Tech Galaxy",                "Hennur Bagalur Road",                       13.0647, 77.6306, 3.7, "small"),
    ("Mobile Express",             "Kalyan Nagar 4th Cross",                    13.0496, 77.6342, 3.8, "small"),
    ("Spark Electronics",          "Kasturi Nagar, CV Raman Nagar",             13.0105, 77.6636, 3.9, "small"),
    ("Vision Electronics",         "NGEF Layout, Kasturi Nagar",                13.0098, 77.6628, 3.8, "small"),
    ("United Mobiles",             "Old Bangalore Road, Electronic City",       12.8422, 77.6633, 3.7, "small"),
    ("Sunrise Accessories",        "Harlur Road, Sarjapur",                     12.9071, 77.6757, 3.8, "small"),
    ("Core Electronics",           "Whitefield EPIP Zone",                      12.9803, 77.7416, 3.9, "small"),
    ("Navya Mobile Store",         "Subramanyapura, Kanakpura Rd",              12.8975, 77.5416, 3.7, "small"),
    ("Kumar Telecom",              "Kadugodi Tree Park, Whitefield",            12.9879, 77.7601, 3.8, "small"),
    ("Amith Electronics",          "Rajanukunte, Yelahanka",                    13.1267, 77.5929, 3.7, "small"),
    ("Chaitanya Mobiles",          "Hesaraghatta Main Road, Jalahalli",         13.0486, 77.5175, 3.8, "small"),
    ("Harish Electronics",         "Magadi Road, Vijayanagar",                  12.9648, 77.5259, 3.7, "small"),
    ("Srinivasa Mobile Works",     "Devarachikkanahalli, Bangalore",            12.8971, 77.5955, 3.8, "small"),
    ("Ranjit Mobile Corner",       "Kanakapura Road, JP Nagar",                 12.9001, 77.5841, 3.7, "small"),
    ("Sri Lakshmi Mobiles",        "Uttarahalli Cross",                         12.8972, 77.5474, 3.8, "small"),
    ("Arun Electronics",           "Babusapalya, Kalyananagar",                 13.0479, 77.6363, 3.7, "small"),
    ("Mobile Hub",                 "Hulimavu, Bannerghatta Rd",                 12.8731, 77.5956, 3.8, "small"),
    ("Genuine Accessories",        "Hullahalli, Electronic City",               12.8387, 77.6676, 3.7, "small"),
    ("Shiva Mobiles",              "Vidyaranyapura Main Road",                  13.0682, 77.5467, 3.8, "small"),
    ("Akash Electronics",          "Kogilu Main Road, Yelahanka",               13.0965, 77.5944, 3.7, "small"),
    ("Friends Mobile",             "Garudachar Palya, Mahadevapura",            12.9870, 77.7135, 3.8, "small"),
    ("Charan Electronics",         "Brookefield Main Rd",                       12.9648, 77.7420, 3.9, "small"),
    ("Om Electronics",             "Channasandra, Whitefield",                  12.9913, 77.7452, 3.7, "small"),
    ("New Look Electronics",       "Kadugodi Post, Whitefield",                 12.9878, 77.7603, 3.8, "small"),
    ("Dhanush Mobiles",            "Parappana Agrahara, Electronic City",       12.8399, 77.6690, 3.7, "small"),
    ("Sri Krishna Electronics",    "Dasarahalli Main Road",                     13.0567, 77.5108, 3.8, "small"),
    ("Lokesh Mobile Store",        "Cholurpalya, Magadi Road",                  12.9625, 77.5102, 3.7, "small"),
    ("Nataraj Electronics",        "Malleshwaram 8th Cross",                    13.0019, 77.5660, 3.8, "small"),
    ("Gokul Mobile Center",        "Bidadi, Bangalore Rural",                   12.7987, 77.3942, 3.7, "small"),
    ("Praveen Mobiles",            "Hesaraghatta Cross, BEL Road",              13.0672, 77.5460, 3.8, "small"),
    ("Lucky Electronics",          "Kaggadasapura, CV Raman Nagar",             12.9990, 77.6611, 3.7, "small"),
    ("Sri Venkateswara Mobiles",   "Vidyaranyapura, Bangalore North",           13.0683, 77.5462, 3.8, "small"),
    ("TechPower Store",            "Mahadevapura, ORR",                         12.9877, 77.7135, 3.9, "small"),
    ("Pari Electronics",           "Jigani, Anekal",                            12.7801, 77.6473, 3.7, "small"),
    ("Vasanth Electronics",        "Nelamangala Town",                          13.0974, 77.3911, 3.8, "small"),
    ("Durga Mobile Zone",          "Rajarajeshwari Nagar",                      12.9283, 77.4989, 3.7, "small"),
    ("Sanjay Electronics",         "Kambipura, Mysore Rd",                      12.9163, 77.4725, 3.8, "small"),
    ("Prime Electronics",          "Electronic City Phase 1, Hosur Rd",         12.8450, 77.6680, 3.9, "small"),
    ("Bharath Mobile Hub",         "Kurubarahalli, Vijayanagar",                12.9598, 77.5127, 3.7, "small"),
    ("New Telecom Plza",           "Lingarajapura, Old Madras Rd",              13.0005, 77.6873, 3.8, "small"),
    ("Wireless World",             "Sanjaynagar, BEL Road",                     13.0232, 77.5792, 3.9, "small"),
    ("Cool Gadgets",               "HSR Layout, Agara Village",                 12.9073, 77.6472, 3.8, "small"),
    ("Mobile Junction",            "Marathahalli, near Old Post Office",        12.9568, 77.7016, 3.7, "small"),
    ("Sunaina Electronics",        "Jayanagar 9th Block",                       12.9215, 77.5900, 3.8, "small"),
    ("Swaraj Mobiles",             "Vijayanagar 1st Stage",                     12.9726, 77.5235, 3.7, "small"),
    ("Annapoorna Electronics",     "Rajajinagar 2nd Block",                     12.9926, 77.5489, 3.8, "small"),
    ("Nitesh Mobile Works",        "Kuvempu Nagar, Mysore Rd",                  12.9200, 77.4820, 3.7, "small"),
    ("Sharan Electronics",         "Ramaiah Nagar, MS Ramaiah Rd",              13.0287, 77.5613, 3.8, "small"),
    ("Uday Mobiles",               "Konanakunte Cross, Kanakapura Rd",          12.8871, 77.5510, 3.7, "small"),
    ("Suvarna Electronics",        "Chamrajpet, KG Road",                       12.9623, 77.5700, 3.8, "small"),
    ("Sri Murugan Electronics",    "Avenue Road, Chickpet",                     12.9721, 77.5741, 3.7, "small"),
    ("Swathi Mobile Store",        "Whitefield Junction",                       12.9700, 77.7505, 3.8, "small"),
    ("J.K. Electronics",           "Bannerghatta Road, near JP Nagar Police",   12.9081, 77.5970, 3.9, "small"),
    ("Deepa Electronics",          "Sahakar Nagar, Outer Ring Road",            13.0461, 77.5868, 3.8, "small"),
    ("Manu Mobile Point",          "Basaveshwara Nagar, WOC Road",              12.9951, 77.5407, 3.7, "small"),
    ("Rajiv Accessories",          "Mahadevapura Post, Whitefield Rd",          12.9865, 77.7111, 3.8, "small"),
    ("Yash Electronics",           "Jalahalli Village",                         13.0482, 77.5182, 3.7, "small"),
    ("Sunrise Tech",               "Varthur Main Road, Whitefield",             12.9493, 77.7399, 3.8, "small"),
    ("City Gadgets",               "Commercial Street, Tasker Town",            12.9819, 77.6083, 3.9, "small"),
    ("Mobile Clinic",              "Hosur Main Road, Madiwala",                 12.9185, 77.6215, 3.8, "small"),
    ("Techno Shop",                "Jakkur Main Road, Yelahanka",               13.0761, 77.5946, 3.7, "small"),
    ("Tanveer Mobiles",            "Mosque Road, Cox Town",                     12.9884, 77.6168, 3.8, "small"),
    ("Quick Mobile Repair",        "Nayandahalli, Mysore Rd",                   12.9455, 77.5158, 3.7, "small"),
    ("Gadget Galaxy",              "Arekere, Bannerghatta Rd",                  12.8880, 77.5990, 3.8, "small"),
    ("Sri Ganesh Mobile",          "Devanahalli Town",                          13.2490, 77.7125, 3.7, "small"),
    ("Giri Electronics",           "Doddaballapur Road, Yelahanka",             13.1000, 77.5948, 3.8, "small"),
    ("Cyber Electronics",          "KR Puram Industrial Area",                  13.0003, 77.6880, 3.7, "small"),
    ("Akshay Mobile Point",        "Sarjapur Road, Carmelaram",                 12.9218, 77.7015, 3.8, "small"),
    ("Devi Electronics",           "Padmanabhanagar Main Rd",                   12.9229, 77.5530, 3.7, "small"),
    ("Anand Electronics",          "Mysore Road, Kengeri Cross",                12.9056, 77.4853, 3.8, "small"),
    ("Sunder Telecom",             "Bommanhalli, AECS Layout",                  12.9002, 77.6463, 3.7, "small"),
    ("Express Mobiles",            "Nagarbhavi Circle",                         12.9593, 77.5120, 3.8, "small"),
    ("Lakshmi Mobile Center",      "Cottonpet Cross, Chickpet",                 12.9714, 77.5698, 3.7, "small"),
    ("Shiva Tech Corner",          "Rajanukunte Cross, Doddaballapur Rd",       13.1270, 77.5931, 3.8, "small"),
    ("Max Electronics",            "Bhattarahalli, KR Puram",                   13.0043, 77.7003, 3.7, "small"),
    ("Techno World",               "Begur Main Road, Bannerghatta",             12.8761, 77.6048, 3.8, "small"),
]

# ─────────────────────────────────────────────────────────────
# PRODUCTS CATALOG — realistic electronics with prices
# (product, category, base_price, online_price, keywords)
# ─────────────────────────────────────────────────────────────
products_catalog = [
    # ── CHARGERS ──────────────────────────────────────────────────────
    ("Anker 20W USB-C Fast Charger",          "fast charger",      899,  1099),
    ("Boat 33W Fast Charger",                 "fast charger",      649,   799),
    ("Realme 65W VOOC Charger",               "fast charger",      999,  1299),
    ("OnePlus 80W Warp Charger",              "fast charger",     1499,  1799),
    ("Samsung 25W Super Fast Charger",        "fast charger",     1299,  1599),
    ("Belkin 30W USB-C Charger",              "fast charger",     1599,  1999),
    ("OPPO 67W SuperVOOC Charger",            "fast charger",     1099,  1399),
    ("Xiaomi 67W Turbo Charger",              "fast charger",      899,  1099),
    ("Vivo 44W FlashCharge Charger",          "fast charger",      799,   999),
    ("Apple 20W USB-C Power Adapter",         "fast charger",     1899,  2199),
    ("Portronics 65W GaN Charger",            "fast charger",     1199,  1499),
    ("Syska 20W Fast Charger",               "fast charger",      549,   699),
    ("Mi 33W Charger",                        "fast charger",      649,   799),
    ("iQOO 120W FlashCharge Adapter",         "fast charger",     1999,  2499),
    ("Nothing 45W GaN Charger",               "fast charger",     1399,  1699),
    ("Mivi Cube 65W 4-Port Charger",          "fast charger",     1299,  1599),
    ("HP 65W USB-C Laptop Charger",           "laptop charger",   1899,  2299),
    ("Dell 65W USB-C Charger",                "laptop charger",   2299,  2799),
    ("Lenovo 65W GaN Charger",                "laptop charger",   2199,  2699),
    ("Apple 61W MagSafe Charger",             "laptop charger",   4499,  5499),
    ("Asus 65W USB-C Charger",                "laptop charger",   1899,  2299),
    ("Boat 30W Laptop Charger Universal",     "laptop charger",   1099,  1399),

    # ── POWER BANKS ───────────────────────────────────────────────────
    ("Mi 20000mAh Power Bank 3i",             "power bank",       1299,  1599),
    ("Anker PowerCore 26800mAh",              "power bank",       3999,  4999),
    ("Boat Energyshroom Power Bank 10000mAh", "power bank",        999,  1299),
    ("Realme Power Bank 2 10000mAh",          "power bank",        899,  1099),
    ("Samsung 10000mAh Power Bank",           "power bank",       1499,  1899),
    ("Ambrane 20000mAh Power Bank",           "power bank",       1099,  1399),
    ("OnePlus Power Bank 10000mAh",           "power bank",       1299,  1599),
    ("pTron Dynamo 20000mAh PD",              "power bank",        799,   999),
    ("Belkin 10000mAh USB-C Power Bank",      "power bank",       2499,  2999),
    ("Syska 20000mAh Power Bank",             "power bank",        999,  1299),
    ("Portronics Luxcell 20000mAh",           "power bank",        899,  1099),
    ("Vivan 10000mAh Ultra Slim Bank",        "power bank",        699,   899),

    # ── CABLES ────────────────────────────────────────────────────────
    ("Anker USB-C to C 100W Cable 1.8m",      "cable",             899,  1099),
    ("Boat Rugged v3 USB-C Cable",            "cable",             349,   499),
    ("Baseus 100W Charging Cable",            "cable",             699,   899),
    ("Apple MFi USB-C to Lightning Cable",    "cable",            1999,  2499),
    ("Samsung USB-C Cable 25W 1.8m",          "cable",             599,   799),
    ("Realme USB-C to USB-A 2m Cable",        "cable",             249,   349),
    ("Ugreen USB-C 240W Cable",               "cable",            1299,  1599),
    ("pTron Solero Braided USB-C Cable",      "cable",             199,   299),
    ("Mivi 3.1A Micro USB Cable 1.2m",        "cable",             199,   299),
    ("Syska USB-C to USB-C 65W Cable",        "cable",             449,   599),

    # ── EARPHONES / WIRED ─────────────────────────────────────────────
    ("boAt BassHeads 225 Wired Earphones",    "earphones",         349,   499),
    ("JBL C100SI Wired Earphones",            "earphones",         499,   699),
    ("Sony MDR-EX155AP Wired Earphones",      "earphones",         699,   899),
    ("Sennheiser CX 80S Wired Earphones",     "earphones",        1299,  1699),
    ("Realme Buds 2 Neo Wired Earphones",     "earphones",         399,   549),
    ("Mi Dual Driver Earphones",              "earphones",         449,   649),
    ("OnePlus Bullets Z2 (Wired)",            "earphones",         699,   899),
    ("boAt Bassheads 900 Pro Earphones",      "earphones",         499,   699),
    ("PTron Boom Ultima Earphones",           "earphones",         299,   449),

    # ── TWS EARBUDS ───────────────────────────────────────────────────
    ("boAt Airdopes 141 TWS Earbuds",         "tws earbuds",       999,  1499),
    ("JBL Tune 230NC TWS",                   "tws earbuds",       3999,  4999),
    ("Sony WF-C700N Earbuds",                "tws earbuds",       7999,  9999),
    ("Samsung Galaxy Buds2 Pro",             "tws earbuds",      12999, 15999),
    ("Apple AirPods (3rd Gen)",              "tws earbuds",      19999, 22999),
    ("Realme Buds T100 TWS",                 "tws earbuds",       1499,  1999),
    ("Noise Buds VS104 Max",                 "tws earbuds",       1299,  1799),
    ("OnePlus Nord Buds 2r",                 "tws earbuds",       2499,  2999),
    ("Nothing Ear (a)",                      "tws earbuds",       7999,  9999),
    ("Boat Airdopes 121 Pro",                "tws earbuds",        899,  1199),
    ("Oppo Enco Buds2",                      "tws earbuds",       1999,  2499),
    ("Mi True Wireless Earbuds Basic 2S",    "tws earbuds",       1299,  1699),
    ("pTron Zenbuds Evo TWS",                "tws earbuds",        799,  1099),
    ("Skullcandy Indy EVO TWS",              "tws earbuds",       5999,  7499),
    ("Jabra Elite 4 Active",                 "tws earbuds",       6999,  8999),

    # ── OVER-EAR HEADPHONES ───────────────────────────────────────────
    ("Sony WH-1000XM5 Headphones",           "headphones",       29999, 34999),
    ("bose QuietComfort 45",                 "headphones",       29999, 35999),
    ("boAt Rockerz 550 Pro",                 "headphones",       1999,  2999),
    ("JBL TUNE 770NC",                       "headphones",       7999,  9999),
    ("Sennheiser HD 450BT",                  "headphones",       9999, 12999),
    ("Noise One Wireless Headphone",         "headphones",       1499,  1999),
    ("realme Buds Air 5 Pro (headphone)",    "headphones",       4999,  6499),
    ("Mi Super Bass Wireless Headphones",    "headphones",       1299,  1699),
    ("Sony WH-CH720N Headphones",            "headphones",      11999, 14999),
    ("OneOdio Monitor 60",                   "headphones",       3299,  3999),

    # ── BLUETOOTH SPEAKERS ───────────────────────────────────────────
    ("boAt Stone 352 Bluetooth Speaker",     "bluetooth speaker", 1499,  1999),
    ("JBL Go 3 Portable Speaker",            "bluetooth speaker", 3999,  4999),
    ("Sony SRS-XB100 Speaker",               "bluetooth speaker", 4499,  5499),
    ("bose SoundLink Flex",                  "bluetooth speaker",11999, 13999),
    ("Noise Boom 100 Speaker",               "bluetooth speaker", 1299,  1799),
    ("Zebronics Zeb-County Speaker",         "bluetooth speaker",  799,  1099),
    ("Amazon Echo Dot (5th Gen)",            "bluetooth speaker", 4999,  5999),
    ("JBL Flip 6 Speaker",                   "bluetooth speaker", 9999, 11999),
    ("OnePlus Soundbar Y1 Pro",              "bluetooth speaker", 4499,  5499),
    ("BoAt Aavante Bar 3000DA Soundbar",     "bluetooth speaker", 7999, 10999),
    ("Mivi Roam2 Speaker",                   "bluetooth speaker",  799,   999),
    ("Realme Pocket Bluetooth Speaker",      "bluetooth speaker", 1299,  1599),

    # ── MOBILE ACCESSORIES ───────────────────────────────────────────
    ("Tempered Glass Screen Protector",      "mobile accessory",  199,   349),
    ("Spigen Slim Armor iPhone Case",        "mobile accessory",  999,  1499),
    ("Otterbox Commuter Samsung Case",       "mobile accessory", 2499,  3499),
    ("Pop Socket PopGrip",                   "mobile accessory",  499,   699),
    ("Samsung Wireless Charging Pad 15W",    "mobile accessory", 2499,  2999),
    ("Belkin MagSafe Wireless Charger",      "mobile accessory", 3999,  4999),
    ("Mi Wireless Charging Stand",           "mobile accessory", 1299,  1599),
    ("boAt Rugged Case Universal",           "mobile accessory",  349,   499),
    ("Spigen Liquid Air Google Pixel 8 Case","mobile accessory",  799,  1099),
    ("UrbanX Magnetic Phone Mount Car",      "mobile accessory",  699,   999),
    ("Anker Wireless Charger 15W Pad",       "mobile accessory", 1899,  2299),
    ("Oraimo 3-in-1 Wireless Charger",       "mobile accessory", 1499,  1899),

    # ── LAPTOP ACCESSORIES ────────────────────────────────────────────
    ("Logitech MX Keys Wireless Keyboard",   "laptop accessory", 7999, 10499),
    ("Dell KM7120W Wireless KB+Mouse Combo", "laptop accessory", 4999,  5999),
    ("HP 330 Wireless Mouse and Keyboard",   "laptop accessory", 3499,  3999),
    ("Logitech MX Master 3S Mouse",          "laptop accessory", 7999,  9999),
    ("Portronics Toad 23 Wireless Mouse",    "laptop accessory",  699,   999),
    ("Lapcare Laptop Cooling Pad",           "laptop accessory",  999,  1499),
    ("Ugreen USB-C 7-in-1 Hub",              "laptop accessory", 2999,  3999),
    ("Anker USB-C Hub 10-in-1",              "laptop accessory", 5999,  7499),
    ("Sandisk SSD Portable 1TB",             "laptop accessory", 7999, 9499),
    ("WD My Passport 2TB External HDD",      "laptop accessory", 5499,  6999),
    ("Seagate Backup Plus 1TB Slim",         "laptop accessory", 3999,  4999),
    ("Kingston 8GB DDR4 RAM 3200MHz",        "laptop accessory", 1999,  2499),
    ("Corsair 16GB DDR4 RAM",                "laptop accessory", 3499,  4499),
    ("Sandisk 128GB Pen Drive",              "laptop accessory",  899,  1299),

    # ── SMARTWATCHES ──────────────────────────────────────────────────
    ("boAt Xtend Pro Smartwatch",            "smartwatch",       2499,  3499),
    ("Noise ColorFit Pro 4 Max",             "smartwatch",       2999,  3999),
    ("Samsung Galaxy Watch 6",              "smartwatch",       24999, 29999),
    ("Apple Watch Series 9 (41mm)",         "smartwatch",       41999, 44999),
    ("Amazfit GTR 4 Smartwatch",            "smartwatch",       13999, 16999),
    ("Garmin Forerunner 255",               "smartwatch",       29999, 35999),
    ("OnePlus Watch 2",                     "smartwatch",       14999, 17999),
    ("realme Watch 3 Pro",                  "smartwatch",       3999,  4999),
    ("Titan Smart Pro Smartwatch",          "smartwatch",       3499,  4499),
    ("Fire-Boltt Ninja Call Pro Plus",      "smartwatch",       1299,  1799),

    # ── SMARTPHONES ───────────────────────────────────────────────────
    ("Samsung Galaxy M34 5G (6GB+128GB)",   "smartphone",      16999, 18999),
    ("Redmi Note 13 Pro 5G (8GB+256GB)",    "smartphone",      24999, 27999),
    ("realme narzo 70 Pro 5G",              "smartphone",      17999, 19999),
    ("OnePlus Nord CE3 Lite 5G",            "smartphone",      18999, 20999),
    ("iQOO Z9 5G (6GB+128GB)",             "smartphone",      17999, 20999),
    ("Motorola Moto G84 5G",               "smartphone",      18999, 21999),
    ("POCO X6 5G (8GB+256GB)",             "smartphone",      22999, 25999),
    ("Vivo V30e 5G",                       "smartphone",      24999, 27999),
    ("Samsung Galaxy A55 5G",              "smartphone",      34999, 38999),
    ("Google Pixel 8a",                    "smartphone",      52999, 57999),
    ("Nothing Phone (2a)",                 "smartphone",      25999, 29999),
    ("Apple iPhone 15 (128GB)",            "smartphone",      69900, 79900),
    ("Samsung Galaxy S24 (8GB+128GB)",     "smartphone",      79999, 89999),

    # ── TABLETS ───────────────────────────────────────────────────────
    ("Samsung Galaxy Tab A9+ (8GB+128GB)", "tablet",          29999, 34999),
    ("Realme Pad 2 (6GB+128GB)",          "tablet",           18999, 22999),
    ("Apple iPad (10th Gen 64GB WiFi)",    "tablet",           44900, 49900),
    ("Lenovo Tab M11 (4GB+128GB)",         "tablet",          15999, 19999),
    ("Samsung Galaxy Tab S9 FE",          "tablet",           44999, 49999),

    # ── ROUTERS / NETWORKING ──────────────────────────────────────────
    ("TP-Link Archer AX23 WiFi 6 Router",  "router",           4999,  6499),
    ("D-Link DIR-2150 AC2100 Router",      "router",           4499,  5499),
    ("Tenda AC11 AC1200 Router",           "router",           1999,  2599),
    ("TP-Link TL-WR940N 450Mbps Router",   "router",           1299,  1699),
    ("Netgear Nighthawk AX5400 Router",    "router",          14999, 17999),
    ("Xiaomi Mi Router 4A Gigabit",        "router",           2499,  2999),
    ("TP-Link RE500 AC1900 Extender",      "router",           2999,  3999),

    # ── LED BULBS / SMART HOME ───────────────────────────────────────
    ("Philips Hue Smart Bulb White",       "smart home",       1599,  1999),
    ("Amazon Echo (4th Gen)",              "smart home",       7999,  9999),
    ("Google Nest Mini",                   "smart home",       4499,  5499),
    ("Mi Smart Plug WiFi",                 "smart home",        699,   999),
    ("TP-Link Tapo C200 WiFi Camera",      "smart home",       2999,  3799),
    ("Wipro WiFi Smart LED 9W",            "smart home",        399,   599),
    ("Syska Smart Strip 4 USB",            "smart home",       1499,  1999),

    # ── CAMERAS ───────────────────────────────────────────────────────
    ("Canon EOS 1500D DSLR Kit",          "camera",           44999, 49999),
    ("Nikon D3500 DSLR Kit",              "camera",           49999, 54999),
    ("GoPro HERO12 Black",                "camera",           39999, 44999),
    ("DJI Osmo Action 4",                 "camera",           34999, 39999),
    ("Sony ZV-1F Vlog Camera",            "camera",           34999, 39999),
    ("Instax Mini 12 Instant Camera",     "camera",           7499,  8999),
    ("Canon PowerShot V10",               "camera",           34999, 39999),

    # ── PRINTERS ──────────────────────────────────────────────────────
    ("HP DeskJet 2331 All-in-One",        "printer",          4499,  5499),
    ("Epson L3250 Ink Tank Printer",      "printer",          13999, 15999),
    ("Canon PIXMA G2010 Printer",         "printer",          12499, 14499),
    ("HP LaserJet MFP M141w",            "printer",          13999, 15999),
    ("Brother DCP-T426W Ink Tank",        "printer",          14999, 17499),

    # ── TV & DISPLAY ──────────────────────────────────────────────────
    ("Mi 32 TV 4A Horizon Edition",       "television",       14999, 17999),
    ("Sony Bravia 43 X75K 4K TV",         "television",       47490, 52990),
    ("Samsung 55 Crystal 4K UHD TV",      "television",       56990, 62990),
    ("LG 43 UT80 4K UHD TV",             "television",       39990, 44990),
    ("TCL 50 P615 4K TV",                 "television",       29990, 34990),
    ("OnePlus 43 Y1S Pro 4K TV",          "television",       26999, 30999),
    ("Xiaomi Smart TV 5A Pro 32",         "television",       17499, 19999),

    # ── GAMING ────────────────────────────────────────────────────────
    ("Xbox Wireless Controller",          "gaming",            5590,  6499),
    ("PS5 DualSense Controller",          "gaming",            6990,  7499),
    ("Logitech G502 X Gaming Mouse",      "gaming",            9999, 12999),
    ("Razer Deathadder V3 Mouse",         "gaming",           10999, 13499),
    ("Seagate 2TB PS4 Game Drive",        "gaming",            6999,  7999),
    ("Boat Immortal 1000D Gaming Headset","gaming",            1499,  1999),
    ("HyperX Cloud Stinger 2 Headset",    "gaming",            5999,  7499),
    ("Zebronics Zeb-Transformer-K Gaming KB","gaming",          799,  1199),

    # ── MEMORY / STORAGE ──────────────────────────────────────────────
    ("SanDisk 64GB microSD Card A2",      "storage",           699,   999),
    ("Samsung 256GB microSD EVO Plus",    "storage",           2499,  2999),
    ("Toshiba 1TB External HDD",          "storage",           3999,  4999),
    ("Sandisk 256GB Pen Drive",           "storage",           1499,  1999),
    ("Kingston 512GB SSD UV500",          "storage",           4499,  5499),
    ("WD 4TB My Book HDD",               "storage",          10999, 12999),

    # ── MONITORS ──────────────────────────────────────────────────────
    ("LG 24MK430H 24 IPS Monitor",        "monitor",          11999, 13999),
    ("Dell E2422H 24 Full HD Monitor",    "monitor",          13499, 15999),
    ("BenQ GW2480 24 IPS Monitor",        "monitor",          12999, 14999),
    ("Acer Nitro VG240Y 24 Gaming",       "monitor",          14999, 17999),
    ("Samsung 27 Curved FHD Monitor",     "monitor",          16999, 19999),
    ("LG 27QN600-B QHD IPS Monitor",      "monitor",          24999, 28999),

    # ── UPS / INVERTERS ───────────────────────────────────────────────
    ("APC 600VA Back-UPS",                "ups",               3499,  4499),
    ("Microtek UPS EB900 12V",            "ups",               3999,  4999),
    ("Luminous Zelio 1100 Inverter",      "ups",               7999,  9499),
    ("Su-Kam Sheen 1000VA UPS",           "ups",               4999,  5999),
    ("APC Smart-UPS 1000VA",              "ups",              12999, 15999),
]

# ─────────────────────────────────────────────────────────────
# STOCK LEVEL HELPER
# ─────────────────────────────────────────────────────────────
def rand_stock(shop_type):
    if shop_type == "chain":
        return random.randint(5, 60)
    elif shop_type == "medium":
        return random.randint(2, 30)
    else:
        return random.randint(0, 15)

# ─────────────────────────────────────────────────────────────
# BUILD INVENTORY ROWS
# ─────────────────────────────────────────────────────────────
rows = []

# Every shop carries a randomized subset of products
# Big chain: 40-60 products, medium: 20-35, small: 5-18

for shop_name, address, lat, lng, rating, stype in shops:
    if stype == "chain":
        count = random.randint(40, 60)
    elif stype == "medium":
        count = random.randint(20, 35)
    else:
        count = random.randint(5, 18)

    selected = random.sample(products_catalog, min(count, len(products_catalog)))
    for product, category, base_price, online_price in selected:
        # Small shops: slight markup; big shops: slight discount vs online
        if stype == "chain":
            price = int(base_price * random.uniform(0.88, 0.98))
        elif stype == "medium":
            price = int(base_price * random.uniform(0.93, 1.02))
        else:
            price = int(base_price * random.uniform(0.97, 1.08))

        # Add rating variation
        shop_rating = round(min(5.0, max(3.0, rating + random.uniform(-0.2, 0.2))), 1)

        stock = rand_stock(stype)

        rows.append((
            shop_name,
            product,
            category,
            price,
            online_price,
            stock,
            round(random.uniform(0.3, 8.5), 1),   # distance placeholder (overridden by GPS)
            shop_rating,
            address,
            lat,
            lng,
        ))

print(f"Generated {len(rows)} inventory rows across {len(shops)} shops...")

# ─────────────────────────────────────────────────────────────
# INSERT
# ─────────────────────────────────────────────────────────────
cur.executemany("""
    INSERT INTO inventory
    (shop, product, category, price, online_price, stock, distance, rating, address, latitude, longitude)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
""", rows)

conn.commit()
cur.close()
conn.close()

print(f"✅ Done! {len(rows)} products inserted across {len(shops)} shops.")
print(f"   Chain stores:  {sum(1 for s in shops if s[5]=='chain')}")
print(f"   Medium stores: {sum(1 for s in shops if s[5]=='medium')}")
print(f"   Small stores:  {sum(1 for s in shops if s[5]=='small')}")
