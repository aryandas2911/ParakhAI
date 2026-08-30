@echo off
cd /d "E:\My Study Resources\Programming and Hackathons\Projects\Hackathon Projects\LM-CE (SIH 2026 Hackathon)\backend"
call ".venv\Scripts\activate.bat"
echo Python: %~dp0.venv\Scripts\python.exe
python -c "import paddleocr; print('paddleocr OK')"
python -m uvicorn app.main:app --reload --port 8000
