#!/bin/bash
set -e # exit with nonzero exit code if anything fails

SKIP="Skipping localization on Brackets:"

# request body for the Travis API call to rebuild the latest commit in Brackets
body='{
  "request": {
    "branch": "master",
    "config": {
      "script": "export UPDATE_STRINGS=true; bash ./scripts/pull-new-strings.sh"
    }
  }
}'

# Exit the script if the build is for a pull request
if [[ "$TRAVIS_BRANCH" == "master" && "$TRAVIS_PULL_REQUEST" == "false" ]]
then
  # Get the last (current) commit's author
  COMMIT_AUTHOR="$(git show --format=\"%cn\" --no-patch $TRAVIS_COMMIT)"

  # Get the list of file changes
  CHANGE_SET="$(git diff-tree --name-only --no-commit-id -r $TRAVIS_COMMIT)"
  
  # Exit if there are no relevant string changes
  if [[ "$CHANGE_SET" = *"editor.properties"* ]]
  then
    # Trigger travis build on brackets
    # This uses an api token I generated once by running:
    # `travis login && travis token` and then
    # `travis encrypt <my_token>`
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "Travis-API-Version: 3" \
      -H "Authorization: token $TRAVIS_API_TOKEN" \
      -d "$body" \
      https://api.travis-ci.org/repo/mozilla%2Fbrackets/requests
  else
    echo "$SKIP No new changes to Brackets' strings"
  fi
else
  echo "$SKIP Current branch isn't master"
fi
