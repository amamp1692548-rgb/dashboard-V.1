import sys
from pypdf import PdfReader

try:
    reader = PdfReader(r"C:\Users\Acer\Documents\Coral dashboard\ค่าต้นแบบ.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print(text)
except Exception as e:
    print(f"Error: {e}")
