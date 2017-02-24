#!/bin/bash

pm2 startOrRestart /vagrant/ecosystem.json
echo "Starting Thimble server on http://localhost:3500/ (this may take a minute...)"
echo "Use 'npm run restart-server' to force a reload of the server"
echo "Use 'npm run logs' to see server logs for the node apps in the VM"
