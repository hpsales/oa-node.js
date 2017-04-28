var express = require('express');
var router = express.Router();
var debug = require('debug')('oa:api');
var util = require('util')
var Db = require('./modules/Db')
var 调用数据库 = require('./modules/Db').exec
var sync = require('sync_back').run
var 动态验证码 = require('authenticator');
var interface = {}
var 空 = null
interface.project = {}
interface.user = {}
interface.node = {}
interface.project.newtemplate = require('./api/project/newtemplate')
interface.project.publishtemplate = require('./api/project/publishtemplate')
interface.project.newproject = require('./api/project/newproject')
interface.project.submitproject = require('./api/project/submitproject')
interface.user.newuser = require('./api/user/newuser')
interface.user.recovery = require('./api/user/recovery')
interface.user.confirmtoken = require('./api/user/confirmtoken')
interface.user.login = require('./api/user/login')
interface.node.newnode = require('./api/node/newnode')

/*
 * 用户
 * /user
 * 包括用户登录、新建用户、管理用户的接口。
 */
// 用户登录
router.post('/user/login', function (req, res, next) {
  var post = req.body
  run(req, res, {
      'login': false
    }, function (api) {
      interface.user.login(req, res, api, post)
    })
  })
// 重置动态验证码
router.post('/user/recovery', function (req, res, next) {
    var post = req.body
    run(req, res, {
      login: false
    }, function (api) {
      interface.user.recovery(req, res, api, post)
    })
  })
// 确认重置动态验证码
router.post('/user/confirmtoken', function (req, res, next) {
    var post = req.body
    run(req, res, {
      login: false
    }, function (api) {
      interface.user.confirmtoken(req, res, api, post)
    })
  })
// 新建用户
router.post('/user/newuser', function (req, res, next) {
    var post = req.body
    run(req, res, {}, function (api) {
      interface.user.newuser(req, res, api, post)
    })
  })

/*
 * 专案
 * /project
 * 包括专案模板和专案本身的操作接口。
 */
// 新建专案模板
router.post('/project/newtemplate', function (req, res, next) {
    var post = req.body
    run(req, res, {}, function (api) {
      interface.project.newtemplate(req, res, api, post)
    })
  })
// 发布专案模板
router.post('/project/publishtemplate', function (req, res, next) {
    var post = req.body
    run(req, res, {}, function (api) {
      interface.project.publishtemplate(req, res, api, post)
    })
  })
// 新建专案
router.post('/project/newproject', function (req, res, next) {
  var post = req.body
  run(req, res, {}, function (api) {
    interface.project.newproject(req, res, api, post)
  })
})
// 将专案提交审核
router.post('/project/submitproject', function (req, res, next) {
  var post = req.body
  run(req, res, {}, function (api) {
    interface.project.submitproject(req, res, api, post)
  })
})

/*
 * 部门
 * /node
 * 包括部门管理和查询接口
 */
 // 创建新部门
router.post('/node/newnode', function (req, res, next) {
  var post = req.body
  run(req, res, {}, function (api) {
    interface.node.newnode(req, res, api, post)
  })
})

function run(req, res, opt, fun) {
  sync(function* (api) {
    var needLogin = opt.login != null ? opt.login : true
    var needDb = opt.db != null ? opt.db : true
    if (needLogin && req.session.user == null) return failBack(401, 0, "未登录至系统。")
    var api = {}
    if (needDb) api.dbExec = function (sql, back) {
      Db.exec(sql, back)
    }
    api.back4Success = successBack
    api.back4Fail = failBack
    fun(api)

    function successBack(data) {
      var json = {}
      json.状态 = '成功'
      if (data != null) json.数据 = data
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(json));
    }

    function failBack(httpCode, code, des) {
      var json = {}
      json.状态 = '失败'
      json.错误码 = code
      json.错误描述 = des
      res.writeHead(httpCode, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(json));
    }
  })
}
module.exports = router;
