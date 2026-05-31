import asyncio
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response
from fastapi.responses import JSONResponse
import aiomysql
from fastapi.middleware.cors import CORSMiddleware
import decimal
from datetime import datetime, timezone, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Static noise for stable trend charts
STATIC_NOISE_1 = [1.2, -0.8, 2.1, -1.5, 0.4, 1.7, -2.2, 0.9, -1.1, 1.8, -0.3, 0.6]
STATIC_NOISE_2 = [-1.5, 1.2, -0.3, 2.0, -1.1, 0.8, -2.1, 1.4, -0.6, 1.9, -1.8, 0.5]
STATIC_NOISE_3 = [0.5, -1.2, 0.8, -0.5, 1.2, -1.8, 0.3, -0.9, 1.5, -0.2, 0.7, -1.1]

async def generate_spectral_signature(status: str):
    # Healthy Coral
    # dip ที่ 680nm
    # NIR stable
    # Bleaching
    # 680nm สูงขึ้น
    # ทุก wavelength สูงขึ้นตาม severity
    # Sedimentation
    # NIR ลดลงหนัก
    # 760–860 ลดตาม severity
    # Oil Contamination
    # NIR irregular
    # random anomaly peaks
    # Chemical Stress
    # chlorophyll dip หายบางส่วน
    # NIR unstable

    # Base Healthy values (from multispectral sensor.csv)
    base = {
        "610nm": 2.58,
        "680nm": 23.03,
        "730nm": 310.40,
        "760nm": 180.50,
        "810nm": 9.12,
        "860nm": 3.64
    }
    
    severity = 1
    if "ระดับ 1" in status: severity = 1
    elif "ระดับ 2" in status: severity = 2
    elif "ระดับ 3" in status: severity = 3
    elif "ระดับ 4" in status: severity = 4
    
    data = base.copy()
    
    if "ฟอกขาว" in status:
        for k in data:
            data[k] = data[k] * (1 + 0.3 * severity)
        data["680nm"] = data["680nm"] * (1 + 0.5 * severity)
    elif "ตะกอน" in status:
        data["730nm"] = data["730nm"] * (1 - 0.2 * severity)
        data["760nm"] = data["760nm"] * (1 - 0.2 * severity)
        data["810nm"] = data["810nm"] * (1 - 0.2 * severity)
        data["860nm"] = data["860nm"] * (1 - 0.2 * severity)
    elif "น้ำมัน" in status:
        data["730nm"] = data["730nm"] * random.uniform(0.5, 1.5)
        data["760nm"] = data["760nm"] * random.uniform(0.5, 1.5)
        data["810nm"] = data["810nm"] * random.uniform(0.5, 1.5)
        data["860nm"] = data["860nm"] * random.uniform(0.5, 1.5)
        data["610nm"] = data["610nm"] * random.uniform(1.0, 3.0)
        data["680nm"] = data["680nm"] * random.uniform(0.8, 1.2)
    elif "เคมี" in status or "สารเคมี" in status:
        data["680nm"] = data["680nm"] * (1 + 0.4 * severity)
        data["730nm"] = data["730nm"] * random.uniform(0.8, 1.2)
        data["760nm"] = data["760nm"] * random.uniform(0.8, 1.2)
        data["810nm"] = data["810nm"] * random.uniform(0.8, 1.2)
        data["860nm"] = data["860nm"] * random.uniform(0.8, 1.2)
        
    return [
        {"band": "610nm", "value": round(data["610nm"], 2)},
        {"band": "680nm", "value": round(data["680nm"], 2)},
        {"band": "730nm", "value": round(data["730nm"], 2)},
        {"band": "760nm", "value": round(data["760nm"], 2)},
        {"band": "810nm", "value": round(data["810nm"], 2)},
        {"band": "860nm", "value": round(data["860nm"], 2)}
    ]

async def generate_spectral_history(status: str):
    history = []
    base_time = datetime.now() - timedelta(minutes=10 * 5)
    for i in range(11):
        data = await generate_spectral_signature(status)
        t = (base_time + timedelta(minutes=i*5)).strftime("%H:%M")
        point = {"time": t}
        for b in data:
            point[b["band"]] = round(b["value"] * random.uniform(0.95, 1.05), 2)
        history.append(point)
    return history

