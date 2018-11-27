sqlite3 ../data/token-grants.sqlite3 <<EOF
.headers on
.mode column
SELECT * FROM Events;;
