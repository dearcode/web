define(function(require, exports, module){
  require("facebox");
	var avatarUrl = "",x=0,y=0,width=0,height=0,imgWidth = 0, imgHeight = 0, initSrc = "",
		util = require("util");

	function buildView(){
		var html = [ '<div id="editAvatar" style="display: none">',
		             '<div class="edit-avatar">',
		             '<div class="pop-title">编辑头像</div>',
		             '<div class="pop-content clearfix">',
		             '<div class="view-avatar">',
		             '<img src="./img/default-avatar.png" />',
		             '</div>',
		             '<div class="upload-wrap"><div class="upload-avatar" style="overflow:hidden;width:128px;height:130px;">',
//		             '<canvas class="canvas"></canvas>',
		             '<img src="./img/default-avatar.png" style="position:relative;"/>',
		             '</div>',
		             '<div class="aub-wrap"><input type="file"  name="uploadAvatar"/>',
		             '<a class="sblue-btn" href="javascript:">上传头像</a></div>',
		             '</div>',
		             '</div>',
		             '<div class="pop-bottom">',
		             '<div class="btn-wrap">',
		             '<a href="javascript:;" class="blue-btn avatar-save">保 存</a>',
		             '<a href="javascript:;" class="gray-btn avatar-cancel">取 消</a>',
		             '</div></div></div></div>'
		            ];

		if($("#editAvatar").length == 0){
			$("body").append(html.join(""));
		}

		$("#user-avatar a").facebox();

		$(document).bind("afterClose.facebox", function(){
			$(".view-avatar div").remove();
			$(".view-avatar img").removeAttr("style");
		});

		$(document).bind("afterReveal.facebox", function(){
			var img = $("#user-avatar a img").attr("src");
			$(".view-avatar img").attr("src", img);
			$(".upload-avatar img").attr("src", img);
			initSrc = img;
			avatarUrl = img;
			var img2 = new Image();
			img2.src = img;
			img.onload = function(){
				imgWidth = img2.width;
				imgHeight = img2.height;
				var h = $(".upload-avatar:visible").height()*imgWidth/imgHeight;
				$(".upload-avatar:visible img").height(h);
			};

//			canvas = $(".canvas:visible").get(0);

//			if(canvas && canvas.getContext){
//				$(".upload-avatar img").hide();
//				canvas.width = 130;
//				canvas.height = 130;
//				context = canvas.getContext("2d");
//				var img2 = new Image();
//				img2.src= img;
//				img2.onload = function(){
//					context.drawImage(img2, 0, 0);
//				};
//			}

			$(".view-avatar img").Jcrop({
				onchange : function(){alert('');},
				onSelect : updateView,
				aspectRatio : 1,
				boxWidth:280,
				boxHeight:280
			}, function(){
				  var bounds = this.getBounds();
			        boundx = bounds[0];
			        boundy = bounds[1];
			        jcrop_api = this;
			});

			//更新预览图
			function updateView(coords){
//				console.log(obj);
//				if(context){
//					var img = new Image();
//					img.src = $(".view-avatar:visible img").attr("src");
//					img.onload = function(){
//						context.clearRect(0, 0, canvas.width, canvas.height);
//						context.drawImage(img, obj.x, obj.y, obj.w, obj.h, 0, 0, canvas.width, canvas.height);
//					};
//				}
//				console.log(coords);
				var rx = 100 / coords.w;
				var ry = 100 / coords.h;
				if(imgWidth == 0 || imgHeight == 0){
					imgWidth = $(".view-avatar:visible img")[0].naturalWidth || $(".view-avatar:visible img").width();
					imgHeight = $(".view-avatar:visible img")[0].naturalHeight || $(".view-avatar:visible img").height();
				}
//				console.log(rx);
//				console.log(ry);
				$('.upload-avatar:visible img').css({
					width: Math.round(rx * imgWidth) + 'px',
					height: Math.round(ry * imgHeight) + 'px',
					marginLeft: '-' + Math.round(rx * coords.x) + 'px',
					marginTop: '-' + Math.round(ry * coords.y) + 'px'
				});
				x = coords.x;
				y = coords.y;
				height = coords.w;
				width = coords.h;
			}
			//绑定事件
			events();
		});
	}


	function events(){
		$(".aub-wrap:visible input").upload({
			onload:function(file, resp){
				try{
					var json = resp;
					avatarUrl = json.url;
				}catch(e){

				}
			}
		});
		$(".aub-wrap input").change(function(){
			if(window.File && window.FileReader){
				var files = this.files, file, reader;
				if(!files || files.length != 1){
					return;
				}
				file =files[0];
				//判断文件类型
				if(file.type.indexOf("image") != 0){
					util.alert("提示","请选择图片文件");
					$(this).val('');
					return;
				}
				if(file.size > 1024*1024*5){
					util.alert("提示","选择的图片大小不能超过5MB");
					$(this).val('');
					return;
				}
				//判断文件大小，避免文件过大造成浏览器卡死
				reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function(){
					var img = new Image();
					img.src = reader.result;
					img.onload = function(){
						var h = this.height/this.width*$(".view-avatar:visible").width(),
						    h2 = this.height/this.width*($(".upload-avatar:visible").width()*1.2),
						    w2 = this.width/this.height*h2;
						imgHeight = this.height;
						imgWidth = this.width;
						jcrop_api.ui.holder.height(h);
						$(".view-avatar img").attr("src", img.src).height(h);
						$(".upload-avatar img").attr("src", img.src).height(h2).width(w2);
//						if(context){
//							context.clearRect(0, 0, canvas.width, canvas.height);
//							context.drawImage(img, 0, 0, canvas.width, img.height/img.width*canvas.height);
//						}
						jcrop_api.setImage(img.src);
					};
				};
			}
		});
		//将图片上传到服务端

		$(".avatar-cancel").click(function(){
			avatarUrl = "";
			$(".close").click();
		});

		$(".avatar-save").click(function(){
			var req = {} ;
			req.ptype = "iep_avatar_set";
			req.uid = util.cookie("uid");
			req.aid = util.cookie("aid");
			req.x = parseInt(x, 10);
			req.y = parseInt(y, 10);
			req.height = height >0 ? parseInt(height, 10): parseInt(imgHeight, 10);
			req.width = width > 0 ?  parseInt(width, 10) : parseInt(imgWidth, 10);
			if(!avatarUrl){
				util.alert("提示","文件上传中，请稍后");
				return;
			}
			req.avatar = avatarUrl;
			$.ajax({
				url :"/extApi.action",
				data:req,
				type:"post",
				dataType:"json",
				success:function(json){
					if(json && json.url){
						$("#user-avatar img").attr("src", json.url);
						$("#user-avatar img").css("borderRadius","5px").css("height","64px");
						var self = DDstorage.get(util.cookie("uid"));
						if(self){
							self.avatar = json.url;
							DDstorage.set(util.cookie("uid"), self);
						}
//						$("img[src='"+initSrc+"']").each(function(){
//							$(this).attr("src", json.url);
//						});
						//修改聊天面板中的头像，其他地方暂时不管
						$(".msg-self .msg-avatar img").each(function(){
							$(this).attr("src", json.url);
						});
						//修改小队成员管理中的头像
						$("#team-add-member").siblings("li[data-id='"+(req.uid)+"']").find("img").attr("src",json.url);
					}
				}
			});

//			if(canvas){
//				//console.log(canvas.toDataURL());
//				$("#user-avatar img").attr("src", canvas.toDataURL());
//				$("#user-avatar img").on("load", function(){
//					if(this.width>this.height){
//						$(this).height($("#user-avatar").height());
//					}else{
//						$(this).width($("#user-avatar").width());
//					}
//					$(this).css("borderRadius","5px");
//
//				});
//			}
			$(".avatar-cancel").click();
		});
	}
	/*$(".upload-avatar:visible").css({
		overflow:"hidden",
		height:"180px",
		position:"relative"
	});
	$(".upload-avatar:visible img").css({
		position:"relative"
	});*/

	function init(){
		var obj = DDstorage.get(util.cookie("uid"));
		if(obj && obj.avatar){
			$("#user-avatar img").attr("src", obj.avatar).css("borderRadius","5px").css("height","64px");
			$("#user-avatar img").error(function(){
				$(this).attr("src", "./img/default-avatar.png");
			});
		}else{
			//alert("用户资料未获取到");
		}
	}


	buildView();
	init();

});
