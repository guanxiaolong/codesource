/**
 *
 * User: 管小龙
 * Date: 2019-12-30
 * Time: 11:29
 *
 */

const attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)=("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/
//const attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/

//console.log("class=abc".match(attr));
//console.log("class='abc'".match(attr));


let html = '<div class="classAttr" data-type="dataType" data-id="dataId" style="color:red">我是外层div<span>我是内层span</span></div>';

function AST(html) {
    const startTag = /<([a-zA-Z_][\w\-\.]*)((?:\s+([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))*)\s*(\/?)>/;

    const endTag = /<\/([a-zA-Z_][\w\-\.]*)>/;

    const attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

    const bufArray = [];
    //用了存储未匹配完成的起始标签
    const results = {
        node: "root",
        child: []
    };
    //定义一个开始的 AST 的节点
    let chars;
    let match;
    let last;
    while (html && last != html) {
        last = html;
        chars = true; // 是不是文本内容
        if (html.indexOf("</") == 0) {
            match = html.match(endTag);
            if (match) {
                chars = false;
                html = html.substring(match[0].length);
                match[0].replace(endTag, parseEndTag);
            }
        } else if (html.indexOf("<") == 0) {
            match = html.match(startTag);
            if (match) {
                chars = false;
                html = html.substring(match[0].length);
                match[0].replace(startTag, parseStartTag);
            }
        }
        if (chars) {
            let index = html.indexOf("<");
            let text;
            if (index < 0) {
                text = html;
                html = "";
            } else {
                text = html.substring(0, index);
                html = html.substring(index);
            }
            const node = {
                node: "text",
                text
            };
            pushChild(node);
        }
    }
    function pushChild(node) {
        if (bufArray.length === 0) {
            results.child.push(node);
        } else {
            const parent = bufArray[bufArray.length - 1];
            if (typeof parent.child == "undefined") {
                parent.child = [];
            }
            parent.child.push(node);
        }
    }
    function parseStartTag(tag, tagName, rest) {
        tagName = tagName.toLowerCase();

        const ds = {};
        const attrs = [];
        let unary = !!arguments[7];

        const node = {
            node: "element",
            tag: tagName
        };
        rest.replace(attr, function(match, name) {
            const value = arguments[2]
                ? arguments[2]
                : arguments[3]
                    ? arguments[3]
                    : arguments[4]
                        ? arguments[4]
                        : "";
            if (name && name.indexOf("data-") == 0) {
                ds[name.replace("data-", "")] = value;
            } else {
                if (name == "class") {
                    node.class = value;
                } else {
                    attrs.push({
                        name,
                        value
                    });
                }
            }
        });
        node.dataset = ds;
        node.attrs = attrs;
        if (!unary) {
            bufArray.push(node);
        } else {
            pushChild(node);
        }
    }
    function parseEndTag(tag, tagName) {
        let pos = 0;
        for (pos = bufArray.length - 1; pos >= 0; pos--) {
            if (bufArray[pos].tag == tagName) {
                break;
            }
        }
        if (pos >= 0) {
            pushChild(bufArray.pop());
        }
    }
    return results;
}
console.log(JSON.stringify(AST(html)));