source ./EBIRD_API_KEY

## CSV
# Update Country Data
curl -s --location 'https://api.ebird.org/v2/ref/region/list/country/world?fmt=csv' \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o ./csv/country.csv

# Update TW Region Data
curl -s --location "https://api.ebird.org/v2/ref/hotspot/TW?fmt=csv" \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o taiwan_region.csv

# Update Subnational1 Data
curl -s --location 'https://api.ebird.org/v2/ref/region/list/subnational1/TW?fmt=csv' \
     --header "x-ebirdapitoken: ${EBIRD_API_KEY}" -o ./csv/subnational1.csv

## JSON
# Update Region Data
regionList="TW JP"
combined=$(for region in $regionList
do
    if [[ "$region" == "TW" || "$region" == "JP" ]]; then
        curl -s --location "https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json" \
             --header "x-ebirdapitoken: ${EBIRD_API_KEY}"
    fi
done | jq -s 'add | map(del(.[] | select(. == null)))')

echo "$combined" | sed $'s/\t/ /g' | sed 's/\x08/\\u0008/g'  > ./json/region.json

# Update Species Data
curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=en' -o ./json/species_en.json
curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=ja' -o ./json/species_ja.json
curl -s --location 'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=zh' -o ./json/species_zh.json

jq -s '
  def ensure_array:
    if type == "array" then . else [.] end;

  def merge_by_sciName:
    group_by(.sciName)
    | map(reduce .[] as $item ({}; . * $item))
    | map(if has("comNameZh") then . else . + {comNameZh: .comName} end)
    | map(if has("comNameJp") then . else . + {comNameJp: .comName} end);

  .[0] as $zh |
  .[1] as $ja |
  .[2] as $en |
  ($en | ensure_array) +
  ($zh | ensure_array | map({sciName, comNameZh: .comName})) +
  ($ja | ensure_array | map({sciName, comNameJp: .comName})) |
  merge_by_sciName
' ./json/species_zh.json ./json/species_ja.json ./json/species_en.json >./json/species.json
