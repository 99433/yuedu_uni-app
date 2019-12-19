# 阅读 uin-app

## 登录授权

### 小程序
```html
<button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">微信登录</button>
```
```js
<!-- 用户信息 -->
getUserInfo: (res) => {}

		// #ifdef MP-WEIXIN
			uni.login({
				success: (res) => {
					console.log(res)  // { errMsg, code }
					// code 给后端 向微信服务器换取 sessionid
					uni.request({
						url: _this.apiServer + '&c=member&c=codeToSession&code=' + res.code,
						method: 'GET',
						success: (resp) => {
							console.log(resp)
							/*
							openid,
							sessionkey
							*/
						}
					})
				},
				fail: (err) => {
					console.error(err)
				}
			})
		// #endif
```

### APP 端
```js
uni.login({
	success: (res) => {
		{
			"authResult": {
				"access_token": "28_wxhCIKEc2juyFJ8RrqQACWr3hXmcmALOzr6Si_o1Wl-JOMeUOK_k6KarCJRNnPkmbarCO0CG84Ai2RRWJ-0u1Esb9g8JGLypk--GnzywS0k",
				"expires_in": 7200,
				"refresh_token": "28_jD0PNbErUW2eFmyqD6DHadtfC2saNbDUy82UltRSAo_fgv4SDhq0C6lOuMfGZcC4tZfbPRF7y7yQDkPjhfQ9hoe-1ae1Hx5834ZyZMACnNs",
				"openid": "oRrdQt1lutqn03VuOBtEfyBEdBKU",
				"scope": "snsapi_userinfo",
				"unionid": "oU5YytwPx12sHas1JyAArNQ0xeis"
			},
			"errMsg": "login:ok"
		}
	 
	 uni.getUserInfo({
		 success: (info) => {
			 {
			 	"errMsg": "getUserInfo:ok",
			 	"rawData": "{\"openId\":\"oRrdQt1lutqn03VuOBtEfyBEdBKU\",\"nickName\":\"　\",\"gender\":0,\"city\":\"\",\"province\":\"\",\"country\":\"\",\"avatarUrl\":\"http://thirdwx.qlogo.cn/mmopen/vi_32/eiaW6nDJ3BSqJ0iaYRH2c0ibOTDZ4kI9waBUFubF0UBG30Xfp6l8s9WOkkMxgXiaOQvV7oPB2SgI3hz7fniaAxRawicA/132\",\"unionId\":\"oU5YytwPx12sHas1JyAArNQ0xeis\"}",
			 	"userInfo": {
			 		"openId": "oRrdQt1lutqn03VuOBtEfyBEdBKU",
			 		"nickName": "　",
			 		"gender": 0,
			 		"city": "",
			 		"province": "",
			 		"country": "",
			 		"avatarUrl": "http://thirdwx.qlogo.cn/mmopen/vi_32/eiaW6nDJ3BSqJ0iaYRH2c0ibOTDZ4kI9waBUFubF0UBG30Xfp6l8s9WOkkMxgXiaOQvV7oPB2SgI3hz7fniaAxRawicA/132",
			 		"unionId": "oU5YytwPx12sHas1JyAArNQ0xeis"
			 	},
			 	"signature": ""
			 }
			 
		 }
	 })
	}
})
```

### 多应用、多平台统一登录 `unionid`
- 微信开发者平台获取 企业账号 appid secret
- 获取 session_key 以及 encryptedData（userInfo 里的加密信息、第一次登录时出现）
- 微信提供的 解密 包
- 向 微信服务器换取 unionid

## 条件编译
```js
// app 平台
// #ifdef APP-PLUS
// #endif
```
## 后台 php

### MVC
- M(Model) 
重复代码的封装、复杂运算
1. 数据模型
2. 业务模型
- V(View)
前后不分离，渲染模板(ejs...)
- C(Controller)

### 安全加密签名
- `/common/md5.js` md5 加密
- `/common/sign.js` 签名
```js
// 1. 环境判断非uni环境不支持
if(!uni){return '...';}

// 2. getAccessToken 获取临时 token
uni.request({ url: apiServer+'getAccessToken', ...})

// 3. 对 accessToken 进行 md5 加密
// token + 时间戳 组合加密
var accessToken = md5.hex_md5(data.token + data.time);
// 4. 签名 = md5(accessToekn + time) + '-' + 'accessToekn';
var sign = accessToken + '-' + data.token;
```

> 服务端验证 token 后清除，token 只能使用一次，推荐 redis 缓存数据库保存，过期删除
