# -*- coding: utf-8 -*-
from osv import osv,fields
from room import room

class room_operate(osv.osv):
    '''
    包厢操作类:
    以下操作都属于包厢操作：
    1 预定
    2 正常开房
    3 买钟
    4 买断
    5 续钟
    6 退钟
    7 换房
    8 并房
    包厢通过cur_room_operate_id与room_operate相关联,用于标示当前包厢所对应的操作
    room_operate与以上各个操作是one2many的关系,这样通过一个room_operate可以获取所有包厢在开房过程中所进行的操作,结账时遍历所有的操作并进行计算即可
    '''
    _name = "ktv.room_operate"
    #由于在其他地方需要引用该对象,所有将name定义为bill_no
    _rec_name = "bill_no"

    _description = "包厢操作类,与包厢是many2one的关系"

    _columns = {
            "operate_date" : fields.datetime('operate_datetime',required = True),
            "room_id" : fields.many2one('ktv.room','room_id',required = True),
            "bill_no" : fields.char("bill_no",size = 64,required = True,help = "账单号"),
            "room_scheduled_ids" : fields.one2many("ktv.room_scheduled","room_operate_id",help="预定信息列表"),
            "room_opens_ids" : fields.one2many("ktv.room_opens","room_operate_id",help="开房信息列表"),
            }

    _defaults = {
            'operate_date' : fields.datetime.now,
            'bill_no': lambda obj, cr, uid, context: obj.pool.get('ir.sequence').get(cr, uid, 'ktv.room_operate'),
            }

    def process_operate(self,cr,uid,operate_values):
        """
        包厢操作统一入口,调用不同业务类的操作
        这样设计的好处是隔离了变化,如果需要修改服务端的逻辑,客户端的调用逻辑不用做任何修改
        在客户端新增了业务实体调用,只用增加新的实体即可,其他不用做修改
        在js端也需要封装同样的调用接口来隔离变化
        :params room_id integer 包厢编码
        :operate_values 前端传入的业务操作数据
        :operate[osv_name] 要调用的实体业务对象名称,比如ktv.room_checkout
        调用示例:
        开房操作,返回三个参数 1 操作成功的实体对象 2 包厢应修改的状态 3 cron对象,用于处理对包厢的定时操作：
        (operate_obj,room_state,cron) = self.pool.get(operate_values['osv_name']).process_operate(cr,uid,opeate_values)
        更新当前包厢状态,添加cron对象,返回处理结果
        """
        room_id = operate_values['room_id']
        (operate_obj,room_state,cron) = self.pool.get(operate_values['osv_name']).process_operate(cr,uid,operate_values)
        #更新包厢状态
        self.pool.get('ktv.room').write(cr,uid,room_id,{'state' : room_state})
        #TODO 添加cron对象
        if cron:
            self._create_operate_cron(cr,uid,cron)

        room_fields = self.pool.get('ktv.room').fields_get(cr,uid).keys()
        room = self.pool.get('ktv.room').read(cr,uid,room_id,room_fields)
        #返回两个对象room和room_operate
        return {'room' : room,'room_operate' : operate_obj}

    def _create_operate_cron(self,cr,uid,cron_vals):
        """
        创建cron定时执行任务,在需要定时执行关房任务时,需要执行
        """
        self.pool.get('ir.cron').create(cr,uid,cron_vals);

