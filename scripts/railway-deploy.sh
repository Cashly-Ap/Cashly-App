#!/bin/sh

echo "Deploying service: $RAILWAY_SERVICE to project: $RAILWAY_PROJECT_ID"

# Clean up context — Railway only needs source + Dockerfile for the build
echo "Cleaning up build context..."
rm -rf dist/ .git/ node_modules/ 2>/dev/null
echo "Context size: $(du -sh . | cut -f1)"

railway up \
  --service "$RAILWAY_SERVICE" \
  --project "$RAILWAY_PROJECT_ID" \
  --environment production \
  --ci \
  --verbose 2>&1

EXITCODE=$?
echo "Railway exit code: $EXITCODE"
exit $EXITCODE
