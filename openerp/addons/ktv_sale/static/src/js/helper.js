//helper method方法定义
openerp.ktv_sale.helper = function(erp_instance) {
	var helper = erp_instance.ktv_sale.helper = {
		//判断给定的日期是周几
		//返回星期缩写mon/tue/wed等
		get_week_day: function(a_date) {
			var dx = ("sun mon tue wed thu fri sat").split(/\s/);
			var day_of_week = _.find(dx, function(w_day) {
				return a_date().is()[w_day]();
			});
			return day_of_week;
		},
		//得到当日是周几
		today_week_day: function() {
			return helper.get_week_day(Date.today);
		},
        //获取房态描述
        get_room_state_desc : function(r_state){
            var states_desc = {
                "free" : "空闲",
                "in_use" : "使用",
                "scheduled" : "预定",
                "locked" : "锁定",
                "checkout" : "已结账",
                "buyout" : "买断",
                "buytime" : "买钟",
                "malfunction" : "故障",
                "visit" : "带客看房",
                "clean" : "清洁",
                "debug" : "调试"
            };
            return states_desc[r_state];
        }
	}
};

