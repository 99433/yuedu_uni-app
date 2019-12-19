<template>
	<view>
		<view class="myface">
			<image :src="myFace" mode="widthFix"></image>
		</view>
		<view style="text-align:center; margin:10px 0;">
			{{user.u_name}} <text style="color: #888888;" @tap="logoff">注销</text>
		</view>
		<view class="grace-box-banner" style="margin:10rpx 0;">
			<view class="garce-items">
				<view class="line1">{{user.artCount}}</text></view>
				<view class="line2">文章</view>
			</view>
			<view class="garce-items">
				<view class="line1">{{user.u_integral}}</text></view>
				<view class="line2">积分</view>
			</view>
			<view class="garce-items">
				<view class="line1">{{user.u_remainder}}</text></view>
				<view class="line2">余额</view>
			</view>
			<view class="garce-items">
				<view class="line1">0</text></view>
				<view class="line2">消息</view>
			</view>
		</view>
		<view class="grace-title grace-nowrap grace-space-between">
			<view class="grace-h5 grace-blod">我的文章</view>
		</view>
		<view class="myart-list" v-for="(item, index) in arts" :key="index">
			<view class="title">{{item.art_title}}</view>
			<view class="btns">
				<view :data-artid="item.art_id" @tap="editArt">编辑</view>
				<view :data-artid="item.art_id" :data-index="index" @tap="removeArt">删除</view>
			</view>
		</view>
		<view class="loadMore" @tap="getArtList">{{loadMore}}</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				myFace: '',
				user: {},
				arts: [],
				loadMore: '点击加载更多',
				page: 1,
				loginRes: {}
			}
		},
		methods: {
			// 文章列表
			getArtList: function () {
				if(this.loadMore !== '点击加载更多'){ return }
				this.loadMore = '加载中...'
				uni.request({
					url: this.apiServer + '&c=my&m=arts&page=' + this.page,
					method: 'POST',
	        header: {'content-type': "application/x-www-form-urlencoded"},
          data: {
            uid : this.loginRes[0],
            random : this.loginRes[1]
          },
					success: (res) => {
						if(res.data.status == 'ok') {
							this.arts = this.arts.concat(res.data.data)
							this.page++
							this.loadMore = '点击加载更多'
						} else if(res.data.status === 'empty') {
								this.loadMore = '已经加载全部'
						} else {
								this.loadMore = '点击加载更多'
						}
					}
				})
			},
			
			// 删除文章
			removeArt: function (e) {
				let artId = e.currentTarget.dataset.artid,
						index = e.currentTarget.dataset.index
				
				uni.showModal({
					title: '提示',
					content: '确认删除',
					success: (e) => {
						if(e.confirm === true) {
							uni.request({
								url: this.apiServer + '&c=my&m=removeArt',
								method: 'POST',
								header: {'content-type': "application/x-www-form-urlencoded"},
								data: {
									uid : this.loginRes[0],
									random : this.loginRes[1],
									artId : artId
								},
								success: res => {
									if(res.data.status == 'ok'){
										uni.showToast({title: "已删除", icon:"none"})
											this.arts.splice(index, 1)
									} else {
										uni.showToast({title: "删除失败", icon:"none"})
									}
								}
							})
						}
					}
				})
			},
			
			// 跳转后编辑
			editArt: function (e) {
				let artId = e.currentTarget.dataset.artid		
				uni.navigateTo({
					url:"../editArt/editArt?artId=" + artId
				})
			},
			// 退出登录
			logoff: function () {
				uni.removeStorageSync('SUID')
				uni.removeStorageSync('SRAND')
				uni.showToast({
					title: "您已经退出悦读",
					icon: "none"
				});
				setTimeout(function(){
					uni.switchTab({
						url:'../index/index'
					})
				}, 1000)
			}
		},
		onLoad: function() {
			let loginRes = this.checkLogin('../my/my', 2)
			if (!loginRes) return
			this.myFace = loginRes[3]
		},
		onShow: function() {
			let	loginRes = this.checkLogin('../my/my', '2')
			if (!loginRes) return
			
			this.loginRes = loginRes
			
			// 加载会员信息
			uni.request({
				url: this.apiServer + '&c=my&m=info',
				method: 'POST',
				header: {'content-type' : "application/x-www-form-urlencoded"},
				data: {
					uid: loginRes[0],
					random : loginRes[1]
				},
				success: res => {
					if(res.data.status === 'ok'){
						this.user = res.data.data
					}
				}
			})
			
			this.arts = []
			this.page = 1
			this.loadMore = '点击加载更多'
			this.getArtList()
		}
	}
</script>

<style>
.myface{width:88px; height:88px; border:5px solid #F1F2F3; border-radius:100%; margin:15px auto;}
.myface image{width:100%; border-radius:100%;}
.myart-list{width:100%; margin:8px 0; overflow:hidden; border-bottom:1px dashed #D7D8D9;}
.myart-list .title{line-height:2em; width:100%;}
.myart-list .btns{line-height:2em; width:100%;}
.myart-list .btns view{float:right; padding:0 6px; margin:0 5px; color:#00B26A;}
.myart-list .btns view:last-child{color:#F76260;}
.loadMore{width:100%; padding:8px 0; text-align:center; color:#CCCCCC;}
</style>