async def fetch_dashboard_data():
    drift = random.uniform(-0.5, 0.5)
    td = random.uniform(-0.2, 0.2)

    coords = [
        [9.4381266, 97.8720488], [9.4392473, 97.8752946], [9.4419688, 97.8939579], [9.4541355, 97.8954185],
        [9.4145922, 97.8509512], [9.4101093, 97.8389418], [9.3985815, 97.8509512], [9.3915366, 97.8584165],
        [9.383851, 97.8675047], [9.4328435, 97.8477054], [9.4161933, 97.8707505], [9.4227574, 97.8347223],
        [9.4227574, 97.8277438], [9.4301219, 97.8894138], [9.4501406, 97.8513754], [9.4564018, 97.8614574],
        [9.4603367, 97.8751714], [9.463259, 97.8907569], [9.447294, 97.9043817], [9.4300059, 97.9031841],
        [9.4404005, 97.8576258], [9.4015625, 97.8761105], [9.4083632, 97.8680845], [9.4234026, 97.8786032],
        [9.4746236, 97.8981978]
    ]

    nodes = []
    for idx, (lat, lng) in enumerate(coords, 1):
        formatted_id = f"{idx:02d}"
        nodes.append({
            "id": idx,
            "node_id": f"NODE-SRN-{formatted_id}",
            "name": f"หมู่เกาะสุรินทร์ จุดที่ {formatted_id}",
            "location": "Phang Nga",
            "lat": lat,
            "lng": lng,
            "status": "ปกติ (Healthy)",
            "health_score": round(82 + drift + random.uniform(0, 5), 1),
            "bleaching_probability": random.randint(5, 15),
            "stress_level": random.randint(10, 20),
            "predictions": {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)},
            "color_degradation_index": round(random.uniform(0.05, 0.12), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2),
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    # Ensure Node 1 reports as online for UI/testing convenience
    if nodes:
        try:
            nodes[0]["status"] = "ออนไลน์ (Online)"
            nodes[0]["last_sync"] = "1s ago"
            nodes[0]["battery"] = 100
            nodes[0]["signal"] = 100
        except Exception:
            pass

    similan_coords = [
        [8.6745656, 97.6457386], [8.6798034, 97.638731], [8.6836895, 97.6486442], [8.6750725, 97.6547972],
        [8.6666243, 97.6518916], [8.652431, 97.6534299], [8.629957, 97.655139], [8.6324918, 97.6416366],
        [8.6495584, 97.6347999], [8.6654416, 97.6354836], [8.595512, 97.6387253], [8.5926779, 97.6334021],
        [8.5876168, 97.6393395], [8.572838, 97.6381111], [8.5736478, 97.6458912], [8.5644614, 97.632439],
        [8.5695616, 97.6437658], [8.5740617, 97.6299107], [8.5753617, 97.6335514], [8.5620613, 97.6394171],
        [8.5048379, 97.6453388], [8.4842078, 97.6498425], [8.4785812, 97.639413], [8.5014387, 97.6346723],
        [8.4948747, 97.6405982]
    ]

    target_sedimentation_coords = [
        [8.6654416, 97.6354836],
        [8.6495584, 97.6347999],
        [8.6324918, 97.6416366]
    ]

    for idx, (lat, lng) in enumerate(similan_coords, 26):
        formatted_id = f"{idx-25:02d}"
        
        is_sedimentation = [lat, lng] in target_sedimentation_coords
        status = "ตะกอนทับถม ระดับ 1" if is_sedimentation else "ปกติ (Healthy)"
        
        if is_sedimentation:
            health_score = round(75 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(80, 95), "chemical": 1, "normal": random.randint(2, 10)}
            turbidity = round(5.0 + abs(drift)*0.8 + random.uniform(0, 1.0), 2)
        else:
            health_score = round(82 + drift + random.uniform(0, 5), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-SML-{formatted_id}",
            "name": f"หมู่เกาะสิมิลัน จุดที่ {formatted_id}",
            "location": "Phang Nga",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15) if not is_sedimentation else random.randint(10, 25),
            "stress_level": random.randint(10, 20) if not is_sedimentation else random.randint(40, 60),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12) if not is_sedimentation else random.uniform(0.15, 0.3), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": turbidity,
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    racha_coords = [
        [7.5932323, 98.3477089], [7.6016027, 98.3484766], [7.6107339, 98.3515473], [7.6221475, 98.359608],
        [7.6210062, 98.3780324], [7.6061683, 98.3830224], [7.5924714, 98.3761132], [7.5829593, 98.3626787],
        [7.523219, 98.3407997], [7.5228384, 98.3162338], [7.5098999, 98.3093246], [7.4916331, 98.3054862],
        [7.4790743, 98.2981932], [7.4642315, 98.3146984], [7.4790743, 98.3239106], [7.4961999, 98.3292844],
        [7.5293606, 98.3297484], [7.6158682, 98.3693638], [7.5675312, 98.3502045], [7.5094754, 98.3444632],
        [7.4601809, 98.2940634], [7.6382519, 98.3738802], [7.5517487, 98.3354131], [7.5406396, 98.3461581]
    ]

    for idx, (lat, lng) in enumerate(racha_coords, 51):
        formatted_id = f"{idx-50:02d}"
        nodes.append({
            "id": idx,
            "node_id": f"NODE-RCH-{formatted_id}",
            "name": f"เกาะราชา จุดที่ {formatted_id}",
            "location": "Phuket",
            "lat": lat,
            "lng": lng,
            "status": "ปกติ (Healthy)",
            "health_score": round(82 + drift + random.uniform(0, 5), 1),
            "bleaching_probability": random.randint(5, 15),
            "stress_level": random.randint(10, 20),
            "predictions": {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)},
            "color_degradation_index": round(random.uniform(0.05, 0.12), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2),
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    lipe_coords = [
        [6.4835602, 99.2812589], [6.4867337, 99.2845695], [6.4891561, 99.289633], [6.4934418, 99.2967594],
        [6.5000566, 99.3035108], [6.4976343, 99.3113873], [6.4894356, 99.3132627], [6.4806778, 99.3124188],
        [6.4788144, 99.3073553], [6.4810504, 99.3035108], [6.4854294, 99.3003226], [6.4834728, 99.296103],
        [6.4809573, 99.2916022], [6.4789075, 99.2854134], [6.4893456, 99.3326081], [6.4865861, 99.332335],
        [6.4873099, 99.3357041]
    ]

    for idx, (lat, lng) in enumerate(lipe_coords, 75):
        formatted_id = f"{idx-74:02d}"
        nodes.append({
            "id": idx,
            "node_id": f"NODE-LIP-{formatted_id}",
            "name": f"เกาะหลีเป๊ะ จุดที่ {formatted_id}",
            "location": "Satun",
            "lat": lat,
            "lng": lng,
            "status": "ปกติ (Healthy)",
            "health_score": round(82 + drift + random.uniform(0, 5), 1),
            "bleaching_probability": random.randint(5, 15),
            "stress_level": random.randint(10, 20),
            "predictions": {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)},
            "color_degradation_index": round(random.uniform(0.05, 0.12), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2),
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    rok_coords = [
        [7.2020222, 99.0459272],
        [7.2069472, 99.0483317],
        [7.2131033, 99.0512016],
        [7.2179513, 99.0548472],
        [7.2243381, 99.0608197],
        [7.2306856, 99.0678434],
        [7.2317628, 99.077384],
        [7.2293005, 99.0816501],
        [7.2235293, 99.0849854],
        [7.2176041, 99.0790128],
        [7.2139105, 99.0703255],
        [7.2068476, 99.0690069],
        [7.1989214, 99.0656716],
        [7.1951506, 99.0594664],
        [7.196228, 99.0514772],
        [7.2144845, 99.0648071]
    ]

    # These 6 coordinates represent the ones listed by the user as having sediment level 1-2
    rok_sediment_1 = [
        [7.2179513, 99.0548472],
        [7.2069472, 99.0483317],
        [7.196228, 99.0514772]
    ]
    rok_sediment_2 = [
        [7.2131033, 99.0512016],
        [7.2020222, 99.0459272],
        [7.1951506, 99.0594664]
    ]

    for idx, (lat, lng) in enumerate(rok_coords, 92):
        formatted_id = f"{idx-91:02d}"
        
        is_sed_1 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in rok_sediment_1)
        is_sed_2 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in rok_sediment_2)
        
        if is_sed_1:
            status = "ตะกอนทับถม ระดับ 1"
            health_score = round(78 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(50, 70), "chemical": 1, "normal": random.randint(25, 45)}
            turbidity = round(3.5 + abs(drift)*0.5 + random.uniform(0, 0.5), 2)
        elif is_sed_2:
            status = "ตะกอนทับถม ระดับ 2"
            health_score = round(68 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(70, 90), "chemical": 1, "normal": random.randint(5, 20)}
            turbidity = round(5.5 + abs(drift)*0.8 + random.uniform(0, 1.0), 2)
        else:
            status = "ปกติ (Healthy)"
            health_score = round(82 + drift + random.uniform(0, 5), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-ROK-{formatted_id}",
            "name": f"เกาะรอก จุดที่ {formatted_id}",
            "location": "Krabi",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15) if not (is_sed_1 or is_sed_2) else random.randint(10, 25),
            "stress_level": random.randint(10, 20) if not (is_sed_1 or is_sed_2) else (random.randint(30, 45) if is_sed_1 else random.randint(50, 70)),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12) if not (is_sed_1 or is_sed_2) else (random.uniform(0.12, 0.2) if is_sed_1 else random.uniform(0.2, 0.35)), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": turbidity,
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    kradan_coords = [
        [7.3336607, 99.2509647],
        [7.3267252, 99.2527425],
        [7.3212003, 99.2547573],
        [7.3166157, 99.2565351],
        [7.3087395, 99.2599721],
        [7.3019213, 99.2568906],
        [7.308622, 99.249661],
        [7.3166157, 99.2480017],
        [7.3255497, 99.2462239],
        [7.3334998, 99.2449902]
    ]

    for idx, (lat, lng) in enumerate(kradan_coords, 108):
        formatted_id = f"{idx-107:02d}"
        status = "ปกติ (Healthy)"
        health_score = round(82 + drift + random.uniform(0, 5), 1)
        predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
        turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-KRD-{formatted_id}",
            "name": f"เกาะกระดาน จุดที่ {formatted_id}",
            "location": "Trang",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15),
            "stress_level": random.randint(10, 20),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": turbidity,
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    tao_coords = [
        [10.1218655, 99.8033033],
        [10.1106145, 99.8124206],
        [10.0960777, 99.8195017],
        [10.0965834, 99.8085867],
        [10.1057037, 99.8159061],
        [10.0827238, 99.8092287],
        [10.0666669, 99.8110265],
        [10.0615158, 99.8189318],
        [10.0541152, 99.8309971],
        [10.0595683, 99.8438537],
        [10.0712532, 99.8414802],
        [10.0770955, 99.8529522],
        [10.0864691, 99.8571759],
        [10.0969847, 99.856187],
        [10.1116591, 99.8550002],
        [10.1248998, 99.8470885],
        [10.1298384, 99.8324731],
        [10.1323696, 99.817243],
        [10.1234403, 99.8155466],
        [10.1292764, 99.8093411]
    ]

    # Geographically clustered 5 coordinates (representing 25% of the 20 nodes)
    # 3 of them are Bleaching Level 1, 2 of them are Bleaching Level 2
    tao_bleaching_1 = [
        [10.1218655, 99.8033033],
        [10.1292764, 99.8093411],
        [10.1323696, 99.817243]
    ]
    tao_bleaching_2 = [
        [10.1234403, 99.8155466],
        [10.1106145, 99.8124206]
    ]

    for idx, (lat, lng) in enumerate(tao_coords, 118):
        formatted_id = f"{idx-117:02d}"
        
        is_bl_1 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in tao_bleaching_1)
        is_bl_2 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in tao_bleaching_2)
        
        if is_bl_1:
            status = "ฟอกขาว ระดับ 1"
            health_score = round(78 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(50, 70), "sedimentation": random.randint(2, 5), "chemical": 1, "normal": random.randint(25, 45)}
            temperature = round(29.8 + td + random.uniform(-0.3, 0.3), 1)
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)
        elif is_bl_2:
            status = "ฟอกขาว ระดับ 2"
            health_score = round(68 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(70, 90), "sedimentation": random.randint(2, 5), "chemical": 1, "normal": random.randint(5, 20)}
            temperature = round(30.6 + td + random.uniform(-0.3, 0.3), 1)
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)
        else:
            status = "ปกติ (Healthy)"
            health_score = round(82 + drift + random.uniform(0, 5), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
            temperature = round(28.2 + td + random.uniform(-0.5, 0.5), 1)
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-TAO-{formatted_id}",
            "name": f"เกาะเต่า จุดที่ {formatted_id}",
            "location": "Surat Thani",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15) if not (is_bl_1 or is_bl_2) else (random.randint(50, 70) if is_bl_1 else random.randint(70, 90)),
            "stress_level": random.randint(10, 20) if not (is_bl_1 or is_bl_2) else (random.randint(30, 50) if is_bl_1 else random.randint(50, 75)),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12) if not (is_bl_1 or is_bl_2) else (random.uniform(0.12, 0.22) if is_bl_1 else random.uniform(0.22, 0.38)), 2),
            "temperature": temperature,
            "turbidity": turbidity,
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    ran_coords = [
        [10.777584, 99.532122],
        [10.777710, 99.532310],
        [10.777450, 99.531850],
        [10.777820, 99.532050],
        [10.777310, 99.532420],
        [10.777583756145797, 99.53212151054798],
        [10.79781885694102, 99.54051114543346],
        [10.7972171706683, 99.54028216192145],
        [10.796671715716169, 99.54043100120425],
        [10.796019417772193, 99.54142135489364],
        [10.79691351545631, 99.54174193181045],
        [10.79790882861654, 99.54143852865704],
        [10.798617354640275, 99.54098056164145]
    ]

    # Exactly 15% of 13 is ~2 nodes. Let's make 2 nodes sediment level 1-2.
    ran_sediment_1 = [
        [10.777710, 99.532310]
    ]
    ran_sediment_2 = [
        [10.777584, 99.532122]
    ]

    for idx, (lat, lng) in enumerate(ran_coords, 138):
        formatted_id = f"{idx-137:02d}"
        
        is_sed_1 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in ran_sediment_1)
        is_sed_2 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in ran_sediment_2)
        
        if is_sed_1:
            status = "ตะกอนทับถม ระดับ 1"
            health_score = round(78 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(50, 70), "chemical": 1, "normal": random.randint(25, 45)}
            turbidity = round(3.5 + abs(drift)*0.5 + random.uniform(0, 0.5), 2)
        elif is_sed_2:
            status = "ตะกอนทับถม ระดับ 2"
            health_score = round(68 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(70, 90), "chemical": 1, "normal": random.randint(5, 20)}
            turbidity = round(5.5 + abs(drift)*0.8 + random.uniform(0, 1.0), 2)
        else:
            status = "ปกติ (Healthy)"
            health_score = round(82 + drift + random.uniform(0, 5), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
            turbidity = round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-RAN-{formatted_id}",
            "name": f"เกาะร้านเป็ดร้านไก่ จุดที่ {formatted_id}",
            "location": "Chumphon",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15) if not (is_sed_1 or is_sed_2) else random.randint(10, 25),
            "stress_level": random.randint(10, 20) if not (is_sed_1 or is_sed_2) else (random.randint(30, 45) if is_sed_1 else random.randint(50, 70)),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12) if not (is_sed_1 or is_sed_2) else (random.uniform(0.12, 0.2) if is_sed_1 else random.uniform(0.2, 0.35)), 2),
            "temperature": round(28.2 + td + random.uniform(-0.5, 0.5), 1),
            "turbidity": turbidity,
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })

    kham_coords = [
        [12.5721902, 100.9302021],
        [12.5742674, 100.9287078],
        [12.5785203, 100.9325285],
        [12.5670264, 100.9332295],
        [12.5696262, 100.9378559],
        [12.5746206, 100.9381363],
        [12.5884756, 100.9246051],
        [12.5810677, 100.9250665],
        [12.55829, 100.941969],
        [12.5870665, 100.9409125],
        [12.5908141, 100.9511953],
        [12.5503411, 100.9501797],
        [12.5487727, 100.9603511],
        [12.5551344, 100.9670933],
        [12.5250783, 100.9499613],
        [12.5153361, 100.948694],
        [12.5065215, 100.9539214],
        [12.5133258, 100.963584],
        [12.5267792, 100.9605743],
        [12.5193388, 100.9760887],
        [12.5270706, 100.970703],
        [12.5628283, 100.9729254],
        [12.5482944, 100.9745094],
        [12.5784436, 100.9678564],
        [12.5849368, 100.9778359]
    ]

    # 20% of 25 nodes = 5 nodes are Bleached Level 1 or 2 (3 Level 1, 2 Level 2)
    # 16% (approx 15%) = 4 nodes are Bleached Level 3
    kham_bleaching_1 = [
        [12.5721902, 100.9302021],
        [12.5742674, 100.9287078],
        [12.5785203, 100.9325285]
    ]
    kham_bleaching_2 = [
        [12.5670264, 100.9332295],
        [12.5696262, 100.9378559]
    ]
    kham_bleaching_3 = [
        [12.5884756, 100.9246051],
        [12.5810677, 100.9250665],
        [12.5746206, 100.9381363],
        [12.5870665, 100.9409125]
    ]

    for idx, (lat, lng) in enumerate(kham_coords, 151):
        formatted_id = f"{idx-150:02d}"
        
        is_bl_1 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in kham_bleaching_1)
        is_bl_2 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in kham_bleaching_2)
        is_bl_3 = any(abs(lat - c[0]) < 0.0001 and abs(lng - c[1]) < 0.0001 for c in kham_bleaching_3)
        
        if is_bl_1:
            status = "ฟอกขาว ระดับ 1"
            health_score = round(78 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(50, 70), "sedimentation": random.randint(2, 5), "chemical": 1, "normal": random.randint(25, 45)}
            temperature = round(29.8 + td + random.uniform(-0.3, 0.3), 1)
        elif is_bl_2:
            status = "ฟอกขาว ระดับ 2"
            health_score = round(68 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(70, 90), "sedimentation": random.randint(2, 5), "chemical": 1, "normal": random.randint(5, 20)}
            temperature = round(30.6 + td + random.uniform(-0.3, 0.3), 1)
        elif is_bl_3:
            status = "ฟอกขาว ระดับ 3"
            health_score = round(52 + drift + random.uniform(-2, 2), 1)
            predictions = {"bleaching": random.randint(90, 98), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(1, 5)}
            temperature = round(31.4 + td + random.uniform(-0.3, 0.3), 1)
        else:
            status = "ปกติ (Healthy)"
            health_score = round(82 + drift + random.uniform(0, 5), 1)
            predictions = {"bleaching": random.randint(2, 5), "sedimentation": random.randint(1, 3), "chemical": 1, "normal": random.randint(90, 95)}
            temperature = round(28.2 + td + random.uniform(-0.5, 0.5), 1)

        nodes.append({
            "id": idx,
            "node_id": f"NODE-KHM-{formatted_id}",
            "name": f"เกาะขามแสมสาร จุดที่ {formatted_id}",
            "location": "Chonburi",
            "lat": lat,
            "lng": lng,
            "status": status,
            "health_score": health_score,
            "bleaching_probability": random.randint(5, 15) if not (is_bl_1 or is_bl_2 or is_bl_3) else (random.randint(50, 70) if is_bl_1 else (random.randint(70, 90) if is_bl_2 else random.randint(90, 98))),
            "stress_level": random.randint(10, 20) if not (is_bl_1 or is_bl_2 or is_bl_3) else (random.randint(30, 50) if is_bl_1 else (random.randint(50, 75) if is_bl_2 else random.randint(75, 95))),
            "predictions": predictions,
            "color_degradation_index": round(random.uniform(0.05, 0.12) if not (is_bl_1 or is_bl_2 or is_bl_3) else (random.uniform(0.12, 0.22) if is_bl_1 else (random.uniform(0.22, 0.35) if is_bl_2 else random.uniform(0.35, 0.55))), 2),
            "temperature": temperature,
            "turbidity": round(2.1 + abs(drift)*0.3 + random.uniform(0, 0.5), 2),
            "salinity": round(34.2 + random.uniform(-0.2, 0.2), 1),
            "ph": round(8.1 + random.uniform(-0.1, 0.1), 1),
            "dissolved_oxygen": round(6.8 + random.uniform(-0.2, 0.2), 1),
            "battery": 98 - (idx % 15),
            "signal": 95 - (idx % 10),
            "last_sync": f"{random.randint(1, 10)}s ago",
            "depth": round(random.uniform(5.0, 15.0), 1)
        })






    for node in nodes:
        node["spectral_raw"] = await generate_spectral_signature(node["status"])
        node["spectral_history"] = await generate_spectral_history(node["status"])

    base_date = datetime.now() - timedelta(days=12)
    time_labels = [(base_date + timedelta(days=i)).strftime("%d %b") for i in range(12)]
    
    coral_health_trend = [
        {"time":time_labels[i],"health":round(78-i*0.8+STATIC_NOISE_1[i],1)}
        for i in range(12)
    ]
    threat_trend = [
        {
            "time": time_labels[i],
            "sedimentation": round(10 + i*1.2 + STATIC_NOISE_2[i], 1),
            "chemical": round(5 + i*0.4 + STATIC_NOISE_3[i], 1),
            "bleaching": round(15 + i*0.5 + STATIC_NOISE_1[i]*0.5, 1),
            "hypoxia": round(8 + i*0.3 + STATIC_NOISE_2[i]*0.5, 1),
            "oil": round(2 + STATIC_NOISE_3[i]*0.3, 1)
        }
        for i in range(12)
    ]
    temperature_vs_health = [
        {"time":time_labels[i],"temperature":round(28.5+i*0.18+STATIC_NOISE_3[i]*0.2,1),"health":round(80-i*1.8+STATIC_NOISE_1[i],1)}
        for i in range(12)
    ]
    turbidity_trend = [
        {"time":time_labels[i],"turbidity":round(2.5+i*0.35+STATIC_NOISE_2[i]*0.2,2),"threshold":5.0}
        for i in range(12)
    ]
    spectral_signature = [
        {"band":"450nm","name":"Blue","reflectance":round(0.32+random.uniform(-0.02,0.02),3),"color":"#3b82f6"},
        {"band":"520nm","name":"Green","reflectance":round(0.48+random.uniform(-0.02,0.02),3),"color":"#10b981"},
        {"band":"620nm","name":"Orange","reflectance":round(0.21+random.uniform(-0.02,0.02),3),"color":"#f97316"},
        {"band":"680nm","name":"Red","reflectance":round(0.15+random.uniform(-0.01,0.01),3),"color":"#f43f5e"},
        {"band":"750nm","name":"Red Edge","reflectance":round(0.58+random.uniform(-0.02,0.02),3),"color":"#a855f7"},
        {"band":"NIR","name":"Near IR","reflectance":round(0.74+random.uniform(-0.03,0.03),3),"color":"#0ea5e9"},
    ]
    env_stress_radar = [
        {"axis":"Temperature","value":78},{"axis":"Turbidity","value":62},
        {"axis":"Salinity","value":35},{"axis":"pH","value":45},{"axis":"Dissolved O₂","value":58},
    ]
    status_distribution = [
        {"name":"ปกติ","value":sum(1 for n in nodes if "ปกติ" in n["status"]),"color":"#10b981"},
        {"name":"ฟอกขาว","value":sum(1 for n in nodes if "ฟอกขาว" in n["status"]),"color":"#f59e0b"},
        {"name":"ปนเปื้อนน้ำมัน","value":sum(1 for n in nodes if "น้ำมัน" in n["status"]),"color":"#f43f5e"},
        {"name":"สารเคมี A","value":sum(1 for n in nodes if "เคมี" in n["status"] or "สารเคมี" in n["status"]),"color":"#a855f7"},
        {"name":"ตะกอนทับถม","value":sum(1 for n in nodes if "ตะกอน" in n["status"]),"color":"#f97316"},
    ]
    alerts = [
        {"id":1,"severity":"critical","message":"ปนเปื้อนน้ำมัน ระดับ 4","location":"หมู่เกาะพีพี","time":"5m ago"},
        {"id":2,"severity":"critical","message":"ฟอกขาว ระดับ 2","location":"หมู่เกาะสิมิลัน","time":"12m ago"},
        {"id":3,"severity":"warning","message":"ตะกอนทับถม ระดับ 1","location":"เกาะเต่า","time":"23m ago"},
        {"id":4,"severity":"critical","message":"ปนเปื้อนสารเคมี A ระดับ 3","location":"เกาะช้าง","time":"1h ago"},
        {"id":5,"severity":"caution","message":"ฟอกขาว ระดับ 1","location":"เกาะสมุย","time":"2h ago"},
    ]
    # Calculate global threat dynamically based on nodes status
    has_bleaching_3 = any("ฟอกขาว ระดับ 3" in n["status"] for n in nodes)
    has_bleaching_1_2 = any(any(lvl in n["status"] for lvl in ["ฟอกขาว ระดับ 1", "ฟอกขาว ระดับ 2"]) for n in nodes)
    has_sediment = any("ตะกอน" in n["status"] for n in nodes)
    
    if has_bleaching_3:
        current_threat = "Severe Thermal Bleaching"
        confidence = 92
        stress_trend = "Thermal stress critical and expanding"
        bleaching_probability = 95
        forecast = "Extreme thermal stress expected to remain critical for the next 72 hours. Water quality and oxygen levels likely to drop."
        escalation_risk = "CRITICAL"
        recovery_potential = "LOW"
        recommended_action = "Deploy thermal shading if feasible, restrict local diving activities, and execute immediate physical reef surveys."
    elif has_bleaching_1_2:
        current_threat = "Thermal Bleaching"
        confidence = 87
        stress_trend = "Thermal stress increasing"
        bleaching_probability = 82
        forecast = "Thermal stress expected to remain elevated for the next 72 hours. High probability of severity escalation in shallow waters."
        escalation_risk = "HIGH"
        recovery_potential = "LOW"
        recommended_action = "Increase monitoring frequency and conduct rapid field inspection."
    elif has_sediment:
        current_threat = "Sediment Accumulation"
        confidence = 85
        stress_trend = "Sediment accumulation rising"
        bleaching_probability = 35
        forecast = "High turbidity and suspended solids expected to persist. Risk of coral smothering in low-flow areas."
        escalation_risk = "HIGH"
        recovery_potential = "MEDIUM"
        recommended_action = "Deploy silt screens, control coastal runoff sources, and inspect reef siltation depth."
    else:
        current_threat = "None (Healthy)"
        confidence = 95
        stress_trend = "Stable environmental baseline"
        bleaching_probability = 8
        forecast = "No significant thermal or sedimentation threats predicted. Conditions expected to remain stable for the next 7 days."
        escalation_risk = "LOW"
        recovery_potential = "HIGH"
        recommended_action = "Continue routine satellite telemetry and automated sensor validation."

    ai_prediction = {
        "current_threat": current_threat,
        "confidence": confidence,
        "stress_trend": stress_trend,
        "bleaching_probability": bleaching_probability,
        "forecast": forecast,
        "escalation_risk": escalation_risk,
        "recovery_potential": recovery_potential,
        "recommended_action": recommended_action
    }
    # Force Node 1 to be the only online node; set others offline
    for i, n in enumerate(nodes):
        if i == 0:
            n["status"] = "ปกติ (Online)"
            n["last_sync"] = "1s ago"
            n["battery"] = 100
            n["signal"] = 100
        else:
            n["status"] = "ออฟไลน์ (Offline)"
            n["last_sync"] = "--"
            n["battery"] = 0
            n["signal"] = 0

    critical_count = sum(1 for n in nodes if any(lvl in n["status"] for lvl in ["ระดับ 2", "ระดับ 3", "ระดับ 4"]))
    warning_count = sum(1 for n in nodes if any(lvl in n["status"] for lvl in ["ระดับ 1", "ระดับ 2"]))
    normal_count = sum(1 for n in nodes if "ปกติ" in n["status"])
    total_nodes_count = len(nodes)
    active_count = sum(1 for n in nodes if "ออนไลน์" in n["status"] or "Online" in n["status"] or "ปกติ (Online)" in n["status"]) if total_nodes_count else 0
    avg_health_val = round(sum(n["health_score"] for n in nodes) / total_nodes_count, 1) if total_nodes_count else 61.8
    healthy_pct = f"{round((normal_count / total_nodes_count) * 100)}%" if total_nodes_count else "42%"

    kpi = [
        {"id":"healthy_reef","title":"Healthy Reef","value":healthy_pct,"sub":"of monitored zones","delta":"-3%","positive":False,"icon":"","color":"#10b981"},
        {"id":"critical_zones","title":"CRITICAL ZONES","value":str(critical_count),"sub":"AI predict impact LV2+","delta":f"{critical_count} nodes","positive":False,"icon":"","color":"#f43f5e"},
        {"id":"warning_zones","title":"WARNING ZONES","value":str(warning_count),"sub":"AI predict impact LV1-LV2","delta":f"{warning_count} nodes","positive":False,"icon":"","color":"#f97316"},
        {"id":"avg_health","title":"Avg Health Score","value":str(avg_health_val),"sub":"across all nodes","delta":"-4.2","positive":False,"icon":"","color":"#0ea5e9"},
        {"id":"active_nodes","title":"Active Nodes","value":f"{active_count}/{total_nodes_count}","sub":f"{active_count} node(s) online","delta":"—","positive":True,"icon":"","color":"#0ea5e9"},
        {"id":"avg_temp","title":"Avg Water Temp","value":"29.3°C","sub":"+1.1°C above baseline","delta":"↑ Anomaly","positive":False,"icon":"","color":"#f97316"},
    ]

    return {
        "dashboard": {
            "kpi": kpi,
            "mapData": nodes,
            "coralHealthTrend": coral_health_trend,
            "threatTrend": threat_trend,
            "temperatureVsHealth": temperature_vs_health,
            "turbidityTrend": turbidity_trend,
            "spectralSignature": spectral_signature,
            "envStressRadar": env_stress_radar,
            "statusDistribution": status_distribution,
            "alerts": alerts,
            "aiPrediction": ai_prediction,
                "systemStatus": {
                "active_nodes": active_count,
                "total_nodes": total_nodes_count,
                "last_update": datetime.now(timezone.utc).isoformat(),
                "ws_status": "live"
            }
        },
        "spectralData": [
            {"id":1,"r":0.45,"s":0.32,"t":0.88,"u":0.12,"v":0.54,"w":0.76,"label":1.0},
            {"id":2,"r":0.55,"s":0.42,"t":0.78,"u":0.22,"v":0.64,"w":0.86,"label":1.0},
            {"id":3,"r":0.35,"s":0.22,"t":0.98,"u":0.02,"v":0.44,"w":0.66,"label":0.0}
        ]
    }

async def poll_db_and_broadcast():
    while True:
        if manager.active_connections:
            data = await fetch_dashboard_data()
            if data:
                payload = json.dumps(data, cls=CustomEncoder)
                await manager.broadcast(payload)
        await asyncio.sleep(3)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_db_and_broadcast())

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content="", media_type="image/x-icon")

@app.get("/")
async def root():
    return {"message": "Coral Sensor WebSocket Server running. Connect to /ws"}

@app.get("/dashboard")
async def get_dashboard():
    data = await fetch_dashboard_data()
    payload = json.loads(json.dumps(data, cls=CustomEncoder))
    return JSONResponse(content=payload)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        data = await fetch_dashboard_data()
        if data:
            payload = json.dumps(data, cls=CustomEncoder)
            await websocket.send_text(payload)
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
