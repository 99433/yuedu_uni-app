<template>
	<view>
		<view class="grace-header-cate">
			<scroll-view class="grace-tab-title grace-center" scroll-x="true" id="grace-tab-title">
				<view v-for="(cate, index) in categories" :key="index" :data-cateid="cate.cateId" :data-index="index" :class="[cateCurrentIndex == index ? 'grace-tab-current' : '']"
				 @tap="tabChange">{{cate.name}}</view>
			</scroll-view>
		</view>
		<view style="height: 40px;"></view>
		<!-- 文章内容区 -->
		<view class="grace-news-list">
			<block v-for="(item, index) in artList" :key="index">
				<!-- 一张图 -->
				<navigator v-if="item.art_content.length < 3" open-type="navigate" :url="'../info/info?artid='+item.art_id">
					<view class="grace-news-list-img-news">
						<view class="grace-news-list-title-main">{{item.art_title}}</view>
						<view class="grace-news-list-img-big">
							<image :src="item.art_content[0]" mode="widthFix"></image>
						</view>
					</view>
				</navigator>
				<!-- 三张图 -->
				<navigator v-if="item.art_content.length >= 3" :url="'../info/info?artid='+item.art_id">
					<view class="grace-news-list-img-news">
						<view class="grace-news-list-title-main">{{item.art_title}}</view>
						<view class="grace-news-list-imgs">
							<view class="imgs">
								<image :src="item.art_content[0]" mode="widthFix"></image>
							</view>
							<view class="imgs">
								<image :src="item.art_content[1]" mode="widthFix"></image>
							</view>
							<view class="imgs">
								<image :src="item.art_content[2]" mode="widthFix"></image>
							</view>
						</view>
					</view>
				</navigator>
			</block>
		</view>
	</view>
</template>

<script>
	const sign = require('../../common/sign.js')

	export default {
		data() {
			return {
				categories:[{cateId : 0, name : "全部"}],
				cateCurrentIndex : 0,
				artList : [],
				cate: 0,
				page: 1
			}
		},
		onLoad() {
			sign.sign(this.apiServer)

			// 加载文章分类
			uni.request({
				url: this.apiServer + '&c=category',
				success: (res) => {
					if (res.data.status === 'ok') {
						let cates = res.data.data
						for(let k in cates){
							this.categories.push({cateId : k, name : cates[k]})
						}
					}
				},
				fail: (err) => {
					console.log(err)
				}
			})
			
			this.getNewsList()

		},
		// 下拉刷新
		onPullDownRefresh: function() {
			console.log('下拉刷新')
			this.page = 1
		  this.artList = []
		  this.getNewsList()
		},
		// 底部加载
		onReachBottom: function() {
			console.log('底部加载')
			this.getNewsList()
		},
		methods: {
			tabChange: function(e) {
        let cateid = e.currentTarget.dataset.cateid
        let index = e.currentTarget.dataset.index

        this.page = 1
        this.cateCurrentIndex = index
        this.cate = cateid
        this.artList = []

				this.getNewsList()
			},
			
			getNewsList: function () {
				uni.showLoading({'title':"加载中..."})

				uni.request({
					url: this.apiServer + '&c=art&m=getList&cate=' + this.cate + '&page=' + this.page,
					success: (res) => {
						// console.log(res)
						if(res.data.status == 'ok') {
							let newsList = res.data.data
							
							for(let i = 0; i < newsList.length; i++) {
								let content = JSON.parse(newsList[i].art_content),
										imgs 		= []

								// 把图片分离出来
								for(let ii = 0; ii < content.length; ii++) {
									if(content[ii].type === 'image') {
										imgs.push(content[ii].content)
									}
								}
								// 图片替换内容，只展示 title 和 图片 再首页
								newsList[i].art_content = imgs
							}
							this.artList = this.artList.concat(newsList)
							
							uni.hideLoading()
							this.page++
						} else if (res.data.status === 'empty') {
							uni.showToast({
								title: "没有更多数据",
                icon: "none"
               })
						}
					},
					fail: (err) => {
						console.log(err)
					},
					complete: function() {
						uni.stopPullDownRefresh()
          }
				})
			}
		}
	}
</script>

<style>

</style>
