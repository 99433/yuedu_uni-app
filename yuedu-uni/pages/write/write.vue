<template>
	<view class="wrap">
		<!-- title -->
		<view class="write_title">
			<input type="text" v-model="title" placeholder="请输入标题" />
		</view>
		<!-- 内容展示区 -->
		<view class="artList" v-if="artList.length > 0">
			<block v-for="(item, index) in artList" :key="index">
				<view class="item" v-if="item.type == 'image'">
					<image :src="item.content" :data-index="index" mode="widthFix" @tap="removeImg" /></view>
				<view class="item" v-if="item.type == 'text'">
					<textarea placeholder="" v-model="item.content" />
					<view :data-index="index" class="deleteText" @tap="deleteText">删除</view>
				</view>
			</block>
		</view>
		<!-- 输入区 -->
		<form @submit="addText">
			<view class="inputArea">
				<view class="addImg" @tap="addImg">+图片</view>
				<view class="addText">
					<textarea name="artText" maxlength="-1" v-model="inputContent" placeholder="请输入文本" />
					<button type="primary" form-type="submit">添加</button>
				</view>
			</view>
		</form>
		<!-- 选择分类 -->
		<view class="art-cate">
			<view>文章分类</view>
			<view class="">
				<picker mode="selector" :range="caties" @change="cateChange">
					<view>{{caties[currentCateIndex]}}</view>
				</picker>
			</view>
		</view>
		<!-- 提交按钮 -->
		<view class="submitNow" v-if="artList.length > 0" @tap="submitNow">发布文章</view>
	</view>
</template>

<script>
	const signModel = require('../../common/sign.js')
	
	export default {
		data() {
			return {
				title: '',
				artList: [],
				inputContent: '',
				needUploadImg : [],
				uploadIndex : 0,
				//分类
				caties : ['点击选择'],
				currentCateIndex : 0,
				catiesFromApi : [],
				// 记录真实选择的api接口数据的分类id
				sedCateIndex  : 0,
				loginRes: []
			}
		},
		
		onLoad:function(){
			let loginRes = this.checkLogin('../write/write', 2)
			if (!loginRes) return
			// 保存登录状态 uid
			this.loginRes = loginRes
			// 签名
			signModel.sign(this.apiServer)
			// 加载文章分类
			uni.request({
				url: this.apiServer + '&c=category',
				method: 'GET',
				success: (res) => {
					if (res.data.status === 'ok') {
						// 把数据格式整理为 picker 支持的格式 ['分类名', ...]
						let categories = res.data.data
						for(let k in categories) {
							this.caties.push(categories[k])
						}
						// 记录分类信息
						this.catiesFromApi = categories
					}
				}
			})
		},
		
		methods: {
			cateChange: function(e){
				let sedIndex = e.detail.value
				this.currentCateIndex = sedIndex
				// 获取选择的分类名称
				if(sedIndex < 1) return
				let cateName = this.caties[sedIndex]
				for(let k in this.catiesFromApi) {
					if(cateName === this.catiesFromApi[k]) {
						this.sedCateIndex = k
						break
					}
				}
				this.currentCateIndex = sedIndex
			},
			
			addImg: function() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success: (res) => {
						this.artList.push({"type": "image", "content": res.tempFilePaths[0]})
					}
				})
			},
			
			removeImg: function(e) {
				let index = e.currentTarget.dataset.index
				uni.showModal({
					content: "确定要删除此图片吗",
					title: '提示',
					success: (e) => {
						if (e.confirm) {
							this.artList.splice(index, 1)
						}
					}
				})
			},
			
			// 添加文本
			addText: function(res) {
				let content = res.detail.value.artText
				if(content.length < 1) {
					uni.showToast({title: "请输入内容", icon: 'none'})
					return
				}
				this.artList.push({"type": "text", "content": content})
				this.inputContent = ''
			},
			// 删除文本
			deleteText: function(e) {
				let index = e.currentTarget.dataset.index
				uni.showModal({
					content: "确定要删除吗",
					title: '提示',
					success: (e) => {
						if (e.confirm) {
							this.artList.splice(index, 1)
						}
					}
				})
			},
			
			// 上传
			submitNow: function() {
				// 数据验证
				if(this.title.length < 2) { 
					uni.showToast({title: '请输入标题', icon: "none"}); return }
				if(this.artList.length < 1) { uni.showToast({title: '请填写文章内容', icon: "none"}); return }
				if(this.sedCateIndex < 1) { uni.showToast({title: '请选择分类', icon: "none"}); return }
				// 上传图片 一次一个多次上传 [ 递归函数 ]
				// 上传完成后整体提交数据
				// 首先整理一下需要上传的图片
				// this.needUploadImg = [{tmpurl : 临时地址, index : 数据索引}]
				this.needUploadImg = []
				for(let i = 0; i < this.artList.length; i++){
					if(this.artList[i].type == 'image') {
						this.needUploadImg.push({"tmpurl": this.artList[i].content, "indexID": i })
					}
				}
				this.uploadImg()
			},
			
			// 上传图片
			uploadImg: function () {
				// 如果没有图片 或者已经上传完成 则执行提交
				if(this.needUploadImg.length < 1 || this.uploadIndex >=  this.needUploadImg.length) {
					uni.showLoading({ title: "正在提交" })
					
					let sign = uni.getStorageSync('sign')
					
					uni.request({
						url: this.apiServer + '&c=art&m=add',
						method: 'POST',
						header: {'content-type': "application/x-www-form-urlencoded"},
						data: {
							title   : this.title,
							content : JSON.stringify(this.artList),
							uid     : this.loginRes[0],
							random  : this.loginRes[1],
							cate    : this.sedCateIndex,
							sign
						},
						success: (res) => {
							if(res.data.status === 'ok') {
								uni.showToast({title:"提交成功", icon:"none"})
								// 清空数据
								this.artList = []
								// 防止数据缓存
								this.currentCateIndex = 0
								this.sedCateIndex     = 0
								this.needUploadImg    = []
								this.title            = ''
								setTimeout(function(){
									uni.switchTab({
										url: '../my/my'
									})
								}, 1000)
							} else {
								uni.showToast({title: res.data.data, icon: "none"})
							}
						}
					})
				} else {
					uni.showLoading({ title: "上传图片" })
					// 上传图片
					uni.uploadFile({
						url      : this.apiServer + '&c=uploadimg',
						filePath : this.needUploadImg[this.uploadIndex].tmpurl,
						name     : 'file',
						success: (uploadFileRes) => {
							// 上传结果
							console.log(uploadFileRes)
							let res = JSON.parse(uploadFileRes.data)
							if(res.status !== 'ok') { uni.showToast({title: "上传图片失败,请重试!", icon: "none"}); return }
							// 将 上传后的 静态资源 图片路径返回 并替换 artList 中的临时路径 为真实 路径
							let index = this.needUploadImg[this.uploadIndex].indexID
							this.artList[index].content = this.staticServer + res.data
							this.uploadIndex++
							// 递归上传
							setTimeout(() => { this.uploadImg() }, 1000)
						},
						fail: (e) => {
							console.log(e)
							uni.showToast({title:"fail!", icon:"none"})
						}
					})
				}
			}
		}
	}
</script>

<style>

</style>
