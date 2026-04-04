import asyncio
import json
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://ugroupcu.com/property-details/303-e-chalmers-champaign", wait_until="networkidle")
        c = await page.content()
        detail_soup = BeautifulSoup(c, "html.parser")
        
        og_img = detail_soup.find("meta", property="og:image")
        image = og_img["content"] if og_img and og_img.get("content") else ""
        
        first_img = detail_soup.select_one(".property-slider img, .rsImg, img")
        first_img_src = first_img["src"] if first_img and first_img.has_attr("src") else ""
        
        other_imgs = [img.get("src") for img in detail_soup.find_all("img")[:10]]
        
        with open("result.txt", "w") as f:
            f.write(f"og_image: {image}\n")
            f.write(f"first_img: {first_img_src}\n")
            f.write(f"other imgs: {other_imgs}\n")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
