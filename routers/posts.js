let router=require('koa-router')();
// 处理数据库（之前已经写好，在mysql.js）
let userModel=require('../lib/mysql.js');
// 时间中间件
let moment=require('moment');
const md = require('markdown-it')();

// get '/'页面
router.get('/',async (ctx,next)=>{
    ctx.redirect('/posts')
});
// get '/posts'页面
router.get('/posts',async (ctx,next)=>{
    let res,
        postsPageLength,
        postsLength,  // 文章数目
        name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
    // 这里我们先通过查找有没有类似/posts?author=XXX 的连接跳转，如果有就执行下面这句话，把用户名取下来，由于用户名存在中文，所以我们进行解码
    if (ctx.request.querystring) {
        console.log('ctx.request.querystring',name);
        await userModel.findDataByUser(name)
            .then(result=>{
                postsLength = result.length;
            });
        await userModel.findPostByUserPage(name,1)  // 查询第一页文章
            .then(result => {
                res = result
            });
        await ctx.render('posts',{
            session:ctx.session,
            posts:res,
            postsPageLength:Math.ceil(postsLength / 5)  // 分页数
        })
    }else{
        // 如果连接是正常的 如 /posts 则我们获取的是全部文章的列表，所以通过findAllPost查找全部文章并向模板传递数据posts， posts的值为res
        await userModel.findPostByPage(1)
            .then(result => {
                //console.log(result)
                res = result
            });
        await userModel.findAllPost()
            .then(result=>{
                postsLength = result.length;
                console.log(Math.ceil(postsLength / 5));
            });
        await ctx.render('posts',{
            session:ctx.session,
            posts:res,
            postsLength: postsLength,
            postsPageLength: Math.ceil(postsLength / 5)
        })
    }
});
// 查找对应页数文章
router.post('/posts/page', async(ctx, next) => {
    let page = ctx.request.body.page;
    await userModel.findPostByPage(page)
        .then(result=>{
            //console.log(result)
            ctx.body = {
                code:0,
                body:result
            }
        }).catch(()=>{
            ctx.body = {
                code:1
            }
        })
});
// get '/create'
router.get('/create',async (ctx,next)=>{
    await ctx.render('create',{
        session:ctx.session,
    })
});
// 创建
router.post('/create',async (ctx,next)=>{
    console.log(ctx.session.user);
    let title=ctx.request.body.title;
    let content=ctx.request.body.content;
    let id=ctx.session.id;
    let name=ctx.session.user;
    let time=moment().format('YYYY-MM-DD HH:mm');
    console.log([name,title,content,id,time]);
    // 这里我们向数据库插入用户名、标题、内容、发表文章用户的id、时间，成功返回true，失败为false
    await userModel.insertPost([name,title,md.render(content),id,time])
        .then(()=>{
            ctx.body='true'
        }).catch(()=>{
            ctx.body='false'
        })
});
// 单篇文章
router.get('/posts/:postId',async (ctx,next)=>{
    let res,
        comment_res,
        res_pv;
    // 通过文章id查找返回数据，然后增加pv 浏览 +1
    await userModel.findDataById(ctx.params.postId)
        .then(result=>{
            res = result;
            res_pv = ~ ~result[0]['pv'];
            res_pv += 1;
            console.log(res)
        });
    await userModel.updatePostPv([res_pv, ctx.params.postId]);
    await userModel.findCommentById(ctx.params.postId)
        .then(result => {
            comment_res = result;
        });
    // 渲染模板，并传递三个数据
    await ctx.render('sPost',{
        session:ctx.session,
        posts:res,
        comments:comment_res
    })
});
// 评论
router.post('/:postId',async (ctx,next)=>{
    let name=ctx.session.user;
    let content=ctx.request.body.content;
    let postId=ctx.params.postId;
    // 插入评论的用户名，内容和文章id
    await userModel.insertComment([name,md.render(content),postId]);
    // 先通过文章id查找，然后评论数+1
    await userModel.findDataById(postId)
        .then(result=>{
            res_comments=~~result[0]['comments'];
            res_comments+=1
        });
    // 更新评论数 res_comments
    await userModel.updatePostComment([res_comments,postId])
        .then(()=>{
            ctx.code=0;
            ctx.body='true'
        }).catch(()=>{
            ctx.body='false'
        })
});
// 删除评论
router.get('/posts/:postId/comment/:commentId/remove',async (ctx,next)=>{
    let postId = ctx.params.postId,
        commentId = ctx.params.commentId,
        res_comments;
    await userModel.findDataById(postId)
        .then(result=>{
            res_comments=parseInt(JSON.parse(JSON.stringify(result))[0]['comments']);
            console.log('res',res_comments);
            res_comments-=1;
            if(res_comments<0){
                res_comments=0;
            }
            console.log(res_comments)
        });
    await userModel.updatePostComment([res_comments,postId]);
    await userModel.deleteComment(commentId)
        .then(()=>{
            ctx.body={
                data:1 // 删除成功
            }
        }).catch(()=>{
            ctx.body={
                data:2 // 删除失败
            }
        })
});
// 删除自己文章
router.get('/posts/:postId/remove',async (ctx,next)=>{

    let postId=ctx.params.postId

    await userModel.deleteAllPostComment(postId)
    await userModel.deletePost(postId)
        .then(()=>{
            ctx.body={
                data:1
            }
        }).catch(()=>{
            ctx.body={
                data:2
            }
        })

});
// 修改文字
// get '/posts/:postId/edit'
router.get('/posts/:postId/edit',async (ctx,next)=>{
    let name=ctx.session.user;
    let postId=ctx.params.postId;

    await userModel.findDataById(postId)
        .then(result=>{
            res=JSON.parse(JSON.stringify(result));
            console.log('修改文章',res)
        });
    await ctx.render('edit',{
        session:ctx.session,
        posts:res
    })
});
// post '/posts/:postId/edit'
router.post('/posts/:postId/edit',async (ctx,next)=>{
    let title=ctx.request.body.title;
    let content=ctx.request.body.content;
    let id=ctx.session.id;
    let postId=ctx.params.postId;

    await userModel.updatePost([title,content,postId])
        .then(()=>{
            ctx.body='true'
        }).catch(()=>{
            ctx.body='false'
        })
});
// 测试
router.get('/test',async (ctx,next)=>{
    await userModel.findAllPost()
        .then((res)=>{
            ctx.body={
                code:0,
                body:res
            }
        }).catch(()=>{
            ctx.body='error'
        })
});
module.exports=router;
