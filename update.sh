EBIRD_API_KEY="${EBIRD_API_KEY:-EBIRD_API_KEY}"

set -e

## CSV

echo "Update Country Data..."

curl -s --location 'https://api.ebird.org/v2/ref/region/list/country/world?fmt=csv' \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o ./csv/country.csv

echo "Update Taiwan Region Data..."

curl -s --location "https://api.ebird.org/v2/ref/hotspot/TW?fmt=csv" \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o ./csv/taiwan_region.csv

echo "Update Subnational1 Data..."

curl -s --location 'https://api.ebird.org/v2/ref/region/list/subnational1/TW?fmt=csv' \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o ./csv/subnational1.csv

## JSON

echo "Update Region Data..."

regionList="TW JP"
combined=$(for region in $regionList
do
    if [[ "$region" == "TW" || "$region" == "JP" ]]; then
        curl -s --location "https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json" \
             --header "x-ebirdapitoken: ${EBIRD_API_KEY}"
    fi
done | jq -s 'add | map(del(.[] | select(. == null)))')

echo "$combined" | sed $'s/\t/ /g' | sed 's/\x08/\\u0008/g'  > ./json/region.json

echo "Update Species Data..."

curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=en' -o ./json/species_en.json
curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=ja' -o ./json/species_ja.json
curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=zh' -o ./json/species_zh.json

python ./merge.py