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
		}
	}
};

