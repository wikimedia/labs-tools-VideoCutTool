#!/bin/bash

# This script is used to sync the beta branch with the master branch.
# This script is run by the Crontab on the beta cloud server.


echo "Syncing beta server with master branch..."

# Exit on error
set -e

# Change the directory to the root of the project
cd /app/VideoCutTool

# store the current commit hash
before_pull_commit_hash="$(git rev-parse HEAD)"

# fetch from master branch
git fetch --all

# store the new commit hash
after_pull_commit_hash="$(git rev-parse origin/master)"

# if the commit hashes are different, then the beta server is not up to date with master branch
if [ "$before_pull_commit_hash" != "$after_pull_commit_hash" ]; then
    echo "Beta server is not up to date with master branch. Syncing..."
    echo "Before pull commit hash: $before_pull_commit_hash"
    echo "After pull commit hash: $after_pull_commit_hash"
    git pull origin master
    docker compose -f ./docker-compose.dev.yml up --build -Vd --force-recreate
    echo "Beta server is now up to date with master branch."
else
    echo "Beta server is already up to date with master branch."
fi

# Exit with success
exit 0
