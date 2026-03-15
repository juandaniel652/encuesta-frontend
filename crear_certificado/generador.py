from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor


def poner_nombre(
    nombre,
    pdf_entrada="encuesta-frontend/crear_certificado/diploma_base.pdf",
    pdf_salida="diploma_final.pdf",
    tamaño_fuente=33,
    posicion_vertical=0.63,
    posicion_horizontal=0.5,
    fuente="PlayFair"
):

    pdfmetrics.registerFont(
        TTFont(
            "PlayFair",
            "encuesta-frontend/utils/fuentes/Playfair_Display/static/PlayfairDisplay-SemiBold.ttf"
        )
    )

    reader = PdfReader(pdf_entrada)
    page = reader.pages[0]

    width = float(page.mediabox.width)
    height = float(page.mediabox.height)

    print("Tamaño PDF:", width, height)

    packet = BytesIO()
    c = canvas.Canvas(packet, pagesize=(width, height))

    # Fuente
    c.setFont(fuente, tamaño_fuente)

    # Color azul atardecer
    c.setFillColor(HexColor("#1C335F"))

    # Posición
    x = width * posicion_horizontal
    y = height * posicion_vertical

    # Dibujar nombre
    c.drawCentredString(x, y, nombre)

    c.showPage()
    c.save()

    packet.seek(0)

    overlay_reader = PdfReader(packet)
    overlay_page = overlay_reader.pages[0]

    page.merge_page(overlay_page)

    writer = PdfWriter()
    writer.add_page(page)

    with open(pdf_salida, "wb") as f:
        writer.write(f)


poner_nombre(
    "Rogelio Gomez",
    tamaño_fuente=33,
    posicion_vertical=0.72,
    posicion_horizontal=0.5
)