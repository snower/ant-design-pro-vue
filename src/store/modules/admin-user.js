import Vue from 'vue'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    permissions: null,
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
        state.permissions = permissions
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          if (response.code) {
            return reject(response.message || response)
          }

          const newToken = response.token_type + ' ' + response.access_token
          Vue.ls.set(ACCESS_TOKEN, newToken, (response.expires_in || 7 * 24 * 60 * 60) * 1000)
          commit('SET_TOKEN', newToken)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          if (response.code) {
            return reject(response.message || response)
          }

          const result = response.result
          if ((result.permissions && result.permissions.length > 0) || result.is_super) {
            const permissions = {}
            for (let i = 0, len = result.permissions && result.permissions.length || 0; i < len; i++) {
              permissions[result.permissions[i]] = true
            }
            result.permissionsLength = result.permissions.length
            result.permissions = permissions
            commit('SET_INFO', result)
            commit('SET_PERMISSIONS', permissions)
          } else {
            reject(new Error('getInfo: permissions must be a non-null array !'))
          }
          commit('SET_ROLES', result.roles || [])
          commit('SET_NAME', { name: result.realname, welcome: welcome() })
          commit('SET_AVATAR', result.avatar)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(response => {
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
          commit('SET_TOKEN', '')
          commit('SET_INFO', {})
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', null)
          Vue.ls.remove(ACCESS_TOKEN)
        })
      })
    }

  }
}

export default user
