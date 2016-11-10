/**
 *
 */

var get_status_class = function(status) {
	if (status == "chat") {
		return "";
	} else if (status == "busy") {
		return "i i-busy";
	} else if (status == "away") {
		return "i i-left";
	} else if (status == "dnd") {
		return "i i-nodisturb";
	} else if (status == "hide") {
		return "i i-hide";
	} else if (status == "off") {
		//return "i i-offline";
		return "";
	}
	return "";
};

var get_status_by_class = function(style) {
	if (style == "i i-on") {
		return "chat";
	} else if (style == "i i-busy") {
		return "busy";
	} else if (style == "i i-left") {
		return "away";
	} else if (style == "i i-nodisturb") {
		return "dnd";
	} else if (style == "i i-hide") {
		return "hide";
	} else if (style == "i i-offline") {
		return "off";
	}
	return "";
};

get_offline_str = function(str) {
	if (!str) {
		return "从未登录";
	}
	var date1 = new Date(Date.parse(str.replace(/-/g, "/"))); // 结束时间
	var date3 = new Date().getTime() - date1.getTime() // 时间差的毫秒数
	if (date3 < 0 || isNaN(date3)) {
		return "从未登录";
	}
	// 计算出相差天数
	var days = Math.floor(date3 / (24 * 3600 * 1000))
		// 计算出小时数
	var leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
	var hours = Math.floor(leave1 / (3600 * 1000))
		// 计算相差分钟数
	var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
	var minutes = Math.floor(leave2 / (60 * 1000))

	// return minutes + " 分钟 " + seconds + "秒 ";

	if (days == 0) {
		if (hours == 0) {
			if (minutes < 5) {
				return "";
			}
			return "离线 " + Math.floor(minutes / 5) * 5 + " 分钟";
		} else {
			return "离线 " + hours + " 小时";
		}
	}
	return "离线 " + days + " 天";
}

get_away_str = function(str, type) {
	if (!str) {
		return "";
	}
	var date1 = new Date(Date.parse(str.replace(/-/g, "/"))); // 结束时间
	var date3 = new Date().getTime() - date1.getTime() // 时间差的毫秒数
	if (date3 < 0 || isNaN(date3)) {
		return "";
	}
	// 计算出相差天数
	var days = Math.floor(date3 / (24 * 3600 * 1000))
		// 计算出小时数
	var leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
	var hours = Math.floor(leave1 / (3600 * 1000))
		// 计算相差分钟数
	var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
	var minutes = Math.floor(leave2 / (60 * 1000))

	// return minutes + " 分钟 " + seconds + "秒 ";

	if (days == 0) {
		if (hours == 0) {
			if (minutes < 5) {
				return "";
			}
			return "离开 " + Math.floor(minutes / 5) * 5 + " 分钟";
		} else {
			return "离开 " + hours + " 小时";
		}
	}
	return "离开 " + days + " 天";
}

/* 查询最近联系人列表 */
var get_recent_contact = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"ptype": "getRecentContact"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 查询联系人列表 */
var get_contact_list = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"from": cookie("uid"),
		"ptype": "getContactList"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 查询联系人状态 */
var get_contact_status = function(contactId, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"from": cookie("uid"),
		"to": contactId,
		"ptype": "getContactStatus"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 查询联系人状态 */
var batch_contact_status = function(pnames, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"ptype": "batchContactStatus",
		"pnames": pnames
	};
	data_ajax(suc, error, defaults, 1);
}

/**
 * 添加好友 说明： labelId传，加入默认的好友分组， friendUid 为添加人的pin
 */
var add_friend = function(friendUid, labelId, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": friendUid,
		"ptype": "presence_subscribe"
	};
	data_ajax(suc, error, defaults);
};

/**
 * 删除好友 说明： friendUid 为添加人的pin both : 是够双向取消
 */
var delete_friend = function(friendUid, both, suc, error) {
	var isBoth = false;
	if (both == true) {
		isBoth = true;
	}
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": friendUid,
		"ptype": "presence_unsubscribe"
	};
	data_ajax(suc, error, defaults);
};

/** 移动好友到其他分组 labelId:新的标签id ,friendUid：被移动人的pin */
var move_friend = function(lableId, friendUid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_roster_item_move"
	};
	data_ajax(suc, error, defaults);
};

