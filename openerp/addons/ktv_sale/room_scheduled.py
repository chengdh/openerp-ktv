# -*- coding: utf-8 -*-
from room import room
from osv import osv,fields

class room_scheduled(osv.osv):
    '''
    包厢预定信息
    '''
    _name = "ktv.room_scheduled"
    _description = "包厢预定信息"

    STATE_SCHEDULED = "scheduled" #已预定,正常状态
    STATE_CANCELED = "canceled"  #已取消,系统参数中可设定超过指定时间是否取消预定
    STATE_CLOSED = "closed"  #正常开房操作

    _columns = {
            'room_operate_id' :  fields.many2one('ktv.room_operate',"room_operate_id",required = True),
            'scheduled_time'  : fields.datetime('scheduled_time',required = True,help = "预定时间"),
            'persons_count' : fields.integer('persons_count'),
            'saler_id' : fields.many2one('res.users','saler_id',help = "销售经理"),
            'guest_name' : fields.char('guest_name',size = 64,required = True,help = "预定客人姓名"),
            'guest_phone' : fields.char('guest_phone',size = 64,help = "预定人电话"),
            'description' : fields.text('descriptions',size = 255),
            'state' : fields.selection([(STATE_SCHEDULED,"已预定"),(STATE_CANCELED,"已取消"),(STATE_CLOSED,"正常关闭")],"state",required = True,readonly = True),
            }
    _defaults = {
            "scheduled_time" : fields.datetime.now,
            "persons_count" : 2,
            "state" : STATE_SCHEDULED,
            }

    def process_operate(self,cr,uid,vals,context = None):
        """
        处理包厢预定操作
        :params vals dict 预定信息
        :return tuple room_scheduled 保存成功的包厢预定对象 room_state 应修改的包厢状态 cron 定时执行的任务操作
        """
        room_id = vals.pop("room_id")
        cur_rp_id = self.pool.get('ktv.room').find_or_create_room_operate(cr,uid,room_id)
        vals.update({"room_operate_id" : cur_rp_id})
        room_scheduled_id = self.create(cr,uid,vals)
        fields = self.fields_get(cr,uid).keys()
        room_scheduled = self.read(cr,uid,room_scheduled_id,fields)
        return (room_scheduled,room.STATE_SCHEDULED,None)
