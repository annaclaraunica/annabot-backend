#!/bin/bash

echo -e "\033[1;32iniciando a instalação dos pacotes necessários...\033[0m"

echo -e "\033[1;34m[1/6] Atualizando pacotes...\033[0m"
pkg update -y && pkg upgrade -y

echo -e "\033[1;34m[2/6] Instalando Yarn...\033[0m"
pkg install yarn -y

echo -e "\033[1;34m[3/6] Instalando Node.js...\033[0m"
pkg install nodejs -y

echo -e "\033[1;34m[4/6] Instalando Git...\033[0m"
pkg install git -y

echo -e "\033[1;34m[5/6] Acessando o diretório do bot...\033[0m"
cd /storage/downloads/AnnaBot || { 
    echo -e "\033[1;31mErro: O diretório /storage/downloads/AnnaBot não existe!\033[0m";
    exit 1;
}

echo -e "\033[1;34m[6/6] Iniciando o bot...\033[0m"
sh start.sh || {
    echo -e "\033[1;31mErro: Não foi possível executar o script start.sh!\033[0m";
    exit 1;
}

echo -e "\033[1;32mInstalação concluída com sucesso!\033[0m"