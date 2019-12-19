<template>
	<view>
		<button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">微信登录</button>
	</view>
</template>

<script>
	const signModel = require('../../common/sign.js')
	var openid = null, session_key = null, pageOptions = null
	
	export default {
		data() {
			return {}
		},
		methods: {
			getUserInfo: function (resp) {
				let infoRes = resp.detail.userInfo
				let sign = uni.getStorageSync('sign')
				// 向后端登录
				uni.request({
					url: this.apiServer + `&c=member&m=login`,
					method: 'POST',
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: {
						openid: openid,
						name: infoRes.nickName,
						face: infoRes.avatarUrl,
						sign
					},
					success: res => {
						console.log(res)
						if (res.data.status && res.data.status === 'ok') {
							uni.showToast({
								title: '登录成功'
							})
							// 保存到 storage
							uni.setStorageSync('SUID', res.data.data.u_id + '')
							uni.setStorageSync('SRAND', res.data.data.u_random + '')
							uni.setStorageSync('SNAME', res.data.data.u_name + '')
							uni.setStorageSync('SFACE', res.data.data.u_face + '')
							
							// 跳转 回原页面 不同方式
							if (pageOptions.openType === 1) {
								uni.redirectTo({
									url: pageOptions.prePage
								})
							} else {
								uni.switchTab({
									url: pageOptions.prePage
								})
							}
							
						} else {
							uni.showToast({
								title: res.data
							})
						}
					},
					fail: () => {},
					complete: () => {}
				});
			}
		},
		onLoad: function(options) {
			pageOptions = options
			const _this = this
			
			// 获取临时签名
			signModel.sign(this.apiServer)
			let sign = uni.getStorageSync('sign')
			
			// 微信小程序
			// #ifdef MP-WEIXIN
			uni.login({
				success: (res) => {
					// console.log(res) // { errMsg, code }
					// code 给后端 向微信服务器换取 sessionid
					uni.request({
						url: _this.apiServer + '&c=member&m=codeToSession&code=' + res.code,
						method: 'GET',
						success: (resp) => {
							openid = resp.data.openid
							session_key = resp.data.session_key
							// console.log(session_key)
						}
					})
				},
				fail: (err) => {
					console.error(err)
				}
			})
			// #endif
			
			// app 平台
			// #ifdef APP-PLUS
			uni.login({
				provider: 'weixin',
				success: (res) => {
					// console.log(JSON.parse(res.authResult))
					// 获取用户信息
					uni.getUserInfo({
						provider: 'weixin',
						success: function(infoRes) {
							console.log(infoRes);
							uni.request({
								url: _this.apiServer + `&c=member&m=login`,
								method: 'POST',
								header: {
									'content-type': 'application/x-www-form-urlencoded'
								},
								data: {
									openid: infoRes.userInfo.openId,
									name: infoRes.userInfo.nickName,
									face: infoRes.userInfo.avatarUrl,
									sign
								},
								success: (res) => {
									console.log(res)
									if (res.data.status && res.data.status === 'ok') {
										uni.showToast({
											title: '登录成功'
										})
										// 保存到 storage
										uni.setStorageSync('SUID', res.data.data.u_id + '')
										uni.setStorageSync('SRAND', res.data.data.u_random + '')
										uni.setStorageSync('SNAME', res.data.data.u_name + '')
										uni.setStorageSync('SFACE', res.data.data.u_face + '')
										
										// 跳转 回原页面 不同方式
										if (options.openType === 1) {
											uni.redirectTo({
												url: options.prePage
											})
										} else {
											uni.switchTab({
												url: options.prePage
											})
										}
										
									} else {
										uni.showToast({
											title: res.data
										})
									}
								},
								fail: (err) => {
									uni.showToast({
										title: '登录失败'
									})
								}
							})
						},
						fail:function(err){
							uni.showToast({
								title: '获取用户信息失败',
								icon: 'none'
							})
						}
					})
				},
				fail:function(err){
					uni.showToast({
						title: '微信授权登录失败',
						icon: 'none'
					})
				}
			})
			// #endif
		}
	}
</script>

<style>

</style>
