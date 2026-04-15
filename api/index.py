import os, json, requests, datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# PASTIKAN KODENYA SEPERTI INI, JANGAN MASUKKAN API KEY ASLI DI SINI
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
KUNCI_RAHASIA = os.environ.get("KUNCI_RAHASIA", "KODE_RAHASIA_ANDIIE_2026")

client_or = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)
client_openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

def cari_internet(query):
    if not TAVILY_API_KEY: return "Pencarian off."
    try:
        r = requests.post("https://api.tavily.com/search", json={"api_key": TAVILY_API_KEY, "query": query, "search_depth": "basic"})
        return "\n".join([f"- {res['title']}: {res['content']}" for res in r.json()['results']])
    except:
        return "Gagal mencari."

def manajer_rute(instruksi: str) -> str:
    prompt = f"Analisis: '{instruksi}'. Jika butuh internet balas SEARCH. Jika koding berat balas CLOUD."
    try:
        res = client_openai.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"system","content":prompt}], max_tokens=10)
        return "SEARCH_MODE" if "SEARCH" in res.choices[0].message.content.upper() else "anthropic/claude-sonnet-4.6"
    except:
        return "anthropic/claude-sonnet-4.6"

async def stream_cloud(instruksi, model_name):
    waktu = datetime.datetime.now().strftime("%A, %d %B %Y %H:%M:%S")
    system_prompt = f"Kamu adalah asisten AI Andiie. Waktu: {waktu}. Lokasi: Matsudo. Model: {model_name}."
    
    try:
        final_instruksi = instruksi
        if model_name == "SEARCH_MODE":
            model_name = "openai/gpt-5.3-codex"
            final_instruksi = f"Data Web: {cari_internet(instruksi)}\n\nInstruksi: {instruksi}"
            yield "RUTE_AKTIF:SEARCH_MODE\n\n"
        else:
            yield f"RUTE_AKTIF:{model_name}\n\n"

        response = client_or.chat.completions.create(
            model=model_name,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": final_instruksi}],
            stream=True
        )
        for chunk in response:
            teks = chunk.choices[0].delta.content
            if teks: yield teks
    except Exception as e:
        yield f"⚠️ Error Cloud: {str(e)}"

@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    data = await request.json()
    if data.get("kunci_rahasia") != KUNCI_RAHASIA: return {"error": "Akses Ditolak!"}
    
    instruksi = data.get("instruksi", "")
    paksa_model = data.get("paksa_model", "auto")
    
    model_akhir = paksa_model if paksa_model != "auto" else manajer_rute(instruksi)
    return StreamingResponse(stream_cloud(instruksi, model_akhir), media_type="text/event-stream")