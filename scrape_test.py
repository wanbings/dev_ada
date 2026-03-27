import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        print("Visiting detail page...")
        await page.goto("https://www.greenstrealty.com/properties/profile/544-e-chalmers-st", wait_until="domcontentloaded")
        await asyncio.sleep(2)
        content = await page.content()
        soup = BeautifulSoup(content, 'html.parser')

        # Title / Address
        title_el = soup.find('h1') or soup.find(class_='property-title')
        print("Title:", title_el.text.strip() if title_el else "N/A")

        # In greenst realty, the sub units might be listed in a table or cards
        units_table = soup.find(class_='units-table') or soup.find('table') or soup.find(class_='floorplans') or soup.find(class_='availability-list')
        if units_table:
            print("Found units table/list!")
        
        # Or maybe it's just one unit per page? Let's print all text in the main body
        # Let's find "Rent", "Beds", "Baths" etc
        for th in soup.find_all(['th', 'td', 'div', 'span']):
            text = th.text.strip().lower()
            if any(k in text for k in ['bed', 'bath', 'sq', 'rent', 'price']):
                if th.name != 'div': # Ignore big layout divs
                    print(f"[{th.name}] {text}")

        with open("gsr_detail_test.html", "w", encoding="utf-8") as f:
            f.write(soup.prettify())
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
