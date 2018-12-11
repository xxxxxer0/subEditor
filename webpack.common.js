const fs = require('fs')
const path = require('path')
const htmlPath = './src/'//遍历的html文件路径
const jsPath = htmlPath + 'js/'//遍历的js文件路径

function readEntryFile() {
    return _readDiffPath(htmlPath, /.html$/)
}

function _readDiffPath(path, reg) {
    var ret = []
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (filename) {
            if (reg.test(filename)) {
                var name = filename.slice(0, filename.lastIndexOf('.'))
                ret.push({
                    path: path,
                    name: name,
                    jsentry: jsPath + name + '.js',
                    htmlentry: path + filename
                })
            }
        })
        return ret
    }
    else {
        console.error("path:" + path + "not found")
        return false
    }
}
readEntryFile()
module.exports = readEntryFile