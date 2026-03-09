#!/usr/bin/env bash

# run local backend and frontend: ./run.sh

cd backend
npm run start &
cd ../site
npm run start && fg
