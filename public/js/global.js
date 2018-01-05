$('#input_text').on('input',function(){
    let len=$(this).val();
    if(len.length>40){
        $(this).val(len.substring(0,40));
    }
});
$('#textarea1').on('input',function(){
    let len=$(this).val();
    if(len.length>100){
        $(this).val(len.substring(0,100));
    }
});
$('#submit').click(function(){
    if(!$('#input_text').val()){
        Materialize.toast('标题不能为空', 4000);
        return false
    }
    if(!$('#textarea1').val()){
        Materialize.toast('文章内容不能为空', 4000);
        return false
    }
    let that=$(this);
    if(that.hasClass('disabled')){
        return false;
    }
    that.addClass('disabled');
    submitAjax(that);
});