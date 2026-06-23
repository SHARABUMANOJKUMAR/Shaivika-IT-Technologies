import os
import re
from bs4 import BeautifulSoup

project_dir = r"c:\Users\shara\OneDrive\Desktop\PROJECTS\Our Project"

def validate_html_files():
    html_files = []
    for root, _, files in os.walk(project_dir):
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    issues = []

    for file_path in html_files:
        rel_path = os.path.relpath(file_path, project_dir)
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
            
        # Check duplicate IDs
        ids = []
        for element in soup.find_all(id=True):
            ids.append(element['id'])
        
        duplicates = set([x for x in ids if ids.count(x) > 1])
        if duplicates:
            issues.append(f"[{rel_path}] Duplicate IDs found: {', '.join(duplicates)}")

        # Check src attributes (images, scripts)
        for element in soup.find_all(['img', 'script']):
            src = element.get('src')
            if src and not src.startswith(('http', 'https', '//', 'mailto:', 'tel:')):
                # Check if file exists
                # Handle absolute paths from root or relative paths
                if src.startswith('/'):
                    # Assume root is project_dir
                    asset_path = os.path.join(project_dir, src.lstrip('/'))
                else: # Relative path
                    asset_path = os.path.join(os.path.dirname(file_path), src)
                
                # Split off any query params or hashes
                asset_path = asset_path.split('?')[0].split('#')[0]

                if not os.path.exists(asset_path):
                    issues.append(f"[{rel_path}] Missing asset (src): {src}")
                    
        # Check href attributes (links, css)
        for element in soup.find_all(['a', 'link']):
            href = element.get('href')
            if href and not href.startswith(('http', 'https', '//', 'mailto:', 'tel:', '#')):
                if href.startswith('/'):
                    asset_path = os.path.join(project_dir, href.lstrip('/'))
                else:
                    asset_path = os.path.join(os.path.dirname(file_path), href)
                
                asset_path = asset_path.split('?')[0].split('#')[0]

                if not os.path.exists(asset_path):
                    issues.append(f"[{rel_path}] Broken link (href): {href}")

    if not issues:
        print("✅ HTML validation passed successfully (No duplicate IDs, missing assets, or broken links).")
    else:
        print("❌ HTML validation found issues:")
        for issue in issues:
            print(issue)

if __name__ == "__main__":
    validate_html_files()
