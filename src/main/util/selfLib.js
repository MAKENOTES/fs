//函数库

exports.waitDeliberately = function(mils) {
    //刻意等待mils的时间，mils的单位是毫秒。
    var now = new Date;
    while(new Date - now <= mils);
}

