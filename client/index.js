var appid = "wx1fb65a4ee2266c01";
var secret = "07d528cf1fed8735e68fdbba76e4080d";

var request = require('request'),
    cache = require('memory-cache');

var express = require('express');

var sign = require('./sign.js');

var app = express();
app.use('/wx', express.static('static'));


//获得签名
app.get('/createsign', function (req, res) {
    var url = decodeURIComponent(req.query.url);
    var  jsapi_ticket;
    //判断是否有缓存ticket
    if (cache.get('ticket')) {
        jsapi_ticket = cache.get('ticket');
        var ret = sign(jsapi_ticket,url);
        res.send(ret)
    } else {
        //生成token，这里需要用到appid和secret，这里注意替换
        request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var tokenMap = JSON.parse(body);
                //根据token生成ticket
                request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tokenMap.access_token + '&type=jsapi', function (error, resp, json) {
                    if (!error && response.statusCode == 200) {
                        var ticketMap = JSON.parse(json);
                        //设置过期时间
                        cache.put('ticket', ticketMap.ticket, (1000 * 60 * 60 * 24));  //加入缓存
                        jsapi_ticket = ticketMap.ticket;
                        var ret = sign(jsapi_ticket,url);
                        res.send(ret)
                        //将信息返回
                    }
                })
            }
        })
    }
});

app.listen(process.env.PORT || 5050)
