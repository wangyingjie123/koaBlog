let useruPload={
    avator:'',
    uploadFun:null
};
$('#uploadImg').on('change',function(){
    if (this.files.length === 0) {
        return;
    }
    let file = this.files[0],
        reader = new FileReader(); // 读取文件并显示
    if (!reader) {
        this.value = '';
        return;
    }
    console.log(file.size/1024+'kb');
    reader.onload = function (e) {
        $('#myImg').attr('src', e.target.result);
        let image = new Image();
        image.onload = function(){
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext("2d");
            canvas.width = 100;
            canvas.height = 100;
            ctx.clearRect(0, 0, 100, 100);
            ctx.drawImage(image, 0, 0, 100, 100);
            useruPload.avator = canvas.toDataURL("image/png"); // blob
            canvas=null;
        };
        image.src = e.target.result
    };
    reader.readAsDataURL(file);
});
useruPload.uploadFun=()=>{
    $.ajax({
        url:'/uploadImg',
        type:'post',
        data:{
          avator:useruPload.avator
        },
        success:function(msg){
            console.log(msg)
        },
        error:function(error){
            Materialize.toast('系统错误', 4000);
        }
    })
};
$('#upload').on('click',function(){
    useruPload.uploadFun()
});