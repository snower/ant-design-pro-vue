import store from '@/store'

export function actionToObject (json) {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.log('err', e.message)
  }
  return []
}

export function hasPermission (permission, route) {
  const userInfo = store.getters.userInfo
  if (userInfo && userInfo.is_super) {
    return true
  }

  permission = permission.replace(/-/g, '.')
  const permissions = store.getters.permissions || {}
  if (permission.split('.').length >= 3 && permissions[permission]) {
    return true
  }

  const routePermission = route.meta.permission
  const pgcs = routePermission.split('.')
  if (pgcs.length >= 3) {
    if (permissions[pgcs[0] + '.' + pgcs[1] + '.' + permission]) {
      return true
    }
  } else {
    if (permissions[routePermission + '.' + permission]) {
      return true
    }
  }
  return false
}
