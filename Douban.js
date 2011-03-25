{
        "translatorID":"fc353b26-8911-4c34-9196-f6f567c93901",
        "label":"Douban",
        "creator":"Alwin Tsui<alwintsui@gmail.com> and Ace Strong<acestrong@gmail.com>",
        "target":"^https?://(?:www|book).douban.com",
        "minVersion":"2.0rc1",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-03-24 21:58:28"
}

/*
   Douban Translator
   Copyright (C) 2009-2010 Alwin Tsui <alwintsui@gmail.com>
   Modified from Douban.js by TAO Cheng, acestrong@gmail.com
   
   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
Alwin Tsui增强：
 *   - 用XPath识别所有带书名的书籍页面
 *   - 重写detectWeb、doWeb更通用
 *   - 重写trimTags和trimMultispace更安全
 *   - 可识别登录状态，加入自己tag而不是大家的tag
 *   - 可识别登录状态，加入自己note简短笔记
 */
// http://book.douban.com/

// #####Zetero API##########
function detectWeb(doc, url) 
{
    var pattern = /book\.douban\.com\/subject\/[0-9]+?[\S]*?/;
    if (pattern.test(url)) {
        return "book";
    }
    else {
        return "multiple";
    }
    return false;
}
function doWeb(doc, url) 
{
    var nsResolver = getResolver(doc);
    var arts = new Array();
    if (detectWeb(doc, url) == "multiple") 
    {
        var items = new Object();
        //识别<a> node，其href属性是以http://book.douban.com/subject/开头，其不含img子node，就人物是书籍node，不排除重复。
        var subjects = doc.evaluate('//a[starts-with(@href,"http://book.douban.com/subject/") and not(img)]', doc, nsResolver, XPathResult.ANY_TYPE, null);
        var subject;
        while (subject = subjects.iterateNext()) {
            items[subject.href] = subject.textContent.replace(/^\s*|\s*$/g, '');
        }
        //Zotero.debug('items');
        //Zotero.debug(items);
        if (items.__count__) 
        {
            // 弹出列表窗口，让用户选择要保存哪些文献
            items = Zotero.selectItems(items);
            if (!items) {
                return true;
            }
            for (var url in items) {
                arts.push(url);
            }
        }
    }
    else {
        arts = [url];
    }
    if (arts) {
        for (var i = 0; i < arts.length; i++) {
            scrape(arts[i]);
        }
    }
}
// #####LOCAL API##########
function getResolver(doc) 
{
    var namespace = doc.documentElement.namespaceURI;
    var nsResolver = namespace ? function (prefix) 
    {
        if (prefix == 'x') {
            return namespace;
        }
        else {
            return null;
        }
    }
     : null;
    return nsResolver;
}
function trimTags(text) 
{
    return text ? text.replace(/(<.*?>)/g, "") : text;
}
function trimMultispace(text) 
{
    return text ? text.replace(/\n\s+/g, "\n") : text;
}

