#!/bin/bash

echo "🧹 Limpando processos antigos..."
pkill -f "ssh.*localhost.run" 2>/dev/null
pkill -f "expo start" 2>/dev/null
sleep 1

echo "🔗 Criando túnel SSH..."
ssh -o StrictHostKeyChecking=no -R 80:localhost:8081 nokey@localhost.run > tunnel.log 2>&1 &
TUNNEL_PID=$!
sleep 8

URL=$(grep -oP 'https://[a-z0-9]+\.lhr\.life' tunnel.log | head -1)

if [ -z "$URL" ]; then
  echo "❌ Não foi possível obter a URL do túnel. Verifique tunnel.log"
  cat tunnel.log
  exit 1
fi

echo ""
echo "✅ Túnel ativo!"
echo "🌐 URL: $URL"
echo ""
echo "Agora rode em outro terminal:"
echo "  cd $(pwd) && EXPO_PACKAGER_PROXY_URL=$URL npx expo start --port 8081"
echo ""
