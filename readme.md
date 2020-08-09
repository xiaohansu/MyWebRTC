# WEBRTC code
项目的主要目的适用于webrtc的学习，记录一些学习过程，还有一些操作备注

## 项目内容
> clientA & clientB

模拟点对点的视屏通话

> alice & bob

单方向视屏传播（类似主播模式）

## 在express框架上搭建https
webrt无法在http下使用
可以在`chrome://flags`，`insecure origins treated as secure`添加服务端的地址，如：
```bash
http://xxx.xxx.xxx.xxx:8080
```

>  配置自签名证书
https://www.jianshu.com/p/9072dce6eb2e

```bash
# 1 
mkdir certificate && cd certificate
# 2
openssl
# 3 私钥
genrsa -out private.pem 2048
# 4 签名证书
req -new -key private.pem -out csr.pem
# ... ...
# 5 证书文件
x509 -req  -in csr.pem -signkey private.pem -out csr.crt
# 6 在express添加配置
... ...
let privateKey  = fs.readFileSync('private.pem', 'utf8');
let certificate = fs.readFileSync('csr.crt', 'utf8');
let cert = {key: privateKey, cert: certificate};
let httpServer = http.createServer(app);
let httpsServer = https.createServer(cert, app);
... ... 

```

**chrome不安全链接提醒：鼠标点击浏览器空白处，键入：thisisundafe，回车**


## 学习链接
https://www.w3.org/TR/webrtc/#intro

https://webrtc.github.io/samples/

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

https://janus.conf.meetecho.com/docs/README.html

https://hpbn.co/webrtc/