// ##### Scraper functions #####
function scrape(url) 
{
    var page = Zotero.Utilities.retrieveSource(url);
    var pattern;
    // Zotero.debug(page);
    // 类型 & URL
    var itemType = "book";
    var newItem = new Zotero.Item(itemType);
    //      Zotero.debug(itemType);
    newItem.url = url;
    // 标题
    pattern = /<h1>([\s\S]*?)<\/h1>/;
    if (pattern.test(page)) 
    {
        var title = pattern.exec(page)[1];
        newItem.title = Zotero.Utilities.trim(trimTags(title));
        //              Zotero.debug("title: "+title);
    }
    // 又名
    pattern = /<span [^>]*?>又名:(.*?)<\/span>/;
    if (pattern.test(page)) 
    {
        var shortTitle = pattern.exec(page)[1];
        newItem.shortTitle = Zotero.Utilities.trim(shortTitle);
        //              Zotero.debug("shortTitle: "+shortTitle);
    }
    // 作者
    pattern = /<span><span [^>]*?>作者<\/span>:(.*?)<\/span>/;
    if (pattern.test(page)) 
    {
        var authorNames = trimTags(pattern.exec(page)[1]);
        pattern = /(\[.*?\]|\(.*?\)|（.*?）)/g;
        authorNames = authorNames.replace(pattern, "").split("/");
        //              Zotero.debug(authorNames);
        for (var i = 0; i < authorNames.length; i++) 
        {
            var useComma = true;
            pattern = /[A-Za-z]/;
            if (pattern.test(authorNames[i])) {
                // 外文名
                pattern = /,/;
                if (!pattern.test(authorNames[i])) {
                    useComma = false;
                }
            }
            newItem.creators.push(Zotero.Utilities.cleanAuthor( Zotero.Utilities.trim(authorNames[i]), 
            "author", useComma));
        }
    }
    // 译者
    pattern = /<span><span [^>]*?>译者<\/span>:(.*?)<\/span>/;
    if (pattern.test(page)) 
    {
        var translatorNames = trimTags(pattern.exec(page)[1]);
        pattern = /(\[.*?\])/g;
        translatorNames = translatorNames.replace(pattern, "").split("/");
        //              Zotero.debug(translatorNames);
        for (var i = 0; i < translatorNames.length; i++) 
        {
            var useComma = true;
            pattern = /[A-Za-z]/;
            if (pattern.test(translatorNames[i])) {
                // 外文名
                useComma = false;
            }
            newItem.creators.push(Zotero.Utilities.cleanAuthor( Zotero.Utilities.trim(translatorNames[i]), 
            "translator", useComma));
        }
    }
    // ISBN
    pattern = /<span [^>]*?>ISBN:<\/span>(.*?)<br\/>/;
    if (pattern.test(page)) 
    {
        var isbn = pattern.exec(page)[1];
        newItem.ISBN = Zotero.Utilities.trim(isbn);
        //              Zotero.debug("isbn: "+isbn);
    }
    // 页数
    pattern = /<span [^>]*?>页数:<\/span>(.*?)<br\/>/;
    if (pattern.test(page)) 
    {
        var numPages = pattern.exec(page)[1];
        newItem.numPages = Zotero.Utilities.trim(numPages);
        //              Zotero.debug("numPages: "+numPages);
    }
    // 出版社
    pattern = /<span [^>]*?>出版社:<\/span>(.*?)<br\/>/;
    if (pattern.test(page)) 
    {
        var publisher = pattern.exec(page)[1];
        newItem.publisher = Zotero.Utilities.trim(publisher);
        //              Zotero.debug("publisher: "+publisher);
    }
    // 丛书
    pattern = /<span [^>]*?>丛书:<\/span>(.*?)<br\/?>/;
    if (pattern.test(page)) 
    {
        var series = trimTags(pattern.exec(page)[1]);
        newItem.series = Zotero.Utilities.trim(Zotero.Utilities.unescapeHTML(series));
        //              Zotero.debug("series: "+series);
    }
    // 出版年
    pattern = /<span [^>]*?>出版年:<\/span>(.*?)<br\/>/;
    if (pattern.test(page)) 
    {
        var date = pattern.exec(page)[1];
        newItem.date = Zotero.Utilities.trim(date);
        //              Zotero.debug("date: "+date);
    }
    // 简介
    pattern = /<h2[^>]*?>(?:内容)?简介[\s\S]*?<\/h2>([\s\S]*?)<\/div>/;
    if (pattern.test(page)) 
    {
        var intro = pattern.exec(page)[1];
        intro = trimTags(intro.replace(/(<br\/>)/g, "\n"));
        pattern = /\(展开全部\)([\s\S]*)/;
        if (pattern.test(intro)) {
            intro = pattern.exec(intro)[1];
        }
        pattern = /\S/;
        if (pattern.test(intro)) {
            newItem.abstractNote = "图书简介：\n" + trimMultispace(intro);
        }
        //              Zotero.debug("abstractNote: "+newItem.abstractNote);
    }
    // 作者简介
    pattern = /<h2[^>]*?>作者简介[\s\S]*?<\/h2>([\s\S]*?)<\/div>/;
    if (pattern.test(page)) 
    {
        var intro = pattern.exec(page)[1];
        intro = trimTags(intro.replace(/(<br\/>)/g, "\n"));
        pattern = /\(展开全部\)([\s\S]*)/;
        if (pattern.test(intro)) {
            intro = pattern.exec(intro)[1];
        }
        if (newItem.abstractNote === undefined) {
            newItem.abstractNote = "作者简介：\n" + trimMultispace(intro);
        }
        else {
            newItem.abstractNote += "\n作者简介：\n" + trimMultispace(intro);
        }
        //              Zotero.debug("abstractNote: "+newItem.abstractNote);
    }
    // 丛书信息
    pattern = /<h2>丛书信息<\/h2>([\s\S]*?)<\/div>/;
    if (pattern.test(page)) 
    {
        var intro = pattern.exec(page)[1];
        intro = Zotero.Utilities.trimInternal(trimTags(intro));
        if (newItem.abstractNote === undefined) {
            newItem.abstractNote = "丛书信息：\n" + intro;
        }
        else {
            newItem.abstractNote += "\n丛书信息：\n" + intro;
        }
        //              Zotero.debug("abstractNote: "+newItem.abstractNote);
    }
    // 标签,如果是已经登录了，先读取自己，没有则选择通用tag
    pattern = /<input name="tags".*? value="([\s\S]*?)".*?\/>/;
    if (pattern.test(page)) 
    {
        var labels = pattern.exec(page)[1];
        labels_ary = labels.split(" ");
        for (var i in labels_ary) {
            newItem.tags.push(labels_ary[i]);
        }
        // Zotero.debug(labels_ary);
    }
    else
    {
        pattern = /<h2\s*?>豆瓣成员常用的标签([\s\S]*?)<\/div>/;
        if (pattern.test(page)) 
        {
            var labels = pattern.exec(page)[1];
            pattern = /<a [^>]*?>(.*?)<\/a>/g;
            var result = labels.match(pattern);
            for (var i = 0; i < result.length; i++) 
            {
                var label = trimTags(result[i]);
                if (label) {
                    newItem.tags.push(label);
                }
                //Zotero.debug(label);
            }
        }
    }
    //note，登录后，可以看到自己的笔记
    pattern = /<textarea name="comment"[^>]*?>([\s\S]*?)<\/textarea>/;
    if (pattern.test(page)) 
    {
        var note = pattern.exec(page)[1];
        if (note.length > 0) {
            newItem.notes.push({
                note : note
            });
        }
        // Zotero.debug(note);
    }
    newItem.complete();
}
