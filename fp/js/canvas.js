/**
 *
 * User: 管小龙
 * Date: 2020-05-20
 * Time: 16:17
 *
 */

function bin2hex(s) {
    var i, l, o = '',
        n;

    s += '';

    for (i = 0, l = s.length; i < l; i++) {
        n = s.charCodeAt(i)
            .toString(16);
        o += n.length < 2 ? '0' + n : n;
    }

    return o;
}
function fp() {
    let canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext('2d');
    var txt = 'demaxiya';
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);
    var b64 = canvas.toDataURL().replace("data:image/png;base64,","");
    var bin = atob(b64); // 解码使用 base-64 编码的字符串
    var crc = bin2hex(bin.slice(-16,-12)); //ASCII字符的字符串转换为六进制值的字符串
    return crc;
}
