import Vue from 'vue'
import store from '@/store'

/**
 * Action 权限指令
 * 指令用法：
 *  - 在需要控制 action 级别权限的组件上使用 v-action:[method] , 如下：
 *    <i-button v-action:add >添加用户</a-button>
 *    <a-button v-action:delete>删除用户</a-button>
 *    <a v-action:edit @click="edit(record)">修改</a>
 *
 *  - 当前用户没有权限时，组件上使用了该指令则会被隐藏
 *  - 当后台权限跟 pro 提供的模式不同时，只需要针对这里的权限过滤进行修改即可
 *
 *  @see https://github.com/sendya/ant-design-pro-vue/pull/53
 */
const permission = Vue.directive('permission', {
  inserted: function (el, binding, vnode) {
    const userInfo = store.getters.userInfo
    if (userInfo && userInfo.is_super) {
      return
    }

    const permission = binding.arg.replace(/-/g, '.')
    const permissions = store.getters.permissions || {}
    if (permission.split('.').length >= 3 && permissions[permission]) {
      return
    }

    const routePermission = vnode.context.$route.meta.permission
    const pgcs = routePermission.split('.')
    if (pgcs.length >= 3) {
      if (permissions[pgcs[0] + '.' + pgcs[1] + '.' + permission]) {
        return
      }
    } else {
      if (permissions[routePermission + '.' + permission]) {
        return
      }
    }

    el.parentNode && el.parentNode.removeChild(el) || (el.style.display = 'none')
  }
})

export default permission