/**
 * 增加好友列表标签或则是修改标签 labelId :标签id name：标签名 ver为第一次获取好友列表的返回的值，该请求成功后，会返回
 * 新的ver,下次请求的时候 用新的ver去请求。
 */
var addorModify_friend_label = function(labelId, name, seq, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_roster_label_set"
	};
	data_ajax(suc, error, defaults, 0, false);
};

/** 删除好友标签 labelId:分组标签id */
var delete_friend_label = function(labelId, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_roster_label_delete"
	};
	data_ajax(suc, error, defaults);
};

/** 设置用户状态 */
var update_user_presence = function(presence, action, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "presence"
	};
	data_ajax(suc, error, defaults);
};

/* 查询群列表 */
var get_group_list = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_group_get"
	};
	data_ajax(suc, error, defaults);
}

/* 查询群信息 */
var get_group_info = function(gid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_group_get"
	};
	data_ajax(suc, error, defaults);
}

/* 查询群用户列表 */
var get_group_user_list = function(gid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_group_roster_get"
	};
	data_ajax(suc, error, defaults);
}

/* 新建群 */
var create_group = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"ptype": "iq_group_set"
	};
	data_ajax(suc, error, defaults);
}

/* 查询个人信息 */
var get_self_info = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"ptype": "getSelfInfo"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 查询用户信息 */
var get_user_info = function(to, suc, error, async) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"from": cookie("uid"),
		"to": to,
		"ptype": "getUserInfo"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 批量获取用户信息 */

var get_batch_user_info = function(pnames, suc, error) {
	var len = pnames.length;
	if (len <= 200) {
		get_batch_user_info0(pnames, suc, error);
		return;
	}

	//取前500个，pnames减少200个
	get_batch_user_info0(pnames.splice(0, 200), suc, error);
	//剩下的递归调用
	get_batch_user_info(pnames, suc, error);
}


var get_batch_user_info0 = function(pnames, suc, error) {
	$.ajax({
		type: 'get',
		dataType: "json",
		url: '/extApi.action?pname=' + pnames + '&aid=' + cookie("aid") + '&uid=' +
			cookie("uid") + '&ptype=iep_batch_erp_get',
		success: suc,
		error: error
	});
}

/* 发送消息（单人） */
var chat_single = function(msgId, conver, inputText, suc, error) {
	if (inputText) {
		try {
			inputText = inputText.replace(/"/g, "\"");
		} catch (e) {} //某些特殊字符可能导致解码失败
	}
	var defaults = {
		"id": msgId,
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"from": cookie("uid"),
		"to": conver,
		"ptype": "messageChat",
		"msg": inputText
	};
	data_ajax(suc, error, defaults, 1);
}

/* 发送消息（群） */
var chat_group = function(msgId, conver, inputText, suc, error) {
	if (inputText) {
		try {
			inputText = inputText.replace(/"/g, "\"");
		} catch (e) {} //某些特殊字符可能导致解码失败
	}
	var defaults = {
		"id": msgId,
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": conver,
		"type": "message_chat",
		"body": {
			"content": inputText,
			"font": '微软雅黑',
			"fontsize": 10,
			"gid": conver,
			"groupKind": "discussion_group"
		}
	};
	data_ajax(suc, error, defaults);
}

/* 发送消息（临时会话） */
var chat_temp = function(msgId, conver, inputText, suc, error) {
	if (inputText) {
		try {
			inputText = inputText.replace(/"/g, "\"");
		} catch (e) {} //某些特殊字符可能导致解码失败
	}
	var defaults = {
		"id": msgId,
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": conver,
		"type": "message_chat",
		"body": {
			"content": inputText,
			"font": '微软雅黑',
			"fontsize": 10,
			"gid": conver,
			"groupKind": "temp_group"
		}
	};
	data_ajax(suc, error, defaults);
}

/* 搜索用户 */
var search_user_list = function(value, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"uid": cookie("uid"),
		"ptype": "iep_erp_search",
		"pname": value,
		"url": "/api"
	};
	data_ajax(suc, error, defaults, 1);
}

