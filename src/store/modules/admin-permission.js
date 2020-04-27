import { asyncRouterMap, constantRouterMap } from '@/config/router.config'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
function hasPermission (permissions, route) {
  if (route.meta && route.meta.permission) {
    if (permissions[route.meta.permission]) {
      return true
    }
    return false
  }
  return true
}

function fillAsyncMenus (routerMap) {
  const menuKeys = {}
  routerMap.forEach(route => {
    if (route.hidden) {
      return
    }
    const permissions = (route.meta && route.meta.permission || '').split('.')
    if (permissions.length < 3) {
      return
    }
    if (!menuKeys[permissions[0] + '.' + permissions[1]]) {
      menuKeys[permissions[0] + '.' + permissions[1]] = route
    }
  })

  routerMap.forEach(route => {
    if (route.children && route.children.length) {
      route.children = fillAsyncMenus(route.children)
    }
    if (!route.hidden || (route.meta && route.meta.menuKey)) {
      return
    }
    const permissions = (route.meta && route.meta.permission || '').split('.')
    if (permissions.length < 3) {
      return
    }
    if (menuKeys[permissions[0] + '.' + permissions[1]]) {
      route.meta.menuKey = menuKeys[permissions[0] + '.' + permissions[1]].path
    }
  })

  return routerMap
}

function filterAsyncRouter (routerMap, userInfo, roles, permissions, parent) {
  const accessedRouters = routerMap.filter(route => {
    if (route.meta && route.meta.permission && Array.isArray(route.meta.permission)) {
      route.meta.permission = route.meta.permission.length ? route.meta.permission[0] : ''
    }

    if (parent) {
      route.parent = parent
      if (parent.meta.permission && (!route.meta.permission || route.meta.permission.split('.').length < 3)) {
        route.meta.permission = parent.meta.permission + '.' + (route.meta.permission || '')
      }
    }

    const hasedPermission = userInfo.is_super || hasPermission(permissions, route)
    if (route.children && route.children.length) {
      const children = filterAsyncRouter(route.children, userInfo, roles, permissions, route)
      if (children && children.length) {
        let showdChildren = false
        for (let i = 0; i < children.length; i++) {
          if (!children[i].hidden) {
            showdChildren = true
            break
          }
        }

        if (hasedPermission || showdChildren) {
          route.children = children
          return true
        } else {
          route.children = []
        }
      }
    }
    return !!hasedPermission
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        const { userInfo, roles, permissions } = data
        const accessedRouters = fillAsyncMenus(filterAsyncRouter(asyncRouterMap, userInfo, roles, permissions))
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
