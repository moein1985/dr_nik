from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
import PyPDF2

pdf_path = Path('F:/کلینیک.pdf')
docx_path = Path('F:/کلینیک.docx')
print('PDF_EXISTS', pdf_path.exists(), 'SIZE', pdf_path.stat().st_size if pdf_path.exists() else None)
print('DOCX_EXISTS', docx_path.exists(), 'SIZE', docx_path.stat().st_size if docx_path.exists() else None)

try:
    reader = PyPDF2.PdfReader(str(pdf_path))
    text = '\n'.join((page.extract_text() or '') for page in reader.pages[:8])
    print('\n---PDF_TEXT_SAMPLE---')
    print(text[:12000])
except Exception as e:
    print('PDF_ERR', type(e).__name__, e)

try:
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with zipfile.ZipFile(docx_path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
        paras = []
        for p in root.findall('.//w:p', ns):
            txt = ''.join((t.text or '') for t in p.findall('.//w:t', ns))
            if txt.strip():
                paras.append(txt)
        print('\n---DOCX_TEXT_SAMPLE---')
        print('\n'.join(paras[:120]))
except Exception as e:
    print('DOCX_ERR', type(e).__name__, e)
