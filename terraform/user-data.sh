#!/bin/bash
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y docker.io docker-compose-v2 git

systemctl enable --now docker

mkdir -p /opt/lab5

git clone \
  --branch "${repository_branch}" \
  --single-branch \
  "${repository_url}" \
  /opt/lab5/app

chown -R ubuntu:ubuntu /opt/lab5

cat > /opt/lab5/app/.env <<'ENVFILE'
POSTGRES_PASSWORD=${postgres_password}
ENVFILE

chmod 600 /opt/lab5/app/.env

cd /opt/lab5/app

docker compose up -d --build