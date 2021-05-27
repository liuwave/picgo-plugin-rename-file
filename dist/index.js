"use strict";
const path = require('path');
const crypto = require('crypto');
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
const pluginConfig = ctx => {
    let userConfig = ctx.getConfig('picgo-plugin-rename-file');
    if (!userConfig) {
        userConfig = {};
    }
    return [
        {
            name: 'format',
            type: 'input',
            alias: '文件(路径)格式',
            default: userConfig.format || '',
            message: '例如 fix-dir/{localFolder:2}/{y}/{m}/{d}/{h}-{i}-{s}-{hash}-{origin}-{rand:5}',
            required: false
        }
    ];
};
module.exports = (ctx) => {
    const register = () => {
        ctx.helper.beforeUploadPlugins.register('rename-file', {
            handle: async function (ctx) {
                // console.log(ctx)
                const autoRename = ctx.getConfig('settings.autoRename');
                if (autoRename) {
                    ctx.emit('notification', {
                        title: '❌ 警告',
                        body: '请关闭 PicGo 的 【时间戳重命名】 功能,\nrename-file 插件重命名方式会被覆盖'
                    });
                    await sleep(10000);
                    throw new Error('rename-file conflict');
                }
                const format = ctx.getConfig('picgo-plugin-rename-file.format') || '';
                ctx.output = ctx.output.map((item, i) => {
                    let fileName = item.fileName;
                    if (format) {
                        let currentTime = new Date();
                        let formatObject = {
                            y: currentTime.getFullYear(),
                            m: currentTime.getMonth() + 1,
                            d: currentTime.getDate(),
                            h: currentTime.getHours(),
                            i: currentTime.getMinutes(),
                            s: currentTime.getSeconds(),
                            ms: currentTime.getTime().toString().slice(-3),
                            timestamp: currentTime.getTime().toString().slice(0, -3)
                        };
                        // 去除空格
                        fileName = format.trim()
                            // 替换日期
                            .replace(/{(y|m|d|h|i|s|ms|timestamp)}/gi, (result, key) => {
                            return (typeof formatObject[key] === 'number' && formatObject[key] < 10 ? '0' : '') + formatObject[key];
                        })
                            // 截取本地目录
                            .replace(/{(localFolder:?(\d+)?)}/gi, (result, key, count) => {
                            if (ctx.input[i]) {
                                count = Math.max(1, (count || 0));
                                let paths = path.dirname(ctx.input[i]).split(path.sep);
                                key = paths.slice(0 - count).reduce((a, b) => `${a}/${b}`);
                            }
                            return key.replace(/:/g, '');
                        })
                            // 随机字符串
                            .replace(/{(rand:?(\d+)?)}/gi, (result, key, count) => {
                            if (key === 'rand' || key.indexOf('rand:') === 0) {
                                count = Math.min(Math.max(1, (count || 6)), 32);
                                return crypto.randomBytes(Math.ceil(count / 2)).toString('hex').slice(0, count);
                            }
                        })
                            // 文件 hash 值，可选 md5 或 sha1 算法，默认 md5，可以设置长度
                            .replace(/{((md5|sha1|hash):?(\d+)?)}/gi, (result, str, key, length) => {
                            let algorithm = 'md5';
                            if (['hash', 'md5'].includes(key)) {
                                length = Math.max(8, (length || 32));
                            }
                            if (key === 'sha1') {
                                length = Math.max(8, (length || 40));
                                algorithm = 'sha1';
                            }
                            const hash = crypto.createHash(algorithm);
                            hash.update(item.buffer);
                            return hash.digest('hex').slice(0, length);
                        })
                            // 字符串替换
                            .replace(/{(origin|\w+)}/gi, (result, key) => {
                            // 文件原名
                            if (key === 'origin') {
                                return fileName.substring(0, Math.max(0, fileName.lastIndexOf('.')) || fileName.length)
                                    .replace(/[\\\/:<>|"'*?$#&@()\[\]^~]+/g, '-');
                            }
                            return key;
                        })
                            // 去除多余的"/"
                            .replace(/[\/]+/g, '/');
                        if (fileName.slice(-1) === '/') {
                            fileName += i;
                        }
                        fileName += item.extname;
                    }
                    item.fileName = fileName;
                    return item;
                });
            },
            config: pluginConfig
        });
    };
    return {
        register,
        config: pluginConfig
    };
};
