const Koa=require('koa');
const cors = require('koa2-cors'); // cors跨域
const path=require('path');
const bodyParser = require('koa-bodyparser');
const ejs=require('ejs'); // ejs模板引擎
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js');
const router=require('koa-router');
const views = require('koa-views');
const koaStatic = require('koa-static');
const app=new Koa();
// session存储配置
const sessionMysqlConfig= {
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST,
};
// 配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
}));
// 配置静态资源加载中间件
app.use(koaStatic(
    path.join(__dirname , './public')
));
// 配置服务端模板渲染引擎中间件
app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}));
// 使用表单解析中间件
app.use(bodyParser());
// 配置cors跨域
app.use(cors({
    origin: function(ctx) {
        if (ctx.url === '/test') {
            return '*'; // 只有/test允许跨域
        }
        return false; //
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
// 使用新建的路由文件
app.use(require('./routers/signin.js').routes()); // 登录
app.use(require('./routers/signup.js').routes()); // 注册
app.use(require('./routers/posts.js').routes()); // 修改、评论
app.use(require('./routers/signout.js').routes()); // 退出
// 监听在3000端口
app.listen(3001);
console.log(`listening on port ${config.port}`);
