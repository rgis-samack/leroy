@echo off
title Servidor do Mapa 3D
echo Iniciando o servidor local para carregar o Mapa 3D corretamente...
echo O navegador abrira em alguns segundos.

start http://localhost:8000
python -m http.server 8000
