#!/bin/bash

git describe --exact-match

if [[ ! $? -eq 0 ]];then
  echo "Nothing to publish, exiting.."
  exit 0;
fi

if [[ -z "$NPM_TOKEN" ]];then
  echo "No NPM_TOKEN, exiting.."
  exit 0;
fi

if [[ $(git describe --exact-match 2> /dev/null || :) =~ -practice ]];
then
  echo "Publishing practice"
  yarn run lerna publish from-git --npm-tag practice --yes --no-verify-access --no-git-reset

  # Make sure to exit script with code 1 if publish failed
  if [[ ! $? -eq 0 ]];then
    exit 1;
  fi
else
  echo "Did not publish practice"
fi

if [[ ! $(git describe --exact-match 2> /dev/null || :) =~ -practice ]];then
  echo "Publishing stable"
  yarn run lerna publish from-git --yes

  # Make sure to exit script with code 1 if publish failed
  if [[ ! $? -eq 0 ]];then
    exit 1;
  fi
else
  echo "Did not publish stable"
fi
