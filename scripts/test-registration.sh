#!/bin/bash

# Set up variables
TEST_ADMIN_EMAIL=${TEST_ADMIN_EMAIL:-"admin@example.com"}
TEST_ADMIN_PASS=${TEST_ADMIN_PASS:-"Mohammad44p"}
TEST_USER_EMAIL=${TEST_USER_EMAIL:-"user@example.com"}
TEST_USER_PASS=${TEST_USER_PASS:-"Mohammad44p"}
COOKIE_JAR="/tmp/cookies.txt"

# Function to make API requests and log responses
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local cookie_file=$4

  echo "Making $method request to $endpoint"
  echo "Request data: $data"
  
  response=$(curl -s -X "$method" \
    "http://localhost:3001$endpoint" \
    -H "Content-Type: application/json" \
    ${data:+-d "$data"} \
    ${cookie_file:+-b "$cookie_file"} \
    ${cookie_file:+-c "$cookie_file"} \
    -v 2>&1)

  echo "Response Headers:"
  echo "$response" | grep -E "< HTTP|< Location"
  echo "Response Body:"
  echo "$response" | grep -v "^[<>]"
  echo "---"
  return 0
}

# Test database connection via registration endpoint
echo "Step 1: Testing database connection..."
make_request "POST" "/api/auth/register" \
  "{\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASS\"}"

# Wait for potential database operations
sleep 2

# Test admin login
echo "Step 2: Testing admin login..."
make_request "POST" "/api/auth/login" \
  "{\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASS\"}" \
  "$COOKIE_JAR"

# Wait for token to be set
sleep 1

# Verify admin token
echo "Step 3: Verifying admin token..."
make_request "GET" "/api/auth/verify" "" "$COOKIE_JAR"

# Test regular user registration with admin token
echo "Step 4: Testing regular user registration..."
make_request "POST" "/api/auth/register" \
  "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}" \
  "$COOKIE_JAR"

# Test regular user login
echo "Step 5: Testing regular user login..."
make_request "POST" "/api/auth/login" \
  "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}" \
  "${COOKIE_JAR}.user"

# Clean up
rm -f "$COOKIE_JAR" "${COOKIE_JAR}.user"
