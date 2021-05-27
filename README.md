## picgo-plugin-rename-file



A PicGo plugin for customizing file name.

可以很自定义生成文件存储路径的插件，文件(包括路径)名称支持日期、随机字符串、文件MD5、原文件名、原文件目录结构等规则。

更多需求，欢迎PR或提ISSUE。


---

## 例如

`2020/07/24/674b96a992fac527a8332ac4adc89a14-filename-fa2c97-19-44-17.png`

---

## 修改配置参数后生效

![配置](https://raw.githubusercontent.com/liuwave/picgo-plugin-rename-file/master/images/config.png)


format，文件(路径)格式，默认为空，自定义文件路径及文件名，例如：

    fix-dir/{localFolder:2}/{y}/{m}/{d}/{h}-{i}-{s}-{hash}-{origin}-{rand:6}
    
上传文件名为`/images/test/localImage.jpg`的文件时，会重命名为

    fix-dir/images/test/2020/07/24/21-40-31-36921a9c364ed4789d4bc684bcb81d62-localImage-fa2c97.jpg



命名规则：

- {y} 年，4位
- {m} 月，2位
- {d} 日期，2位
- {h} 小时，2位
- {i} 分钟，2位
- {s} 秒，2位
- {ms} 毫秒，3位(**v1.0.4**)
- {timestamp} 时间戳(秒)，10位(**v1.0.4**)
- {md5:&lt;length&gt;}，文件的 md5 值，<length>表示长度，最短 8 位，默认为 32 位
- {hash:&lt;length&gt;}，同 md5
- {sha1:&lt;length&gt;}，文件的 sha1 值，<length>表示长度，最短 8 位，默认为 40 位
- {origin}，文件原名（会去掉后缀）
- {rand:&lt;count&gt;}, 随机数，&lt;count&gt;表示个数，默认为6个，示例：{rand：32}、{rand}
- {localFolder:&lt;count&gt;}, &lt;count&gt;表示层级 ，默认为1，示例：{localFolder:6}、{localFolder}


---
### 版权声明

MIT

从 [gclove/picgo-plugin-super-prefix](https://github.com/gclove/picgo-plugin-super-prefix) fork而来，
做了些修改。