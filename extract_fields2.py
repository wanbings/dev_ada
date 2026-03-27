import json
import codecs
from bs4 import BeautifulSoup

soup = BeautifulSoup(open('gsr_test.html', encoding='utf-8'), 'html.parser')

items = soup.find_all('div', class_=lambda c: c and 'property-item' in c)
for item in items[:1]:
    title = item.find('h2') or item.find('h3') or item.find(class_=lambda c: c and 'title' in c)
    print("Title:", title.text.strip() if title else 'N/A')
    
    url = item.find('a')
    print("URL:", url['href'] if url else 'N/A')
    
    beds = item.find(class_=lambda c: c and 'bed' in c.lower())
    print("Beds:", beds.text.strip() if beds else 'N/A')
    
    baths = item.find(class_=lambda c: c and 'bath' in c.lower())
    print("Baths:", baths.text.strip() if baths else 'N/A')
    
    rent = item.find(class_=lambda c: c and ('rent' in c.lower() or 'price' in c.lower()))
    print("Rent:", rent.text.strip() if rent else 'N/A')
    
    print("All text blocks:")
    for el in item.find_all(lambda t: t.name in ['div','span','p'] and not t.find_all()):
        text = el.text.strip()
        if text:
            print(f"[{el.get('class')}]: {text}")