/* 请求推送离线消息 */
var get_offline_message = function(suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"type": "iq_offline_message_push",
		"version": "1.0"
	};
	data_ajax(suc, error, defaults);
};

/* 获取单个全部历史消息 */
var get_chat_history_all = function(to, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"type": "iq_message_get",
		"to": to,
		"version": "1.0",
		"body": {}
	};
	data_ajax(suc, error, defaults);
};
/* 指定获取单个历史消息 */
var get_chat_history = function(to, mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"type": "iq_message_get",
		"to": to,
		"version": "1.0",
		"body": {
			"mid": mid
		}
	};
	data_ajax(suc, error, defaults);
};

var get_history_message = function(to, start, end, suc, error) {
	var defaults = {
		aid: cookie("aid"),
		uid: cookie("uid"),
		ptype: "iep_get_history_message",
		start: start,
		end: end,
		limit: 10
	};
	if ($.isNumeric(to)) {
		defaults.gid = to;
	} else {
		defaults.pname = to;
	}
	data_ajax(suc, error, defaults, 1);
};

/* 获取群全部历史消息 */
var get_group_history_all = function(gid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": gid,
		"type": "iq_message_get",
		"version": "1.0",
		"body": {
			"gid": gid
		}

	};
	data_ajax(suc, error, defaults);
};

/* 获取群指定历史消息 */
var get_group_history = function(gid, mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": gid,
		"type": "iq_message_get",
		"version": "1.0",
		"body": {
			"gid": gid,
			"mid": mid
		}

	};
	data_ajax(suc, error, defaults);
};

/* 单聊已读回执 */
var message_read_receipt_single = function(uid, mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": uid,
		"type": "message_read_receipt",
		"version": "1.0",
		"body": {
			"mid": mid
		}
	}
	data_ajax(suc, error, defaults);
};

/* 群聊已读回执 */
var message_read_receipt_group = function(gid, mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": gid,
		"type": "message_read_receipt",
		"version": "1.0",
		"body": {
			"gid": gid,
			"mid": mid
		}
	}
	data_ajax(suc, error, defaults);
};

/* 其余已读回执 */
var message_read_receipt_other = function(mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": "@im.dearcode.net",
		"type": "message_read_receipt",
		"version": "1.0",
		"body": {
			"mid": mid
		}
	}
	data_ajax(suc, error, defaults);
};
/* 群组邀请相关信息 */
var message_read_receipt_invite = function(from, mid, suc, error) {
	var defaults = {
		"aid": cookie("aid"),
		"from": cookie("uid"),
		"to": from,
		"type": "message_read_receipt",
		"version": "1.0",
		"body": {
			"mid": mid
		}
	}
	data_ajax(suc, error, defaults);
};

/* 客户端下载地址 */
var down_pc_url = function(suc, error) {
	down_url('pc', suc, error);
}

var down_mac_url = function(suc, error) {
	down_url('mac', suc, error);
}

var down_url = function(clientType, suc, error) {
	$.ajax({
		type: 'get',
		dataType: "json",
		contentType: 'charset=utf-8',
		url: '/download/getUrl.action?clientType=' + clientType,
		success: suc,
		error: error
	});
}

var cookie = function(key) {
	var result;
	return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)')
		.exec(document.cookie)) ? decodeURIComponent(result[1]) : null;
}

/** 是否断开网络请求 */
var offline = false;

/* ajax请求 type=1 http 否则 tcp */
var data_ajax = function(suc, error, defaults, type, async) {
	if (typeof(suc) != 'function') {
		suc = new Function();
	}
	if (typeof(error) != 'function') {
		error = new Function();
	}
	if (typeof(async) == 'undefined') {
		async = true;
	}
	if (type == 1) {
		$.ajax({
			type: 'post',
			dataType: "json",
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			async: async,
			url: '/api.action?' + $.param(defaults),
			success: suc,
			error: error
		});
	} else if (type == 2) {
		$.ajax({
			type: 'post',
			async: async,
			dataType: "json",
			data: defaults,
			url: '/extApi.action?',
			success: suc,
			error: error
		});
	} else {
		$.ajax({
			type: 'post',
			dataType: "json",
			async: async,
			url: '/api.action',
			data: {
				webJson: JSON.stringify(defaults)
			},
			success: suc,
			error: error
		});
	}
}
