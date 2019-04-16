Different events may be tested by using the sample events in the fixtures directory. The `test_post.sh` script will make a POST to `http://localhost:3456/events` with the json file passed.

Example:
```
cd fixtures
./test_post.sh OfferWithdrawn.json
```
