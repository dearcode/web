function checkCode(data) {
    var obj = eval('(' + data + ')');
    return obj.Code;
}

function checkData(data) {
    var obj = eval('(' + data + ')');
    return obj.Data;
}

function checkResult(data) {
    if (data == undefined) {
        return "";
    }

    var obj = eval('(' + data + ')');
    var result = "";
    switch (obj.Code) {
        case 0:
            result = "成功";
            break;
        case 1:
            result = "未知错误";
            break;
        case 1000:
            result = "用户名格式错误";
            break;
        case 1001:
            result = "用户名长度错误";
            break;
        case 1010:
            result = "用户密码格式错误";
            break;
        case 1011:
            result = "用户密码长度错误";
            break;
        case 1020:
            result = "昵称格式错误";
            break;
        case 1021:
            result = "昵称长度错误";
            break;
        case 1030:
            result = "获取回话失败";
            break;
        case 1031:
            result = "生成ID失败";
            break;
        case 1032:
            result = "注册失败";
            break;
        case 1033:
            result = "已经离线";
            break;
        case 1034:
            result = "更新用户信息失败";
            break;
        case 1035:
            result = "更新用户密码失败";
            break;
        case 1036:
            result = "获取用户信息失败";
            break;
        case 1037:
            result = "用户认证失败（提示用户名或密码错误）";
            break;
        case 1038:
            result = "消息订阅失败";
            break;
        case 1039:
            result = "取消消息订阅失败";
            break;
        case 1040:
            result = "发送消息失败";
            break;
        case 1041:
            result = "不能添加自己为好友";
            break;
        case 1042:
            result = "添加好友失败";
            break;
        case 1043:
            result = "用户不在线";
            break;
        case 1044:
            result = "加载好友列表失败";
            break;
        case 1045:
            result = "查找用户失败";
            break;
        case 1046:
            result = "创建分组失败";
            break;
        case 1047:
            result = "加载群组列表失败";
            break;
        case 1048:
            result = "上传文件失败";
            break;
        case 1049:
            result = "文件检查失败";
            break;
        case 1050:
            result = "下载文件失败";
            break;
        case 1051:
            result = "加载消息列表失败";
            break;
        case 5000:
            result = "用户尚未认证";
            break;
        default:
            result = "未知错误";
            break;
    }
    return result;
}
