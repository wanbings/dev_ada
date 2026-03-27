import asyncio
import json
import os
import re
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import traceback

async def scrape_smile(p):
    print("Starting Smile Student Living scraping...")
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://www.smilestudentliving.com/availability", wait_until="domcontentloaded")
    
    try:
        await page.wait_for_selector(".listing-item", timeout=15000)
    except:
        print("Smile Student Living listings took too long to load.")
        
    last_height = await page.evaluate("document.body.scrollHeight")
    while True:
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(2)
        new_height = await page.evaluate("document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
        
    listings = await page.query_selector_all(".listing-item")
    links_data = []
    
    for listing in listings:
        try:
            link_el = await listing.query_selector(".photo a.slider-link")
            address = await link_el.get_attribute("aria-label") if link_el else "N/A"
            view_details = await listing.query_selector("text=View Details")
            if view_details:
                link = await view_details.get_attribute("href")
                if link and link.startswith("/"):
                    link = "https://www.smilestudentliving.com" + link
                links_data.append({"address": address, "link": link})
        except Exception as e:
            continue

    print(f"Smile: Collected {len(links_data)} base listings. Diving into details concurrently...")

    results = []
    semaphore = asyncio.Semaphore(10) # 10 Concurrent tabs max for detail fetching
    
    async def fetch_detail(item):
        async with semaphore:
            try:
                detail_page = await browser.new_page()
                await detail_page.goto(item["link"], wait_until="domcontentloaded")
                try:
                    await detail_page.wait_for_selector(".rent", timeout=8000)
                except:
                    pass
                
                rent_el = await detail_page.query_selector(".rent .rent-info")
                rent = await rent_el.inner_text() if rent_el else "N/A"
                
                beds_el = await detail_page.query_selector(".feature.beds")
                beds = await beds_el.inner_text() if beds_el else "N/A"
                
                baths_el = await detail_page.query_selector(".feature.baths")
                baths = await baths_el.inner_text() if baths_el else "N/A"
                
                sqft_el = await detail_page.query_selector(".feature.sqft")
                sqft = await sqft_el.inner_text() if sqft_el else "N/A"
                
                results.append({
                    "address": item["address"],
                    "rent": rent.strip(),
                    "beds": beds.strip(),
                    "baths": baths.strip(),
                    "sq_ft": sqft.strip(),
                    "url": item["link"]
                })
                await detail_page.close()
            except Exception as e:
                print(f"Smile Detail Error ({item['link']}): {e}")
                
    await asyncio.gather(*(fetch_detail(item) for item in links_data))
    
    os.makedirs("backend", exist_ok=True)
    with open("backend/smile_apartments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
        
    await browser.close()
    print(f"Finished Smile scraping. Exported {len(results)} properties to backend/smile_apartments.json")

async def scrape_ugroup(p):
    print("Starting UGroup scraping...")
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://ugroupcu.com/apartment-search/", wait_until="domcontentloaded")
    
    try:
        await page.wait_for_selector(".property-item, .listing-item, article", timeout=20000)
    except:
        pass
        
    for _ in range(5):
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(1)
        
    content = await page.content()
    soup = BeautifulSoup(content, "html.parser")
        
    links_data = []
    items = soup.select(".property-item") or soup.select(".listing-item") or soup.select("article") or soup.select(".prop-item") or soup.select(".property-list")
    
    for item in items:
        try:
            url_el = item.find("a")
            url = url_el["href"] if url_el and url_el.has_attr('href') else ""
            if not url or url == "#": continue
            if url.startswith("/"): url = "https://ugroupcu.com" + url
            
            title_el = item.select_one(".property-title") or item.select_one("h3") or item.select_one("h2")
            if title_el:
                address = title_el.get_text(strip=True)
            else:
                address = url.split("/")[-1].replace("-", " ").title()

            links_data.append({"address": address, "url": url})
        except Exception as e:
            continue
            
    print(f"UGroup: Collected {len(links_data)} base listings. Diving into details concurrently...")

    results = []
    semaphore = asyncio.Semaphore(10)
    
    async def fetch_detail(item):
        async with semaphore:
            try:
                detail_page = await browser.new_page()
                await detail_page.goto(item["url"], wait_until="domcontentloaded")
                await asyncio.sleep(2)  # Allow JS and Vue/React items to load
                detail_content = await detail_page.content()
                detail_soup = BeautifulSoup(detail_content, "html.parser")
                
                unit_wrappers = detail_soup.select(".tab-content_in_wrapp.tab-cntnt_wrap_btm")
                
                if not unit_wrappers:
                    pass
                else:
                    for wrapper in unit_wrappers:
                        beds_el = wrapper.select_one(".propert_head")
                        beds = beds_el.get_text(strip=True) if beds_el else "N/A"
                        
                        rent = "N/A"
                        baths = "N/A"
                        
                        list_items = wrapper.select("li")
                        for li in list_items:
                            divs = li.select("div")
                            if len(divs) >= 2:
                                label = divs[0].get_text(strip=True).lower()
                                value = divs[1].get_text(strip=True)
                                if "price per month" in label or "price per occupant" in label:
                                    rent = value
                                elif "bathrooms" in label:
                                    baths = value
                                    
                        results.append({
                            "address": item["address"],
                            "url": item["url"],
                            "beds": beds,
                            "baths": baths,
                            "rent": rent
                        })
                await detail_page.close()
            except Exception as e:
                print(f"UGroup Detail Error ({item['url']}): {e}")

    await asyncio.gather(*(fetch_detail(item) for item in links_data))
            
    with open("backend/ugroup_apartments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
        
    await browser.close()
    print(f"Finished UGroup scraping. Exported {len(results)} properties to backend/ugroup_apartments.json")


async def scrape_jsm(p):
    print("Starting JSM Living scraping...")
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://jsmliving.com/search-available-units", wait_until="domcontentloaded")
    
    try:
        await page.wait_for_selector("article", timeout=15000)
    except:
        pass
        
    for _ in range(3):
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(1)
        
    content = await page.content()
    soup = BeautifulSoup(content, "html.parser")
    
    results = []
    articles = soup.select("article")
    
    for article in articles:
        try:
            url_el = article.find("a", class_="call-to-action") or article.find("a")
            url = url_el["href"] if url_el and url_el.has_attr('href') else ""
            if url and url.startswith("/"):
                url = "https://jsmliving.com" + url
            
            address_el = article.select_one(".field--name-field-building a")
            address = address_el.get_text(strip=True) if address_el else "N/A"
            
            beds_el = article.select_one(".unit__card-bedrooms p")
            beds = beds_el.get_text(strip=True) if beds_el else "N/A"
            
            baths_el = article.select_one(".unit__card-bathrooms p")
            baths = baths_el.get_text(strip=True) if baths_el else "N/A"
            
            rent_el = article.select_one(".rent_unit")
            rent = rent_el.get_text(strip=True) if rent_el else "N/A"
            
            results.append({
                "address": address,
                "url": url,
                "beds": beds,
                "baths": baths,
                "rent": rent
            })
        except Exception as e:
            pass

    with open("backend/jsm_apartments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
        
    await browser.close()
    print(f"Finished JSM scraping. Exported {len(results)} properties to backend/jsm_apartments.json")

async def scrape_gsr(p):
    print("Starting Green St Realty scraping...")
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://www.greenstrealty.com/properties/search/area/on-campus/availability/Available%20Now/availability/Available%20August%202026", wait_until="domcontentloaded")
    
    try:
        await page.wait_for_selector(".property-item, .listing-item", timeout=15000)
    except:
        pass
        
    for _ in range(5):
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(1)
        
    content = await page.content()
    soup = BeautifulSoup(content, "html.parser")
    
    links_data = []
    # Find all links to property profiles
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/properties/profile/' in href and href not in [x['url'] for x in links_data]:
            full_url = href if href.startswith('http') else "https://www.greenstrealty.com" + href
            links_data.append({"url": full_url})
            
    print(f"Green St: Collected {len(links_data)} base listings. Diving into details concurrently...")

    results = []
    semaphore = asyncio.Semaphore(10)
    
    async def fetch_detail(item):
        async with semaphore:
            try:
                detail_page = await browser.new_page()
                await detail_page.goto(item["url"], wait_until="domcontentloaded")
                await asyncio.sleep(2)
                detail_content = await detail_page.content()
                detail_soup = BeautifulSoup(detail_content, "html.parser")
                
                # Try to find address / title
                title_el = detail_soup.find("h1") or detail_soup.find(class_="property-title")
                address = title_el.get_text(strip=True) if title_el else item["url"].split("/")[-1].replace("-", " ").title()
                
                # Green st data is sometimes in tables or divs. Since we just need beds/baths/rent/sqft, we can do a robust search
                beds = "N/A"
                baths = "N/A"
                rent = "N/A"
                sqft = "N/A"
                
                # Simple extraction from bold/headers/values
                text_content = detail_soup.get_text(separator=' | ', strip=True).lower()
                
                # Check for beds
                beds_match = re.search(r'(\d+)\s*(?:bed|bedroom)', text_content, re.IGNORECASE)
                if beds_match: beds = beds_match.group(1)
                
                # Check for baths
                baths_match = re.search(r'([\d\.]+)\s*(?:bath|bathroom)', text_content, re.IGNORECASE)
                if baths_match: baths = baths_match.group(1)
                
                # Check for rent
                rent_match = re.search(r'\$\s*([\d,]+)(?:\s*-\s*\$\s*([\d,]+))?', text_content)
                if rent_match:
                    rent = rent_match.group(0)
                    
                # Check for sqft
                sqft_match = re.search(r'([\d,]+)\s*(?:sq\s*ft|square\s*feet)', text_content, re.IGNORECASE)
                if sqft_match: sqft = sqft_match.group(1)
                
                results.append({
                    "address": address,
                    "url": item["url"],
                    "beds": beds,
                    "baths": baths,
                    "rent": rent,
                    "sq_ft": sqft
                })
                await detail_page.close()
            except Exception as e:
                print(f"Green St Detail Error ({item['url']}): {e}")

    await asyncio.gather(*(fetch_detail(item) for item in links_data))
            
    with open("backend/gsr_apartments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
        
    await browser.close()
    print(f"Finished Green St scraping. Exported {len(results)} properties to backend/gsr_apartments.json")

async def merge_json_files():
    all_apartments = []
    
    files = [
        ("backend/smile_apartments.json", "Smile Student Living"),
        ("backend/ugroup_apartments.json", "University Group"),
        ("backend/jsm_apartments.json", "JSM Living"),
        ("backend/gsr_apartments.json", "Green St Realty")
    ]
    
    for filepath, company in files:
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        item["leasing_company"] = company
                        all_apartments.append(item)
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                
    with open("backend/all_apartments.json", "w", encoding="utf-8") as f:
        json.dump(all_apartments, f, indent=4)
    print(f"\nMerged {len(all_apartments)} total properties into backend/all_apartments.json")

async def main():
    os.makedirs("backend", exist_ok=True)
    async with async_playwright() as p:
        # Run all three spiders concurrently
        await asyncio.gather(
            scrape_smile(p),
            scrape_ugroup(p),
            scrape_jsm(p),
            scrape_gsr(p)
        )
        print("\nAll scraping tasks completed successfully!")
        
    await merge_json_files()

if __name__ == "__main__":
    asyncio.run(main())