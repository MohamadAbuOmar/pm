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

echo "Testing middleware functionality..."

# Test 1: Public routes without token
echo -e "\n1. Testing public routes without token..."
curl -v http://localhost:3000/auth/login 2>&1 | grep "< HTTP"
curl -v http://localhost:3000/api/auth/register 2>&1 | grep "< HTTP"

# Test 2: Admin login
echo -e "\n2. Testing admin login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  -c $ADMIN_COOKIE_JAR \
  -v 2>&1 | grep "< HTTP"

# Test 3: Regular user login
echo -e "\n3. Testing regular user login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}" \
  -c $USER_COOKIE_JAR \
  -v 2>&1 | grep "< HTTP"

# Test 4: Access admin routes with admin token
echo -e "\n4. Testing admin routes with admin token..."
curl -v http://localhost:3000/admin \
  -b $ADMIN_COOKIE_JAR \
  2>&1 | grep "< HTTP"
curl -v http://localhost:3000/admin/users \
  -b $ADMIN_COOKIE_JAR \
  2>&1 | grep "< HTTP"

# Test 5: Try accessing admin routes with regular user token
echo -e "\n5. Testing admin routes with regular user token..."
curl -v http://localhost:3000/admin \
  -b $USER_COOKIE_JAR \
  2>&1 | grep "< HTTP"
curl -v http://localhost:3000/admin/users \
  -b $USER_COOKIE_JAR \
  2>&1 | grep "< HTTP"

# Test 6: Test i18n routes
echo -e "\n6. Testing i18n routes..."
curl -v http://localhost:3000/en/admin \
  -b $ADMIN_COOKIE_JAR \
  2>&1 | grep "< HTTP"
curl -v http://localhost:3000/ar/admin \
  -b $ADMIN_COOKIE_JAR \
  2>&1 | grep "< HTTP"

# Test 7: Test token renewal
echo -e "\n7. Testing token renewal..."
curl -v http://localhost:3000/admin \
  -b $ADMIN_COOKIE_JAR \
  2>&1 | grep -E "(< HTTP|Set-Cookie)"

# Cleanup
rm -f $COOKIE_JAR $ADMIN_COOKIE_JAR $USER_COOKIE_JAR

echo -e "\nMiddleware testing complete!"
