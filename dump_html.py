import asyncio
from playwright.async_api import async_playwright
import urllib.request

async def get_ugroup():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://ugroupcu.com/", wait_until="domcontentloaded")
        content = await page.content()
        with open("ugroup_dump.html", "w", encoding="utf-8") as f:
            f.write(content)
        await browser.close()

def get_jsm():
    req = urllib.request.Request('https://jsmliving.com/search-available-units', headers={'User-Agent': 'Mozilla/5.0'})
    content = urllib.request.urlopen(req).read().decode('utf-8')
    with open("jsm_dump.html", "w", encoding="utf-8") as f:
        f.write(content)

async def main():
    get_jsm()
    await get_ugroup()

if __name__ == "__main__":
    asyncio.run(main())
