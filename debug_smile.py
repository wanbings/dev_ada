import asyncio
from playwright.async_api import async_playwright

async def debug_smile():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://www.smilestudentliving.com/availability", wait_until="domcontentloaded")
        
        try:
            await page.wait_for_selector(".listing-item", timeout=10000)
        except:
            print("wait timeout")
            
        listings = await page.query_selector_all(".listing-item")
        print("Found listings count:", len(listings))
        
        if listings:
            first = listings[0]
            link_el = await first.query_selector(".photo a.slider-link")
            print("link_el:", type(link_el))
            view_details = await first.query_selector("a:has-text('View Details')")
            print("view_details 1:", view_details)
            view_details_2 = await first.query_selector("text=View Details")
            print("view_details 2:", view_details_2)
            if view_details_2:
                print("href:", await view_details_2.get_attribute("href"))
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_smile())
