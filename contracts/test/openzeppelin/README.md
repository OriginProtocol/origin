# Imported OpenZeppelin ERC-20 token tests

This directory contains OpenZeppelin's token tests with the minimum set of
modifications to work against the Origin token.

One of the goals was to reduce the work needed to merge in relevant changes
from the upstream repo by isolating changes. This is accomplished by ensuring
that each test file imported from OpenZeppelin has these changes (at most):

1. A comment directing `eslint` to ignore formatting issues, because
   OpenZeppelin tests don't comply with our normal formatting guidelines.
2. Import mock constructor needed to deploy the token for the test.

Each imported test file should have a 2 line diff from the original.

These files were imported from OpenZeppelin **1.12.0**. This might be newer than
the version we're importing, but this gets us increased test coverage with no
downside.
