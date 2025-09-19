#!/usr/bin/env python3
import json
import re
import subprocess
import os
import sys

EBIRD_API_KEY = os.environ.get('EBIRD_API_KEY', 'EBIRD_API_KEY')

def run_curl_command(url, output_file=None):
    cmd = ['curl', '-s', '--location', url, '--header', f'x-ebirdapitoken: {EBIRD_API_KEY}']
    if output_file:
        cmd.extend(['-o', output_file])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        if not output_file:
            return result.stdout
        return True
    except subprocess.CalledProcessError as e:
        sys.exit(1)

def update_region_data():
    region_list = ["TW", "JP"]
    combined_data = []

    for region in region_list:
        url = f"https://api.ebird.org/v2/ref/hotspot/{region}?fmt=json"
        data = run_curl_command(url)
        try:
            region_data = json.loads(data)
            combined_data.extend(region_data)
        except json.JSONDecodeError:
            print(f"Failed to parse {region} region data")
            continue

    combined_data = [item for item in combined_data if item is not None]

    with open('./region.json', 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=4)
    print(f"Region data saved: {len(combined_data)} locations")

def update_species_data():
    species_data = {}
    locales = {
        'en': 'comName',
        'de': 'comNameDe',
        'es_419': 'comNameEsLA',
        'es_ES': 'comNameEsES',
        'fr': 'comNameFr',
        'it': 'comNameIt',
        'ja': 'comNameJp',
        'mn-MN': 'comNameMn',
        'pt_PT': 'comNamePtPT',
        'pt_BR': 'comNamePtBR',
        'ru': 'comNameRu',
        'zh': 'comNameZh'
    }

    for locale in locales.keys():
        url = f'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale={locale}'
        data = run_curl_command(url)
        try:
            species_data[locale] = json.loads(data)
        except json.JSONDecodeError:
            print(f"Failed to parse {locale} species data")
            continue

    return species_data, locales

def contains_traditional_chinese(text):
    if not isinstance(text, str):
        return False
    pattern = r'[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]'
    return bool(re.search(pattern, text))

def load_species_mapping():
    try:
        with open('./species_mapping.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        return {}

def generate_common_name_list(com_name_zh, species_mapping):
    com_name_list = []

    if '臺灣' in com_name_zh:
        com_name_list.extend([com_name_zh.replace('臺', '台')])

    for keyword, alternatives in species_mapping.items():
        if keyword in com_name_zh:
            com_name_list.extend(alternatives)

    return list(dict.fromkeys(com_name_list))

def merge_species_data(species_data, locales):
    species_mapping = load_species_mapping()
    species_en = species_data.get('en', [])

    locale_dicts = {}
    for locale in locales.keys():
        if locale != 'en' and locale in species_data:
            locale_dicts[locale] = {item['sciName']: item for item in species_data[locale]}

    for en_item in species_en:
        sci_name = en_item.get('sciName')

        for locale, field_name in locales.items():
            if locale == 'en':
                continue

            if locale in locale_dicts and sci_name in locale_dicts[locale]:
                locale_name = locale_dicts[locale][sci_name].get('comName')
                if locale_name:
                    en_item[field_name] = locale_name
                else:
                    en_item[field_name] = en_item.get('comName', '')
            else:
                en_item[field_name] = en_item.get('comName', '')

    filtered_data = []
    for entry in species_en:
        if 'comNameZh' in entry and contains_traditional_chinese(entry['comNameZh']):
            comNameList = generate_common_name_list(entry['comNameZh'], species_mapping)
            entry['comNameList'] = comNameList
            filtered_data.append(entry)

    com_name_dict = {item['sciName']: item['comNameList'] for item in filtered_data}

    for species in species_en:
        sci_name = species.get('sciName')
        if sci_name in com_name_dict:
            species['comNameList'] = com_name_dict[sci_name]
        else:
            species['comNameList'] = []

    with open('./species.json', 'w', encoding='utf-8') as merged_file:
        json.dump(species_en, merged_file, ensure_ascii=False, indent=4)
    print(f"Species data saved: {len(species_en)} species")

def main():
    print("eBird data update started")

    update_region_data()
    species_data, locales = update_species_data()
    merge_species_data(species_data, locales)

    print("Data update completed")


if __name__ == "__main__":
    main()