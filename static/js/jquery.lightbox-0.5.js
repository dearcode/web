/**
 * jQuery lightBox plugin
 * This jQuery plugin �鿴was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * @name jquery-lightbox-0.5.js
 * @author Leandro Vieira Pinho - http://leandrovieira.com
 * @version 0.5
 * @date April 11, 2008
 * @category jQuery plugin
 * @copyright (c) 2008 Leandro Vieira Pinho (leandrovieira.com)
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/deed.en_US
 * @example Visit http://leandrovieira.com/projects/jquery/lightbox/ for more informations about this jQuery plugin
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function($) {
	/**
	 * $ is an alias to jQuery object
	 *
	 */
	$.fn.lightBox = function(settings) {
		// Settings to configure the jQuery lightBox plugin how you like
		settings = jQuery.extend({
			// Configuration related to overlay
			overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			overlayOpacity:			0.0,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
			// Configuration related to navigation
			fixedNavigation:		false,		// (boolean) Boolean that informs if the navigation (next and prev button) will be fixed or not in the interface.
			// Configuration related to images
			imageLoading:			'/img/lightbox-ico-loading.gif',		// (string) Path and the name of the loading icon
			imageBtnPrev:			'http://static.360buyimg.com/im/img/i/20130514A.png',			// (string) Path and the name of the prev button image
			imageBtnNext:			'http://static.360buyimg.com/im/img/i/20130514A.png',			// (string) Path and the name of the next button image
			imageBtnClose:			'/img/lightbox-btn-close.gif',		// (string) Path and the name of the close btn
			imageBlank:				'/img/lightbox-blank.gif',			// (string) Path and the name of a blank image (one pixel)
			// Configuration related to container image box
			containerBorderSize:	10,			// (integer) If you adjust the padding in the CSS for the container, #lightbox-container-image-box, you will need to update this value
			containerResizeSpeed:	400,		// (integer) Specify the resize duration of container image. These number are miliseconds. 400 is default.
			// Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
			txtImage:				'Image',	// (string) Specify text "Image"
			txtOf:					'of',		// (string) Specify text "of"
			// Configuration related to keyboard navigation
			keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery lightBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			keyToPrev:				'p',		// (string) (p = previous) Letter to show the previous image
			keyToNext:				'n',		// (string) (n = next) Letter to show the next image.
			// Don�t alter these variables in any way
			imageArray:				[],
			activeImage:			0
		},settings);
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
        var seefullfigureFlag = false;
        var defaultTop = 0;
        var setImgWithFlag = false;
        /**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}
		/**
		 * Start the jQuery lightBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			// Unset total images in imageArray
			settings.imageArray.length = 0;
			// Unset image active information
			settings.activeImage = 0;
			// We have an image set? Or just an image? Let�s see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings.imageArray.push(new Array(objClicked.getAttribute('href'),objClicked.getAttribute('title')));
			} else {
				// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the images references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute('href'),jQueryMatchedObj[i].getAttribute('title')));
				}
			}
			while ( settings.imageArray[settings.activeImage][0] != objClicked.getAttribute('href') ) {
				settings.activeImage++;
			}
			// Call the function that prepares image exibition
			_set_image_to_view();
            $("#lightbox-nav").attr("title","\u5feb\u6377\u952e\uff1a\u4e0a\u4e00\u5f20"+settings.keyToPrev+"\uff0c\u4e0b\u4e00\u5f20"+settings.keyToNext+"\uff0c\u5173\u95ed"+settings.keyToClose);

            //TODO CLICKED
            $(window).trigger("jquery.lightboxClicked");
        }
		/**
		 * Create the jQuery lightBox plugin interface
		 *
		 * The HTML markup will be like that:
			<div id="jquery-overlay"></div>
			<div id="jquery-lightbox">
				<div id="lightbox-container-image-box">
					<div id="lightbox-container-image">
						<img src="../fotos/XX.jpg" id="lightbox-image">
						<div id="lightbox-nav">
							<a href="#" id="lightbox-nav-btnPrev"></a>
							<a href="#" id="lightbox-nav-btnNext"></a>
						</div>
						<div id="lightbox-loading">
							<a href="#" id="lightbox-loading-link">
								<img src="../images/lightbox-ico-loading.gif">
							</a>
						</div>
					</div>
				</div>
				<div id="lightbox-container-image-data-box">
					<div id="lightbox-container-image-data">
						<div id="lightbox-image-details">
							<span id="lightbox-image-details-caption"></span>
							<span id="lightbox-image-details-currentNumber"></span>
						</div>
						<div id="lightbox-secNav">
							<a href="#" id="lightbox-secNav-btnClose">
								<img src="../images/lightbox-btn-close.gif">
							</a>
						</div>
					</div>
				</div>
			</div>
		 *
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<iframe id="jquery-overlay" name="overlay"></iframe><div id="jquery-overlay-div"></div><div id="jquery-lightbox" title="快捷键：上一张p，下一张n，关闭c"><a href="#" class="im-pop-close" id="lightbox-secNav-btnClose" title="关闭"></a><div class="im-pop-view-pic" id="lightboxWrap"><div class="pic-trigger">'
//                +'<a href="javascript:;" class="go-origin-pic" title="查看原图"></a>'
                +'<a href="javascript:;" id="seeFull" class="pic-zoom" title="放大图片"></a>'
                +'</div><div id="lightbox-container-image-box"><div id="lightbox-container-image"><img id="lightbox-image"><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"><img src="' + settings.imageLoading + '"></a></div></div></div><div id="lightbox-container-image-data-box"></div><a href="#" class="im-slide-prev im-icon-slide-prev" title="前一个" id="lightbox-nav-btnPrev"></a><a href="#" class="im-slide-next im-icon-slide-next" title="后一个" id="lightbox-nav-btnNext"></a>'
//                +'<div class="im-pic-thumbnail">'
//                +'<div class="thumbnail">'
//                +'    <img src="" alt="缩略图">'
//                +'    </div>'
//                +'    <div class="curarea"></div>'
//                +'    <span><a href="javascript:;" class="thub-close" title="关闭缩略图"></a></span>'
//                +'</div>'
                +'</div>');
			// Get page sizes
			var arrPageSizes = ___getPageSize();
			// Style overlay and show it
            $("#jquery-overlay-div").css({
                position:         "absolute",
                top:               "0px",
                left:              "0px",
                "zIndex":          99,
                width:				arrPageSizes[0],
                height:				arrPageSizes[1]
            });
			$('#jquery-overlay').css({
				backgroundColor:	"transparent",
				opacity:			settings.overlayOpacity,
				width:				arrPageSizes[0],
				height:				arrPageSizes[1]
			}).fadeIn(function(){
                    seefullfigureFlag = false;
                    try{
                        if($.browser.msie){
                            $("#lightboxWrap").css({
                                width:"100%"
                            });
                        }else{
                            $("#lightboxWrap").css({
                                width:"100%",
                                "background-color": "rgba(0,0,0,.2)"
                            });
                        }
                    }catch(e){
                        $("#lightboxWrap").css({
                            width:"100%",
                            "background-color": "rgba(0,0,0,.2)"
                        });
                    }
                });
			// Get page scroll
			var arrPageScroll = ___getPageScroll();
			// Calculate top and left offset for the jquery-lightbox div object and show it
            try{
                if($.browser.msie){
                    $("#lightboxWrap").css({
                        width:"100%"
                    });
                }else{
                    $("#lightboxWrap").css({
                        width:"100%",
                        "background-color": "rgba(0,0,0,.2)"
                    });
                }
            }catch(e){
                $("#lightboxWrap").css({
                    width:"100%",
                    "background-color": "rgba(0,0,0,.2)"
                });
            }
            setImgWithFlag = false;
            $("#seeFull").unbind("click").bind("click",_seefullfigure);
//            $("#seeFull").hover(function(){
//                if(seefullfigureFlag){
//                    $(this).css({
//                        "background-position": "118px 1px"
//                    })
//                }else{
//                    $(this).css({
//                        "background-position": "99px 1px"
//                    })
//                }
//            },function(){
//                if(seefullfigureFlag){
//                    $(this).css({
//                        "background-position": "118px -20px"
//                    })
//                }else{
//                    $(this).css({
//                        "background-position": "99px -20px"
//                    })
//                }
//            });
            defaultTop =   arrPageScroll[1] + (arrPageSizes[3] / 10);
			$('#jquery-lightbox').css({
				top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
				left:	"10%",
                width: "80%"
			}).show();
			// Assigning click events in elements to close overlay
			$('#jquery-overlay-div').click(function() {
				_finish();
			});
			// Assign the _finish function to lightbox-loading-link and lightbox-secNav-btnClose objects
			$('#lightbox-loading-link,#lightbox-secNav-btnClose').click(function() {
				_finish();
				return false;
			});
            /**
             * 点击其他区域删除大图弹出层
             */
//            $(window.frames["overlay"].document).unbind("click").bind("click",function(){
//                $('#jquery-lightbox').remove();
//                $('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
//                // Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
//                $('embed, object, select').css({ 'visibility' : 'visible' });
//                return false;
//            });
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
				// Get page sizes
				var arrPageSizes = ___getPageSize();
				// Style overlay and show it
				$('#jquery-overlay').css({
					width:		arrPageSizes[0],
					height:		arrPageSizes[1]
				});
                $("#jquery-overlay-div").css({
                    position:         "absolute",
                    top:               "0px",
                    left:              "0px",
                    "zIndex":          9999,
                    width:				arrPageSizes[0],
                    height:				arrPageSizes[1]
                });
				// Get page scroll
				var arrPageScroll = ___getPageScroll();
				// Calculate top and left offset for the jquery-lightbox div object and show it
                defaultTop =   arrPageScroll[1] + (arrPageSizes[3] / 10);
				$('#jquery-lightbox').css({
					top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
//					left:	arrPageScroll[0]
                    left:"10%"
				});
                try{
                    if($.browser.msie){
                        $("#lightboxWrap").css({
                            width:"100%"
                        });
                    }else{
                        $("#lightboxWrap").css({
                            width:"100%",
                            "background-color": "rgba(0,0,0,.2)"
                        });
                    }
                }catch(e){
                    $("#lightboxWrap").css({
                        width:"100%",
                        "background-color": "rgba(0,0,0,.2)"
                    });
                }
			});
		}
		/**
		 * Prepares image exibition; doing a image�s preloader to calculate it�s size
		 *
		 */
		function _set_image_to_view() { // show the loading
			// Show the loading
			$('#lightbox-loading').show();
			if ( settings.fixedNavigation ) {
				$('#lightbox-image,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();
			} else {
				// Hide some elements
				$('#lightbox-image,#lightbox-nav,#lightbox-nav-btnPrev,#lightbox-nav-btnNext,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();
			}
			// Image preload process
			var objImagePreloader = new Image();
			objImagePreloader.onload = function() {
				$('#lightbox-image').attr('src',settings.imageArray[settings.activeImage][0]);
				// Perfomance an effect in the image container resizing it
				_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);
				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			};
			objImagePreloader.src = settings.imageArray[settings.activeImage][0];
		};
		/**
		 * Perfomance an effect in the image container resizing it
		 *
		 * @param integer intImageWidth The image�s width that will be showed
		 * @param integer intImageHeight The image�s height that will be showed
		 */
		function _resize_container_image_box(intImageWidth,intImageHeight) {
            setImgWithFlag = false;
            if(intImageWidth > $(document).width() || intImageHeight > $(document).height()){
                _seefullfigure();
            }
			if (intImageWidth > $(document).width()) {
				intImageWidth = $(document).width() - 200;
			}
			
			if (intImageHeight > $(document).height() - 150) {
				intImageHeight = $(document).height() - 150;
			}
			
			// Get current width and height
			var intCurrentWidth = $('#lightbox-container-image-box').width();
			var intCurrentHeight = $('#lightbox-container-image-box').height();
			// Get the width and height of the selected image plus the padding
			var intWidth = (intImageWidth + (settings.containerBorderSize * 2)); // Plus the image�s width and the left and right padding value
			var intHeight = (intImageHeight + (settings.containerBorderSize * 2)); // Plus the image�s height and the left and right padding value
			// Diferences
			var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;
			// Perfomance the effect
			$('#lightbox-container-image-box').animate({ width: "90%", height: intHeight},settings.containerResizeSpeed,function() { _show_image(intWidth); });

//            $("#lightboxWrap").css("height",intHeight + 100);
//            $("#lightbox-image").css({
//                "width":"100%",
//                "height": "100%"
//            });
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( $.browser.msie ) {
					___pause(250);
				} else {
					___pause(100);	
				}
			} 
			$('#lightbox-container-image-data-box').css({ width: intImageWidth });
//			$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({ height: intImageHeight + (settings.containerBorderSize * 2) });
		};
		/**
		 * Show the prepared image
		 *
		 */
		function _show_image(intWidth) {
			$('#lightbox-loading').hide();
			$('#lightbox-image').fadeIn(function() {
				_show_image_data();
				_set_navigation();
			});
			_preload_neighbor_images();
            if($("#lightbox-container-image-box").width()<intWidth){
                setImgWithFlag = true;
            }
            if(setImgWithFlag){
                $('#lightbox-image').css("width","100%");
            }else{
                $('#lightbox-image').removeAttr("style");
                $('#lightbox-image').css("display","inline");
            }
		};
		/**
		 * Show the image information
		 *
		 */
		function _show_image_data() {
			$('#lightbox-container-image-data-box').slideDown('fast');
			$('#lightbox-image-details-caption').hide();
			if ( settings.imageArray[settings.activeImage][1] ) {
				//$('#lightbox-image-details-caption').html(settings.imageArray[settings.activeImage][1]).show();
			}
			// If we have a image set, display 'Image X of X'
			if ( settings.imageArray.length > 1 ) {
				//$('#lightbox-image-details-currentNumber').html(settings.txtImage + ' ' + ( settings.activeImage + 1 ) + ' ' + settings.txtOf + ' ' + settings.imageArray.length).show();
			}		
		}
		/**
		 * Display the button navigations
		 *
		 */
		function _set_navigation() {
			$('#lightbox-nav').show();

			// Instead to define this configuration in CSS file, we define here. And it�s need to IE. Just.
//			$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
			
			// Show the prev button, if not the first image in set
			if ( settings.activeImage != 0 ) {
				if ( settings.fixedNavigation ) {
					$('#lightbox-nav-btnPrev').unbind()
						.bind('click',function() {
							settings.activeImage = settings.activeImage - 1;
							_set_image_to_view();
							return false;
						});
				} else {
					// Show the images button for Next buttons
					$('#lightbox-nav-btnPrev').unbind().show().bind('click',function() {
						settings.activeImage = settings.activeImage - 1;
						_set_image_to_view();
						return false;
					});
				}
			}
			
			// Show the next button, if not the last image in set
			if ( settings.activeImage != ( settings.imageArray.length -1 ) ) {
				if ( settings.fixedNavigation ) {
					$('#lightbox-nav-btnNext').unbind()
						.bind('click',function() {
							settings.activeImage = settings.activeImage + 1;
							_set_image_to_view();
							return false;
						});
				} else {
					// Show the images button for Next buttons
					$('#lightbox-nav-btnNext').unbind().show().bind('click',function() {
						settings.activeImage = settings.activeImage + 1;
						_set_image_to_view();
						return false;
					});
				}
			}
			// Enable keyboard navigation
			_enable_keyboard_navigation();
		}
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}
		/**
		 * Disable the support to keyboard navigation
		 *
		 */
		function _disable_keyboard_navigation() {
			$(document).unbind();
		}
		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if ( objEvent == null ) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			} else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			// Verify the keys to close the ligthBox
			if ( ( key == settings.keyToClose ) || ( key == 'x' ) || ( keycode == escapeKey ) ) {
				_finish();
			}
			// Verify the key to show the previous image
			if ( ( key == settings.keyToPrev ) || ( keycode == 37 ) ) {
				// If we�re not showing the first image, call the previous
				if ( settings.activeImage != 0 ) {
					settings.activeImage = settings.activeImage - 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
			// Verify the key to show the next image
			if ( ( key == settings.keyToNext ) || ( keycode == 39 ) ) {
				// If we�re not showing the last image, call the next
				if ( settings.activeImage != ( settings.imageArray.length - 1 ) ) {
					settings.activeImage = settings.activeImage + 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
		}
		/**
		 * Preload prev and next images being showed
		 *
		 */
		function _preload_neighbor_images() {
			if ( (settings.imageArray.length -1) > settings.activeImage ) {
				objNext = new Image();
				objNext.src = settings.imageArray[settings.activeImage + 1][0];
			}
			if ( settings.activeImage > 0 ) {
				objPrev = new Image();
				objPrev.src = settings.imageArray[settings.activeImage -1][0];
			}
		}
		/**
		 * Remove jQuery lightBox plugin HTML markup
		 *
		 */
		function _finish() {
			$('#jquery-lightbox').remove();
            $("#jquery-overlay-div").remove();
			$('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });
            //TODO Closed
            $(window).trigger("jquery.lightboxClosed");
		}
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
				pageWidth = xScroll;		
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		};
		/**
		 / THIRD FUNCTION
		 * getPageScroll() by quirksmode.com
		 *
		 * @return Array Return an array with x,y page scroll values.
		 */
		function ___getPageScroll() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		};
		 /**
		  * Stop the code execution from a escified time in milisecond
		  *
		  */
		 function ___pause(ms) {
			var date = new Date(); 
			curDate = null;
			do { var curDate = new Date(); }
			while ( curDate - date < ms);
		 };
         function _seefullfigure(){
             seefullfigureFlag = true;
             $("#jquery-lightbox").removeAttr("style");
             try{
                 if($.browser.msie && $.browser.version < 8){
                     window.setTimeout(function(){
                         $("#jquery-lightbox").css({
                             top:	"0px",
                             left:	"0px"
                         });
                     },0);
                 }
             }catch(e){}

             $("#lightboxWrap").css("height","100%");
             $("#jquery-lightbox").css("height","100%");

             $("#seeFull").removeClass("pic-zoom").addClass("back-thumbnail");
             if(setImgWithFlag){
                 $('#lightbox-image').removeAttr("style");
                 $('#lightbox-image').css("display","inline");
             }
             $("#seeFull").unbind("click").bind("click",restoreScreen);
             $("#seeFull").attr("title", "缩小图片");
             return false;
         };
        function restoreScreen(){
            seefullfigureFlag = false;
            $("#jquery-lightbox").removeAttr("style");
            $('#jquery-lightbox').css({
                top:	defaultTop,
                left:	"10%",
                width: "80%"
            });
//            $("#lightbox-secNav-btnClose").css({
//                top: -14,
//                right: -14
//            })
            $("#seeFull").addClass("pic-zoom").removeClass("back-thumbnail");

            $('#lightbox-image').removeAttr("style");
            if(setImgWithFlag){
                $('#lightbox-image').css({
                    "display":"inline",
                    "width": "100%"
                });
            }else{
                $('#lightbox-image').removeAttr("style");
                $('#lightbox-image').css("display","inline");
            }
            $("#seeFull").unbind("click").bind("click",_seefullfigure);
            $("#seeFull").attr("title", "放大图片");
            return false;
        };
		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
})(jQuery); // Call and execute the function immediately passing the jQuery object