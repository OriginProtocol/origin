#!/bin/bash
################################################################################
## ./create_single_tenant.sh [name] [email] [password] [store_name] [listing_id]
################################################################################

if [[ -z $API_ROOT ]]; then
  echo -e "Defaulting to http://localhost:3000\n"
  API_ROOT="http://localhost:3000"
fi

TAB='\t'
COOKIE_STORAGE="/tmp/cst-cookies.txt"
RANDOM_TOKEN=$(date +%s | sha256sum | base64 | head -c 32)
JSON_POST_OPTIONS=(-X POST -H 'Content-Type: application/json')

JSON_REGISTRATION='{ "name": "%s", "email": "%s", "password": "%s" }'
JSON_LOGIN='{ "email": "%s", "password": "%s" }'
JSON_CREATE='{"name": "%s", "listing_id": "%s", "auth_token": "%s"}'

shop_create_user() {
  JSON=$(printf "$JSON_REGISTRATION" "$1" "$2" "$3")
  echo "curl ${JSON_POST_OPTIONS[@]} -d $JSON $API_ROOT/auth/registration"
  curl "${JSON_POST_OPTIONS[@]}" -d "$JSON" "$API_ROOT/auth/registration"
}

shop_login() {
  JSON=$(printf "$JSON_LOGIN" "$1" "$2")
  echo "curl ${JSON_POST_OPTIONS[@]} -d $JSON -c $COOKIE_STORAGE $API_ROOT/auth/login"
  curl "${JSON_POST_OPTIONS[@]}" -d "$JSON" -c $COOKIE_STORAGE $API_ROOT/auth/login
}

shop_create_shop() {
  JSON=$(printf "$JSON_CREATE" "$1" "$2" "$3")
  echo "curl ${JSON_POST_OPTIONS[@]} -b $COOKIE_STORAGE -d $JSON $API_ROOT/shop"
  curl "${JSON_POST_OPTIONS[@]}" -b $COOKIE_STORAGE -d "$JSON" $API_ROOT/shop
}

if [[ -z "$5" ]]; then
  echo "Missing arguments"
  echo ""
  echo "./create_single_tenant.sh [name] [email] [password] [store_name] [listing_id]"
  exit 1
fi

echo    "Creating single shop with the following:"
echo    "----------------------------------------"
echo -e "Seller Name:$TAB$1"
echo -e "E-mail:$TAB$2"
echo -e "Shop Name:$TAB$4"
echo -e "Lisintg ID:$TAB$5"
echo    "----------------------------------------"
read -r -p "Are You Sure? [Y/n] " input
 
case $input in
    [yY][eE][sS]|[yY])

  USER_NAME="$1"
  USER_EMAIL="$2"
  USER_PASS="$3"
  SHOP_NAME="$4"
  SHOP_LISTING_ID="$5"

  shop_create_user "$USER_NAME" "$USER_EMAIL" "$USER_PASS"
  shop_login "$USER_EMAIL" "$USER_PASS"
  shop_create_shop "$SHOP_NAME" "$SHOP_LISTING_ID" "$RANDOM_TOKEN"
  rm $COOKIE_STORAGE 2> /dev/null
  echo "Complete.  Your API auth token is $RANDOM_TOKEN"
  ;;

    [nN][oO]|[nN])

  echo "Aborting"
  exit 1
  ;;

    *)

  echo "Invalid input..."
  exit 1
  ;;

esac
