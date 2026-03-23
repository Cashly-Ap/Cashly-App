#!/bin/sh

echo "Deploying service: $RAILWAY_SERVICE to project: $RAILWAY_PROJECT_ID"

railway up \
  --service "$RAILWAY_SERVICE" \
  --project "$RAILWAY_PROJECT_ID" \
  --environment production \
  --ci \
  --verbose 2>&1

EXITCODE=$?
echo "Railway exit code: $EXITCODE"
exit $EXITCODE
