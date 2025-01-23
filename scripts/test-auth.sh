#!/bin/bash

# Check for required environment variables
required_vars=("TEST_ADMIN_EMAIL" "TEST_ADMIN_PASS" "TEST_USER_EMAIL" "TEST_USER_PASS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is required"
        exit 1
    fi
done

# Store cookies
COOKIE_JAR="/tmp/cookies.txt"

# Test first user registration (admin)
echo "Testing first user registration (admin)"
echo "Request data: {\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASS\"}"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASS\"}" \
  -c $COOKIE_JAR \
  -v 2>&1 | tee /dev/stderr | grep -E "< HTTP|{.*}"

echo -e "\n\nTesting login with admin credentials"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASS\"}" \
  -c $COOKIE_JAR \
  -b $COOKIE_JAR

echo -e "\n\nTesting regular user registration (using admin token)"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}" \
  -b $COOKIE_JAR

echo -e "\n\nTesting login with regular user"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}" \
  -c ${COOKIE_JAR}.user \
  -b ${COOKIE_JAR}.user

echo -e "\n\nTesting logout"
curl -X POST http://localhost:3001/api/auth/logout \
  -b ${COOKIE_JAR}.user

# Cleanup
rm -f $COOKIE_JAR ${COOKIE_JAR}.user
