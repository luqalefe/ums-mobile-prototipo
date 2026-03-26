#!/bin/bash
ssh -o StrictHostKeyChecking=no -R 80:localhost:8081 nokey@localhost.run > tunnel.log 2>&1 &
sleep 6
URL=
echo URL
