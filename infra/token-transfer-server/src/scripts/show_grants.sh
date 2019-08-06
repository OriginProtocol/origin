sqlite3 ${DATABASE_URL#sqlite:\/\/} <<EOF
.headers on
.mode column
SELECT * FROM Grant;
