let renderHtml=(datas)=>{
    let str='';
    for(let data of datas)
     str+=` <li class="grid-example col s12 ">
                <div class="card blue-grey darken-1">
                    <div class="card-content white-text">
                        <a href="/posts/${data.id}" class="dis-bolck">
                            <span class="card-title">${data.title}</span>
                            <p>${data.content}</p>
                        </a>
                    </div>
                    <div class="card-action">
                        <a href="javascript:;">作者:${data.name}</a>
                        <a href="javascript:;">评论数：${data.comments}</a>
                        <span class="span-defalut">浏览数：${data.pv}</span>
                        <span  class="span-defalut right">发表时间：${data.moment}</span>
                    </div>
                </div>
            </li>`;
    $('#allBlog').html(str);
};
let ajaxPage=(page)=>{
    $.ajax({
        url:'posts/page',
        type:'POST',
        data:{
            page: page
        },
        success:function(res){
            if(res.code===0){
                let datas=res.body;
                $('#loading').addClass('hide');
                renderHtml(datas);
            }else{
                Materialize.toast('系统错误', 4000);
                $('#loading').addClass('hide');
            }
        },
        error:function(error){
            Materialize.toast('系统错误', 4000);
            $('#loading').addClass('hide');
        }
    })
};
$('#pages').on('click','li.page-item',function(){
    let that=$(this),num=~~that.find('a').text(),index=that.index(),length=that.parent().find('li').length;
    if(that.hasClass('active')){
        return false
    }
    that.parent().find('li.active').removeClass('active').addClass('waves-effect');
    that.removeClass('waves-effect').addClass('active');
    caozuo(num,length);
    ajaxPage(num);
});
let caozuo=(num,length)=>{
    $('#allBlog').find('li').remove();
    $('#loading').removeClass('hide');
    if(num===length-2){
        $('#prevPage').removeClass('disabled').addClass('waves-effect');
        $('#nextPage').removeClass('waves-effect').addClass('disabled');
    }else if(num===1){
        $('#nextPage').removeClass('disabled').addClass('waves-effect');
        $('#prevPage').removeClass('waves-effect').addClass('disabled');
    }else{
        $('#prevPage,#nextPage').removeClass('disabled').addClass('waves-effect');
    }
};
// 下一页
$('#nextPage').on('click',function(){
    if($(this).hasClass('disabled')){
        return false
    }
    let pages=$('#pages'),num=pages.find('li.active').index(),length=pages.find('li').length;
    if(num===length-2){
        return false
    }
    pages.find('li.active').removeClass('active').addClass('waves-effect');
    pages.find('li:nth-child('+(num+2)+')').removeClass('waves-effect').addClass('active');
    caozuo(num+1,length);
    ajaxPage(num+1);
});
// 上一页
$('#prevPage').on('click',function(){
    if($(this).hasClass('disabled')){
        return false
    }
    let pages=$('#pages'),num=pages.find('li.active').index(),length=pages.find('li').length;
    if(num===1){
        return false
    }
    pages.find('li.active').removeClass('active').addClass('waves-effect');
    pages.find('li:nth-child('+num+')').removeClass('waves-effect').addClass('active');
    caozuo(num-1,length);
    ajaxPage(num-1);
});
