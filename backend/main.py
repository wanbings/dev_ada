import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# 1. Initialize Driver and Load Site
driver = webdriver.Chrome()
driver.get("https://www.smilestudentliving.com/availability")
wait = WebDriverWait(driver, 20)

results = []

try:
    # 2. Infinite Scrolling Logic
    # Scroll multiple times to ensure the 'Lazy Loading' triggers all listings
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "listing-item")))
    last_height = driver.execute_script("return document.body.scrollHeight")
    
    print("Scrolling to load all available properties...")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)  # Wait for new content to render
        
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break  # No more new content; we've hit the bottom
        last_height = new_height

    # 3. Collect Clean Addresses and Links from Main Page
    # It is safer to grab the address here (from aria-label) than on the inner page.
    listings_data = []
    listings = driver.find_elements(By.CLASS_NAME, "listing-item")
    
    for listing in listings:
        try:
            # Address from the photo link aria-label
            address = listing.find_element(By.CSS_SELECTOR, ".photo a.slider-link").get_attribute("aria-label")
            # The 'View Details' link for deep scraping
            link = listing.find_element(By.LINK_TEXT, "View Details").get_attribute("href")
            
            listings_data.append({"address": address, "link": link})
        except:
            continue

    print(f"Collected {len(listings_data)} properties. Starting deep-dive into inner pages...")

    # 4. Visit Each Inner Page for Rent, Beds, Baths, and SqFt
    for item in listings_data:
        link = item["link"]
        address = item["address"]
        
        try:
            driver.get(link)
            # Wait for the rent section to load as proof the page is ready
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "rent")))

            # EXTRACT RENT
            rent = driver.find_element(By.CSS_SELECTOR, ".rent .rent-info").text

            # EXTRACT BEDS
            beds = driver.find_element(By.CSS_SELECTOR, ".feature.beds").text

            # EXTRACT BATHS
            baths = driver.find_element(By.CSS_SELECTOR, ".feature.baths").text

            # EXTRACT SQ FT (Handles missing data)
            try:
                sqft = driver.find_element(By.CSS_SELECTOR, ".feature.sqft").text
            except:
                sqft = "N/A"

            # Combine into a final data object
            data = {
                "address": address,
                "rent": rent,
                "beds": beds,
                "baths": baths,
                "sq ft": sqft,
                "url": link
            }
            results.append(data)
            print(f"Scraped: {address}")

        except Exception as e:
            print(f"Error on detail page {link}: {e}")
            continue

    # 5. --- JSON EXPORT SECTION ---
    # Using 'indent=4' makes the file readable for humans (pretty-printing)
    with open("smile_apartments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False) #
    
    print(f"\n--- SUCCESS ---")
    print(f"Saved {len(results)} properties to 'smile_apartments.json'")

finally:
    driver.quit()