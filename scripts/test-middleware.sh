#!/bin/bash

# Store cookies
COOKIE_JAR="/tmp/cookies.txt"
ADMIN_COOKIE_JAR="/tmp/admin_cookies.txt"
USER_COOKIE_JAR="/tmp/user_cookies.txt"

# Test variables
ADMIN_EMAIL=${TEST_ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASS=${TEST_ADMIN_PASS:-"Mohammad44p"}
USER_EMAIL=${TEST_USER_EMAIL:-"user@example.com"}
USER_PASS=${TEST_USER_PASS:-"Mohammad44p"}

# Function to wait for Next.js server and get its port
wait_for_nextjs() {
  local max_attempts=30
  local attempt=1

  echo "Waiting for Next.js server to start..."
  while [ $attempt -le $max_attempts ]; do
    # Try to connect to port 3000-3010
    for port in {3000..3010}; do
      if curl -s "http://localhost:$port" >/dev/null 2>&1; then
        echo "Next.js server found on port $port"
        echo $port
        return 0
      fi
    done
    echo "Attempt $attempt: Server not ready, waiting..."
    sleep 1
    attempt=$((attempt + 1))
  done
  echo "Failed to detect Next.js server port"
  return 1
}

# Get Next.js server port
PORT=$(wait_for_nextjs)
if [ $? -ne 0 ]; then
  echo "Error: Could not detect Next.js server port"
  exit 1
fi

echo "Testing middleware functionality on port $PORT..."

# Set locale cookie
echo "Set-Cookie: NEXT_LOCALE=en; Path=/;" > $COOKIE_JAR

# Helper function to make curl requests and show full response
make_request() {
  local method=$1
  local url=$2
  local cookie_file=$3
  shift 3
  echo "Making $method request to $url"
  response=$(curl -v -L \
    -X "$method" \
    -H "Accept: text/html" \
    "$@" \
    -b "$cookie_file" \
    "http://localhost:$PORT$url" 2>&1)
  
  echo "Response:"
  echo "$response" | grep -E "(< HTTP|> GET|> POST|< Location)"
  echo "---"
}

# Test 1: Public routes without token
echo -e "\n1. Testing public routes without token..."
make_request "GET" "/en/auth/login" "$COOKIE_JAR"
make_request "GET" "/api/auth/register" "$COOKIE_JAR"

# Test 2: Admin login
echo -e "\n2. Testing admin login..."
make_request "POST" "/api/auth/login" "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  -c "$ADMIN_COOKIE_JAR"

# Test 3: Regular user login
echo -e "\n3. Testing regular user login..."
curl -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}" \
  -b $COOKIE_JAR \
  -c $USER_COOKIE_JAR \
  -v 2>&1 | grep "< HTTP"

# Merge locale cookie with auth cookies
cat $COOKIE_JAR >> $ADMIN_COOKIE_JAR
cat $COOKIE_JAR >> $USER_COOKIE_JAR

# Test 4: Access admin routes with admin token
echo -e "\n4. Testing admin routes with admin token..."
curl -v "http://localhost:$PORT/en/admin" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep "< HTTP"
curl -v "http://localhost:$PORT/en/admin/users" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep "< HTTP"

# Test 5: Try accessing admin routes with regular user token
echo -e "\n5. Testing admin routes with regular user token..."
curl -v "http://localhost:$PORT/en/admin" \
  -b $USER_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep "< HTTP"
curl -v "http://localhost:$PORT/en/admin/users" \
  -b $USER_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep "< HTTP"

# Test 6: Test i18n routes
echo -e "\n6. Testing i18n routes..."
curl -v "http://localhost:$PORT/en/admin" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep "< HTTP"
curl -v "http://localhost:$PORT/ar/admin" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: ar" \
  2>&1 | grep "< HTTP"

# Test 7: Test token renewal and locale handling
echo -e "\n7. Testing token renewal and locale handling..."
curl -v "http://localhost:$PORT/en/admin" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep -E "(< HTTP|Set-Cookie)"
curl -v "http://localhost:$PORT/admin" \
  -b $ADMIN_COOKIE_JAR \
  -H "Accept-Language: en" \
  2>&1 | grep -E "(< HTTP|Location)"

# Cleanup
rm -f $COOKIE_JAR $ADMIN_COOKIE_JAR $USER_COOKIE_JAR

echo -e "\nMiddleware testing complete!"
