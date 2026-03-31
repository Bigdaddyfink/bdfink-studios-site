"""
Generate a PDF of the BDFink Studios Brand Guidelines from the HTML page.
Uses Playwright (headless Chromium) to render with full styling.
"""

import os
from pathlib import Path
from playwright.sync_api import sync_playwright

SCRIPT_DIR = Path(__file__).parent.resolve()
HTML_FILE = SCRIPT_DIR / "brand-guidelines.html"
OUTPUT_PDF = SCRIPT_DIR / "BDFink_Studios_Brand_Guidelines.pdf"


def generate_pdf():
    file_url = HTML_FILE.as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        print(f"Loading {file_url} ...")
        page.goto(file_url, wait_until="networkidle")

        # Wait for Google Fonts to load
        page.wait_for_timeout(2000)

        # Force all fade-in elements to be visible (they require scroll to trigger)
        page.evaluate("""
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
        """)

        # Give animations a moment to complete
        page.wait_for_timeout(500)

        print("Generating PDF...")
        page.pdf(
            path=str(OUTPUT_PDF),
            format="Letter",
            print_background=True,
            margin={
                "top": "0.4in",
                "bottom": "0.4in",
                "left": "0.4in",
                "right": "0.4in",
            },
        )

        browser.close()

    print(f"PDF saved: {OUTPUT_PDF}")


if __name__ == "__main__":
    generate_pdf()
