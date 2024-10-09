import json

with open('./json/species_zh.json', 'r', encoding='utf-8') as zh_file:
    species_zh = json.load(zh_file)

with open('./json/species_en.json', 'r', encoding='utf-8') as en_file:
    species_en = json.load(en_file)

with open('./json/species_ja.json', 'r', encoding='utf-8') as ja_file:
    species_ja = json.load(ja_file)

zh_dict = {item['sciName']: item for item in species_zh}
ja_dict = {item['sciName']: item for item in species_ja}

for en_item in species_en:
    sci_name = en_item.get('sciName')

    if sci_name in zh_dict:
        en_item['comNameZh'] = zh_dict[sci_name].get('comName')

    if sci_name in ja_dict:
        en_item['comNameJp'] = ja_dict[sci_name].get('comName')

with open('./json/species_joined.json', 'w', encoding='utf-8') as output_file:
    json.dump(species_en, output_file, ensure_ascii=False, indent=4)

##########################
with open('./json/species_joined.json', 'r', encoding='utf-8') as species_file:
    species_data = json.load(species_file)

with open('./json/comNameList.json', 'r', encoding='utf-8') as com_name_file:
    com_name_data = json.load(com_name_file)

com_name_dict = {item['sciName']: item['comNameList'] for item in com_name_data}

for species in species_data:
    sci_name = species.get('sciName')
    if sci_name in com_name_dict:
        species['comNameList'] = com_name_dict[sci_name]
    else:
        species['comNameList'] = []

with open('./json/species.json', 'w', encoding='utf-8') as merged_file:
    json.dump(species_data, merged_file, ensure_ascii=False, indent=4)
