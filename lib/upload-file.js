'use strict'

const fs = require('fs')
const path = require('path')
const mime = require('mime')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const FileType = require('file-type');

function uploadFile(fileName, filePath, bucket, prefix, s3lib) {
    return _uploadFile(fileName, filePath, bucket, prefix, s3lib);
}

async function _uploadFile(fileName, filePath, bucket, prefix, s3lib) {
    prefix = prefix || ''
    s3lib = s3lib || s3
    const content = await _readFile(filePath);

    let p = path.parse(fileName);
    let cleanName = fileName;
    if (p.ext === '.html'){
        cleanName = p.name;
    }

    let _mime = mime.lookup(fileName);
    if (_mime === 'application/octet-stream') {
        _mime = await guessMimeType(content);
    }

    console.log('put file', fileName, 'cleanname', cleanName, 'ext', p.ext, 'mime', _mime);

    await s3lib.putObject({
        Bucket: bucket,
        Key: prefix + cleanName,
        ContentType: _mime,
        Body: content,
        ACL: 'public-read'
    }).promise();
}

async function guessMimeType(content) {
    let _mime = 'application/octet-stream';
    const ft = await FileType.fromBuffer(content);
    if (ft !== undefined){
        _mime = ft.mime;
    }

    if (_mime !== 'application/xml' && _mime !== 'application/octet-stream') {
        return _mime;
    }

    const start = content.toString('utf8', 0, 5);
    if (start.startsWith('<svg')) {
        return 'image/svg+xml';
    }

    if (_mime !== 'application/xml') {
        return _mime;
    }

    // if xml, search for svg in start, maybe we can still save this svg image
    const subcontent = content.toString('utf8', 0, 200);
    if (subcontent.indexOf('<svg') !== -1) {
        return 'image/svg+xml';
    }

    return _mime;
}

function _readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, fileContent) => {
      if (err)
        return reject(err)

      resolve(fileContent)
    });
  });
}

module.exports = uploadFile
