# Latest Zotero Translator List #
## 1.中国知网CNKI Web Translator【_已停止更新_】 ##
CNKI\_FULL.js是CNKI.js的增强版（GUID不同），支持联合数据库搜索
  * 可识别单一和联合数据库搜索 (数据库识别部分完全重写了)
  * 支持单篇和多篇下载
  * 异步方式下载，速度更快
  * 支持所有五种类型的文章：期刊，辑刊，会议，报纸和学位论文

  1. 最新CNKI\_FULL下载地址：http://zotero-trans.googlecode.com/files/CNKI_FULL.js
  1. 原CNKI.js下载地址： https://bitbucket.org/acestrong/zotero-translators-chn/src/tip/CNKI.js

## 2.豆瓣书籍网 Web Translator ##
最新版增强功能：

  * 用XPath识别所有带书名的书籍页面
  * 重写detectWeb、doWeb更通用
  * 重写trimTags和trimMultispace更安全
  * 可识别登录状态，加入用户自己的tag而不是大家的tag
  * 可识别登录状态，加入用户自己的简短笔记（note）

  1. 最新豆瓣网的Douban.js下载地址：http://zotero-trans.googlecode.com/files/Douban.js
  1. 原版下载：https://bitbucket.org/acestrong/zotero-translators-chn/src/tip/Douban.js

# Translator安装方法 #
本站所有源码文件采用hg管理，获取命令为：
hg clone https://zotero-trans.googlecode.com/hg/ zotero-trans

也可以在线浏览下载：
http://code.google.com/p/zotero-trans/source/browse/

建议使用Zotero 2.0以上版本，只要把下载的相应js文件放在zotero的安装目录，也就是zotero->translators目录下，不同操作系统Zotero的安装路径不同，放置后重启Firefox即可。

注意：修改脚本代码后需要重启firefox才能生效。

# 开发帮助 #
  1. http://niche-canada.org/member-projects/zotero-guide/chapter1.html
  1. http://www.zotero.org/support/dev/creating_translators_for_sites