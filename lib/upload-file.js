'use strict'

const fs = require('fs')
const path = require('path')
const mime = require('mime')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

function uploadFile(fileName, filePath, bucket, prefix, s3lib) {
  s3lib = s3lib || s3
  prefix = prefix || ''

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, fileContent) => {
      if (err)
        return reject(err)

      resolve(fileContent)
    })
  })
    .then(fileContent => {
      let p = path.parse(fileName)
      let cleanName = fileName;
      if (p.ext === '.html'){
          cleanName = p.name
      }

      console.log('put file', fileName, 'cleanname', cleanName, 'ext', p.ext)

      return s3lib.putObject({
        Bucket: bucket,
        Key: prefix + cleanName,
        ContentType: mime.lookup(fileName),
        Body: fileContent,
        ACL: 'public-read'
      }).promise()
    })
}

module.exports = uploadFile
