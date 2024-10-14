import json
import re

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
def contains_traditional_chinese(text):
    if not isinstance(text, str):
        return False
    pattern = r'[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]'
    return bool(re.search(pattern, text))

with open('./json/species_joined.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

filtered_data = []
for entry in data:
    if 'comNameZh' in entry and contains_traditional_chinese(entry['comNameZh']):
        comNameList = []

        # 通稱 replace
        if '臺灣' in entry['comNameZh']:
            comNameList.extend([entry['comNameZh'].replace('臺', '台')])

        if '八哥' in entry['comNameZh']:
            comNameList.extend(['鵁鴒', 'ka-līng'])

        if '鵰' in entry['comNameZh']:
            comNameList.extend(['鴟鴞', '鷹', 'bā-hio̍h', 'ing'])

        if '鷹' in entry['comNameZh']:
            comNameList.extend(['鴟鴞', 'ing'])

        if '鴞' in entry['comNameZh']:
            comNameList.extend(['貓頭鳥', 'niau-thâu-tsiáu'])

        if '鸚鵡' in entry['comNameZh']:
            comNameList.extend(['鸚哥', 'ing-ko'])

        if '燕' in entry['comNameZh']:
            comNameList.extend(['燕仔', 'ìnn-á'])

        if '翠鳥' in entry['comNameZh']:
            comNameList.extend(['釣魚翁', 'tiò-hî-ang', 'tiò-hû-ang'])

        if '水鴨' in entry['comNameZh']:
            comNameList.extend(['tsuí-ah'])

        if '松雀鷹' in entry['comNameZh']:
            comNameList.extend(['鷹仔虎', 'ing-á-hóo'])

        if '鳥' in entry['comNameZh']:
            comNameList.extend(['tsiáu-á'])

        if '繡眼' in entry['comNameZh'] and ('畫眉' not in entry['comNameZh']):
            comNameList.extend(['青苔仔', '青笛仔', 'tshenn-tî-á', 'tshinn-tî-á'])

        if '麻雀' in entry['comNameZh']:
            comNameList.extend(['粟鳥仔', '厝鳥仔', '厝角鳥仔', 'tshik-tsiáu-á', 'tshù-kak-tsiáu-á', 'tshù-tsiáu-á'])

        if '雁' in entry['comNameZh']:
            comNameList.extend(['野鵝', 'iá-gô', '雁仔', 'gān-á', '海雁', 'hái-gān'])

        if '鵝' in entry['comNameZh']:
            comNameList.extend(['gô', 'giâ'])

        if '鶺鴒' in entry['comNameZh']:
            comNameList.extend(['牛屎鳥仔', 'gû-sái-tsiáu-á'])

        if '鶴' in entry['comNameZh']:
            comNameList.extend(['ho̍h'])

        if '鴨' in entry['comNameZh']:
            comNameList.extend(['ah'])

        if '鸕鶿' in entry['comNameZh']:
            comNameList.extend(['lôo-tsî'])

        if '秧雞' in entry['comNameZh']:
            comNameList.extend(['水雞', '米雞仔'])

        if '鵜鶘' in entry['comNameZh']:
            comNameList.extend(['布袋鵝'])

        if '文鳥' in entry['comNameZh']:
            comNameList.extend(['筆仔', 'pit-á'])

        if '鸊鷉' in entry['comNameZh']:
            comNameList.extend(['水避仔', 'tsuí-pī-á'])

        if '伯勞' in entry['comNameZh']:
            comNameList.extend(['伯勞仔', 'pit-lô-á'])

        if '雉雞' in entry['comNameZh']:
            comNameList.extend(['thī-ke', 'thī-kue'])

        if '鳩' in entry['comNameZh']:
            comNameList.extend(['鴿'])

        if '鰹鳥' in entry['comNameZh']:
            comNameList.extend(['海雞母'])

        if '綬帶' in entry['comNameZh']:
            comNameList.extend(['壽帶'])

        if '秧雞' in entry['comNameZh']:
            comNameList.extend(['秧雞', '水雞', '米雞仔', '紅跤鳥'])

        # 種名 replace

        if '臺灣鷦眉' in entry['comNameZh']:
            comNameList.extend(['鱗胸鷦鷯', '鱗胸鷦鶥', '小鷦鶥', '台灣鷦眉'])

        if '赤腹鷹' in entry['comNameZh']:
            comNameList.extend(['鷹柱鳥'])

        if '鳳頭蒼鷹' in entry['comNameZh']:
            comNameList.extend(['粉鳥鷹'])

        if '禿鷲' in entry['comNameZh']:
            comNameList.extend(['狗頭鷹', '禿鷹'])

        if '鴛鴦' in entry['comNameZh']:
            comNameList.extend(['uan-iunn'])

        if '灰面鵟鷹' in entry['comNameZh']:
            comNameList.extend(['灰面鷲', '國慶鳥', '南路鷹', '灰面鷹', 'lâm-lōo-ing', '山後鳥', 'suann-āu-tsiáu'])

        if '東方鵟' in entry['comNameZh']:
            comNameList.extend(['普通鵟'])

        if '黑翅鳶' in entry['comNameZh']:
            comNameList.extend(['烏翼鷹'])

        if '紅腳隼' in entry['comNameZh']:
            comNameList.extend(['阿穆爾隼'])

        if '林鵰' in entry['comNameZh']:
            comNameList.extend(['烏毛跤鷹'])

        if '大白鷺' in entry['comNameZh']:
            comNameList.extend(['大白翎鷥', '大白鷺鷥', 'pe̍h-līng-si'])

        if '中白鷺' in entry['comNameZh']:
            comNameList.extend(['中白翎鷥', '中白鷺鷥', 'pe̍h-līng-si'])

        if '小白鷺' in entry['comNameZh']:
            comNameList.extend(['小白翎鷥', '小白鷺鷥', 'pe̍h-līng-si'])

        if '唐白鷺' in entry['comNameZh']:
            comNameList.extend(['中國白翎鷥', '中國白鷺鷥', 'pe̍h-līng-si'])

        if '蒼鷺' in entry['comNameZh']:
            comNameList.extend(['海徛仔', 'hái-khiā-á'])

        if '黑冠麻鷺' in entry['comNameZh']:
            comNameList.extend(['大笨鳥', '地瓜', '山暗光鳥', '蕃薯', 'àm-kong-tsiáu'])

        if '栗小鷺' in entry['comNameZh']:
            comNameList.extend('田赤仔')

        if '黃小鷺' in entry['comNameZh']:
            comNameList.extend('田隙仔')

        if '鳳頭潛鴨' in entry['comNameZh']:
            comNameList.extend(['阿不倒仔', '澤鳧', 'a-put-tó-á'])

        if '斑背潛鴨' in entry['comNameZh']:
            comNameList.extend(['鈴鴨'])

        if '大濱鷸' in entry['comNameZh']:
                comNameList.extend(['姥鷸'])

        if '紅胸濱鷸' in entry['comNameZh']:
            comNameList.extend(['穉鷸'])

        if '彎嘴濱鷸' in entry['comNameZh']:
            comNameList.extend(['滸鷸'])

        if '高蹺鴴' in entry['comNameZh']:
            comNameList.extend(['躼跤仔', 'lò-kha-á'])

        if '水雉' in entry['comNameZh']:
            comNameList.extend(['菱角鳥'])

        if '長趾濱鷸' in entry['comNameZh']:
            comNameList.extend(['雲雀鷸'])

        if '丹氏濱鷸' in entry['comNameZh']:
            comNameList.extend(['丹氏穉鷸'])

        if '藍腹鷴' in entry['comNameZh']:
            comNameList.extend(['哇雞', '華雞', '烏尾雞', '山雞', '紅跤仔', '雉雞'])

        if '黑長尾雉' in entry['comNameZh']:
            comNameList.extend(['帝雉', '烏山雞仔', '烏雉雞', '烏雉', '烏長尾雉'])

        if '白腹秧雞' in entry['comNameZh']:
            comNameList.extend(['姑惡鳥', '苦雞母', '姑婆鳥', '白面雞', '苦惡鳥', '紅尻川仔'])

        if '臺灣山鷓鴣' in entry['comNameZh']:
            comNameList.extend(['深山竹雞', '報時鳥', '紅跤仔', 'tik-ke-á', 'tik-kue-á', '竹雞'])

        if '臺灣噪眉' in entry['comNameZh']:
            comNameList.extend(['臺灣噪鶥', "金翼白眉", "台灣噪鶥", "台灣噪眉"])

        if '阿穆爾綬帶' in entry['comNameZh']:
            comNameList.extend(['亞洲綬帶', '亞洲壽帶'])

        if '小卷尾' in entry['comNameZh']:
            comNameList.extend(['山烏鶖'])

        if '大卷尾' in entry['comNameZh']:
            comNameList.extend(['烏鶖'])

        if '佛法僧' in entry['comNameZh']:
            comNameList.extend(['山鸚哥'])

        if '白冠雞' in entry['comNameZh']:
            comNameList.extend(['烏雞仔', '烏水雞'])

        if '董雞' in entry['comNameZh']:
            comNameList.extend(['田頓'])

        if '紅冠水雞' in entry['comNameZh']:
            comNameList.extend(['水鵁鴒', '烏水雞', '烏雞仔', '田雞仔', '米雞仔', '紅雞', '青跤仔'])

        if '黃胸藪眉' in entry['comNameZh']:
            comNameList.extend(['藪鳥'])

        if '黑鳶' in entry['comNameZh']:
            comNameList.extend(['鶆鴞'])

        if '熊鷹' in entry['comNameZh']:
            comNameList.extend(['白毛跤鷹'])

        if '夜鷺' in entry['comNameZh']:
            comNameList.extend(['暗公鳥', '企鵝', 'àm-kong-tsiáu'])

        if '環頸雉' in entry['comNameZh']:
            comNameList.extend(['啼雞', '野雞'])

        if '信天翁' in entry['comNameZh']:
            comNameList.extend(['海南戇'])

        if '喜鵲' in entry['comNameZh']:
            comNameList.extend(['客鳥', 'kheh-tsiáu'])

        if '白琵鷺' in entry['comNameZh']:
            comNameList.extend(['白面抐桮', 'pe̍h-bīn-lā-pue'])

        if '黑面琵鷺' in entry['comNameZh']:
            comNameList.extend(['烏面抐桮', 'oo-bīn-lā-pue'])

        if '斑文鳥' in entry['comNameZh']:
            comNameList.extend(['烏喙筆仔', 'oo-tshuì-pit-á'])

        if '冠鸊鷉' in entry['comNameZh']:
            comNameList.extend(['聳毛水避仔'])

        if '黑頸鸊鷉' in entry['comNameZh']:
            comNameList.extend(['烏頸水避仔'])

        if '五色鳥' in entry['comNameZh']:
            comNameList.extend(['花仔和尚', '臺灣擬啄木', 'hue-á-huê-siūnn'])

        if '棕噪眉' in entry['comNameZh']:
            comNameList.extend(['竹鳥', '棕噪鶥'])

        if '白頭翁' in entry['comNameZh']:
            comNameList.extend(['白頭鵠仔', 'pe̍h-thâu-khok-á'])

        if '反嘴鴴' in entry['comNameZh']:
            comNameList.extend(['翹喙仔'])

        if '珠頸斑鳩' in entry['comNameZh']:
            comNameList.extend(['斑鴿', 'pan-kah'])

        if '大冠鷲' in entry['comNameZh']:
            comNameList.extend(['蛇鵰'])

        if '金背鳩' in entry['comNameZh']:
            comNameList.extend(['山斑鴿', 'suann-pan-kah'])

        if '阿穆爾綬帶' in entry['comNameZh']:
            comNameList.extend(['亞洲綬帶', '亞洲壽帶'])

        if '草鴞' in entry['comNameZh']:
            comNameList.extend(['猴面鷹'])

        if '臺灣藍鵲' in entry['comNameZh']:
            comNameList.extend(['長尾山娘', 'tn̂g-bué-suann-niû'])

        if '小辮鴴' in entry['comNameZh']:
            comNameList.extend(['土豆鳥'])

        ############################################
        comNameList = list(dict.fromkeys(comNameList))

        entry['comNameList'] = comNameList

        filtered_data.append(entry)

with open('./json/species_zh_only.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=4)

with open('./json/species_joined.json', 'r', encoding='utf-8') as species_file:
    species_data = json.load(species_file)

com_name_dict = {item['sciName']: item['comNameList'] for item in filtered_data}

for species in species_data:
    sci_name = species.get('sciName')
    if sci_name in com_name_dict:
        species['comNameList'] = com_name_dict[sci_name]
    else:
        species['comNameList'] = []

with open('./json/species.json', 'w', encoding='utf-8') as merged_file:
    json.dump(species_data, merged_file, ensure_ascii=False, indent=4)
