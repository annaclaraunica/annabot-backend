const { Boom } = require('@hapi/boom');
const NodeCache = require("node-cache");
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const cfonts = require('cfonts');
const pino = require('pino');
const chalk = require('chalk');
const mimetype = require('mime-types');
const fetch = require('node-fetch');
const axios = require("axios");
const cheerio = require('cheerio');
const { exec, spawn, execSync } = require('child_process');
const fs = require("fs")

const getRandom = (ext) => {
return `${Math.floor(Math.random() * 10000)}${ext}`;
};
const getExtension = async (type) => {
return await mimetype.extension(type)
}

function kyun(seconds){
    function pad(s){
    return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);
    return `${pad(hours)} horas, ${pad(minutes)} minutos e ${pad(seconds)} segundos.`
    }

function getFileTypeFromBuffer(buffer) {
    const header = buffer.toString('hex', 0, 4); // Pega os primeiros 4 bytes como string hexadecimal
    switch (header) {
        case '89504e47':
            return { ext: 'png', mime: 'image/png' };
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
            return { ext: 'jpg', mime: 'image/jpeg' };
        case '47494638':
            return { ext: 'gif', mime: 'image/gif' };
        case '49492a00':
            return { ext: 'tif', mime: 'image/tiff' };
        case '424d':
            return { ext: 'bmp', mime: 'image/bmp' };
        case '52494646': // WAV/AVI tem o mesmo prefixo, mas diferem no seguinte
            const riffType = buffer.toString('hex', 8, 12);
            if (riffType === '57415645') return { ext: 'wav', mime: 'audio/wav' };
            if (riffType === '41564920') return { ext: 'avi', mime: 'video/x-msvideo' };
            return { ext: 'unknown', mime: 'application/octet-stream' };

        // Áudios
        case '49443303':
            return { ext: 'mp3', mime: 'audio/mpeg' };
        case '4f676753':
            return { ext: 'ogg', mime: 'audio/ogg' };
        case '000001ba':
        case '000001b3':
            return { ext: 'mpg', mime: 'video/mpeg' };
        case '4d546864':
            return { ext: 'mid', mime: 'audio/midi' };

        // Vídeos
        case '00000018':
        case '00000020':
            return { ext: 'mp4', mime: 'video/mp4' };
        case '3026b275':
            return { ext: 'wmv', mime: 'video/x-ms-wmv' };
        case '1a45dfa3':
            return { ext: 'mkv', mime: 'video/x-matroska' };
        case '66747970': // QuickTime Movie (MOV)
            return { ext: 'mov', mime: 'video/quicktime' };

        // Documentos
        case '25504446':
            return { ext: 'pdf', mime: 'application/pdf' };
        case 'd0cf11e0': // Legacy Microsoft Office (doc/xls/ppt)
            return { ext: 'doc', mime: 'application/msword' };
        case '504b0304': // DOCX/XLSX/PPTX, ZIP, APK compartilham o mesmo magic number
            const zipType = buffer.toString('hex', 30, 34);
            if (zipType === '6d6c20') return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
            if (zipType === '786c20') return { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
            if (zipType === '707020') return { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
            if (buffer.toString('utf8', 0, 8).includes('META-INF/')) return { ext: 'apk', mime: 'application/vnd.android.package-archive' };
            return { ext: 'zip', mime: 'application/zip' };
        case '7b5c7274':
            return { ext: 'rtf', mime: 'application/rtf' };
        case '3c21444f':
            return { ext: 'html', mime: 'text/html' };
        case '3c3f786d':
            return { ext: 'xml', mime: 'application/xml' };

        // Arquivos compactados
        case '52617221':
            return { ext: 'rar', mime: 'application/x-rar-compressed' };
        case '1f8b0800':
            return { ext: 'gz', mime: 'application/gzip' };
        case '377abcaf': // Arquivo 7z
            return { ext: '7z', mime: 'application/x-7z-compressed' };

        // Arquivos de sistemas
        case '75737461':
            return { ext: 'tar', mime: 'application/x-tar' };
        case 'cafebabe': // Class file (Java)
            return { ext: 'class', mime: 'application/java-vm' };
        case '4d5a': // EXE/DLL (Windows executável)
            return { ext: 'exe', mime: 'application/vnd.microsoft.portable-executable' };
        case '7f454c46':
            return { ext: 'elf', mime: 'application/x-executable' };
        case '43443030':
            return { ext: 'iso', mime: 'application/x-iso9660-image' };

        default:
            return { ext: 'unknown', mime: 'application/octet-stream' };
    }
}

const usedCommandRecently = new Set()
const isFiltered = (from) => !!usedCommandRecently.has(from)
const addFilter = (from) => {
usedCommandRecently.add(from)
setTimeout(() => usedCommandRecently.delete(from), 5000)}

async function upload(buffer, originalFileName) {
    return new Promise(async (resolve, reject) => {
        try {
            const repoOwner = 'floxcloud';
            const repoName = 'uploadsFlox';
            const token = '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'; // Token diretamente no código
            const { ext, mime } = getFileTypeFromBuffer(buffer);
            if (!ext || ext === 'unknown') {
                throw new Error('Tipo de arquivo não suportado.');
            }
            const randomFileName = `${Date.now()}.${ext}`;
            let filePath;
            if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                filePath = `fotos/${randomFileName}`;
            } else if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) {
                filePath = `videos/${randomFileName}`;
            } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                filePath = `audios/${randomFileName}`;
            } else if (['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'zip', 'rar', '7z', 'iso', 'apk'].includes(ext)) {
                filePath = `documentos/${randomFileName}`;
            } else {
                filePath = `outros/${randomFileName}`; // Para tipos não especificados
            }
            const base64Content = buffer.toString('base64');
            const response = await axios.put(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
                {
                    message: `Uploading ${randomFileName}`,
                    content: base64Content
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            resolve(response.data.content.download_url);
        } catch (error) {
            reject(error);
        }
    });
}

    module.exports = { kyun, getRandom, getExtension, exec, spawn, execSync, addFilter, isFiltered, upload };