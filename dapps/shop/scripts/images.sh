find products -type dir | grep '\/orig' | sed 's/orig$/520/' | xargs mkdir -p
find products -type f | grep '\/orig\/' | awk '{ printf "convert " $1 " -resize 520x520 "; gsub(/\/orig\//, "/520/", $1); printf $1; printf "\n" }' > conv.sh
