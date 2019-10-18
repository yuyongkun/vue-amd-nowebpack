requirejs(['../config'],function(){
    require(['jquery','Index/viewModel/index'],function($,ViewModel){
        $(function(){
            new ViewModel();
        });
    });
})