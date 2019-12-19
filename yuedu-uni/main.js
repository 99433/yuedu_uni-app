import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

/**
 * check login 重定向至登录页面
 * @param prePage 记录前一个页面,登录后返回
 * @param openType 跳转方式(navigateTo|redirectTo|switchTab)
*/

Vue.prototype.checkLogin = function (prePage, openType) {
	let SUID = uni.getStorageSync('SUID')
	let SRAND = uni.getStorageSync('SRAND')	// 随机码
	let SNAME = uni.getStorageSync('SNAME')
	let SFACE = uni.getStorageSync('SFACE')
	
	// 重定向 - 登录
	if (!SUID || !SRAND || !SFACE) {
		uni.redirectTo({
			url: `../login/login?prePage=${prePage}&openType=${openType}`
		})
		return false
	}
	
	return [SUID, SRAND, SNAME, SFACE]
}

/**
 * 后端接口 - hcode 的框架
 * @param {string} token=api2018 必须 token验证
 * @param {string} c=member 			控制器
 * @param {string} m=login 				方法method
 * http://yuedu.api.me/index.php?token=api2018&c=index&m=test
 * */
Vue.prototype.apiServer = 'http://192.168.0.233/yuedu/index.php?token=api2018'
Vue.prototype.staticServer = 'http://192.168.0.233/yuedu/'

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
