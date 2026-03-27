import json
from bs4 import BeautifulSoup

soup = BeautifulSoup(open('gsr_test.html', encoding='utf-8'), 'html.parser')
listings = soup.select('.property-listing-item') or soup.find_all('div', class_=lambda c: c and 'property-item' in c)

results = []
for l in listings[:3]:
    info = {}
    title = l.find('h3') or l.find('h2') or l.find(class_='title')
    info['title_class'] = title.get('class') if title else None
    info['title_text'] = title.text.strip() if title else None
    
    url = l.find('a')['href'] if l.find('a') else 'N/A'
    info['url'] = url
    
    # Get all text blocks and classes to figure out what's what
    elements = l.find_all(lambda tag: tag.name in ['div', 'span', 'p'] and tag.text.strip() and not tag.find_all(lambda t: t.name in ['div', 'span', 'p']))
    info['elements'] = [(e.get('class'), e.text.strip()) for e in elements]
    results.append(info)

print(json.dumps(results, indent=2))
