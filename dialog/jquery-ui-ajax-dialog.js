/**
 * 定义jquery插件，方便dialog调用
 */
(function($){
	$.fn.extend({
		/**
		 * 取得页面元素所在的dialog
		 */
		getDialog: function() {
			var dialogObj = $(this).closest(".ui-dialog-content");
			if (dialogObj && dialogObj.length > 0) {
				return dialogObj;
			}
			return null;
		},

		/**
		 * 刷新页面元素所在的dialog
		 * @param options
		 * 		{
		 * 			propagate: 传递性
		 * 				（true向上传递、false或者undefined不向上传递）
		 * 			dialogOptions: {}					要更新的dialog参数
		 * 			afterRefresh: 						更新后的处理
		 * 		}
		 */
		refreshDialog: function(options) {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				thisDialog.exDialog("refresh", options);
			}
		},

		/**
		 * 关闭页面元素所在的dialog
		 */
		closeDialog: function() {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				thisDialog.exDialog("close");
			}
		},

		/**
		 * 隐藏页面元素所在的dialog
		 */
		hideDialog: function() {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				thisDialog.exDialog("hide");
			}
		},

		/**
		 * 取得页面元素所在的dialog的父dialog
		 */
		getParentDialog: function() {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				return thisDialog.exDialog("getParentDialog");
			}
			return null
		},

		/**
		 * 刷新页面元素所在的dialog的父dialog
		 * @param options
		 * 		{
		 * 			propagate: 传递性
		 * 				（true向上传递、false或者undefined不向上传递）
		 * 			dialogOptions: {}					要更新的dialog参数
		 * 			afterRefresh: 						更新后的处理
		 * 		}
		 */
		refreshParent: function(options) {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				thisDialog.exDialog("refreshParent", options);
			}
		},

		/**
		 * 更新dialog缓存的form
		 */
		refreshDialogCachedForm: function() {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				thisDialog.exDialog("refreshCachedForm");
			}
		},

		/**
		 * 取得页面元素所在的dialog的参数
		 * @param	paramName		参数名
		 */
		getDialogOptions: function(paramName) {
			var thisDialog = $(this).getDialog();
			if (thisDialog && thisDialog.length > 0) {
				return thisDialog.exDialog("option", paramName);
			}
			return undefined;
		}
	});
})(jQuery);

/**
 * 扩展jquery.ui.dialog
 */
$.widget("ui.exDialog", $.ui.dialog, {
	options: {
		width: 800,
		height: 500,
		maxWidth: 800,
		maxHeight: 500,
		modal: true,
		resizable: false,
		draggable: false,
		closeOnEscape: false,
		title: "",

		navigateEnabled: false,
		navigateContainer: null,
		navigateClass: "navigation",
		currentIndex: 0,
		rowData: null,
		previousActive: true,
		nextActive: true,
		clickOnPrevious: false,
		clickOnNext: false,
		getRowData: null,

		helpURL: false,
		closeEnabled: true,
		logoutEnabled: false,
		currentUser: '',

		iframeSrc: "",
		ajaxOptions: null,
		tabId: null,
		tabIndex: 0,
		parentDialog: null,
		onRefreshParent: null
	},
	tabId: null,
	tabIndex: 0,
	parentDialog: null,
	cachedForm: null,

	navigateContainer: null,
	navigateClass: "",
	previousActive: false,
	nextActive: false,
	currentIndex: 0,
	prevousIndex: 0,
	nextIndex: 0,

	previousActive: false,
	nextActive: false,
	previousObj: null,
	nextObj: null,

	ajaxOptions: null,
	rowData: null,

	/**
	 * dialogを新規作成
	 */
	_create: function() {
		$.ui.dialog.prototype._create.call(this);
		this.uiDialog.addClass("exDialog");
	},

	/**
	 * dialogの初期化
	 */
	_init: function() {
		$.ui.dialog.prototype._init.call(this);
		this._refreshParam(this.options);
		this._refresh(this.options);
	},

	/**
	 * dialogの初期パラメーターを更新
	 * @param
	 */
	_refreshParam: function(opts) {
		this.tabId = opts.tabId;
		this.tabIndex = opts.tabIndex;
		this.parentDialog = opts.parentDialog;

		this.navigateContainer = opts.navigateContainer;
		this.navigateClass = opts.navigateClass;
		this.previousActive = opts.previousActive;
		this.nextActive = opts.nextActive;
		this.currentIndex = parseInt(opts.currentIndex);
		this.prevousIndex = this.currentIndex;
		this.nextIndex = this.currentIndex;

		this.ajaxOptions = opts.ajaxOptions;
		this.rowData = opts.rowData;
	},


	/**
	 * dialogを更新
	 */
	_refresh: function(options) {
		this._refreshContent(options);
	},

	/**
	 * dialogを隠す
	 */
	hide: function() {
		this.element.parent().hide();
		this.overlay.hide();
	},

	/**
	 * dialogを更新
	 * @param options
	 * 		{
	 * 			propagate: 伝播性
	 * 				（true伝播する、false或いはundefined伝播しない）
	 * 			dialogOptions: {}					更新されるダイヤログのプロメーター
	 * 			afterRefresh: 	 					更新した後のイベンど
	 * 		}
	 */
	refresh: function(options) {
		// デフォルト配置
		var defaults = {
			propagate:			true,
			dialogOptions: 		null,
			afterRefresh:		null
		};
		// 定義配置でデフォルト配置をかぶさる
		var opts = $.extend(defaults, options);

		if (opts.dialogOptions) {
			var _dialogOptions = $.extend(this.options, opts.dialogOptions);
			this._refreshParam(_dialogOptions);
		}
		this._refresh({afterRefresh: opts.afterRefresh});

		if (opts.propagate) {
			var jdialog = this;
			setTimeout(function(){
				jdialog.refreshParent();
			}, 500);
		}
	},

	/**
	 * dialogのベースクラスのdialogを更新
	 * @param options
	 * 		{
	 * 			propagate: 伝播性
	 * 				（true伝播する、false或いはundefined伝播しない）
	 * 			dialogOptions: {}					更新されるダイヤログのプロメーター
	 * 			afterRefresh: 	 					更新した後のイベンど
	 * 		}
	 */
	refreshParent: function(options) {
		if (this.options.onRefreshParent
				&& typeof this.options.onRefreshParent == "function") {
			this.options.onRefreshParent(this, options);
		} else if (this.parentDialog) {
			this.parentDialog.exDialog("refresh", options);
		}
	},

	/**
	 * dialogのベースクラスのdialogを取得
	 */
	getParentDialog: function() {
		return this.parentDialog;
	},

	/**
	 * dialogのcachedFormを更新
	 */
	_refreshCachedForm: function() {
		this.cachedForm = this._getFormSerializeData();
	},

	/**
	 * dialogのcachedFormを更新
	 */
	refreshCachedForm: function() {
		this._refreshCachedForm();
	},

	/**
	 * dialogのtabIndexを設定
	 * @param tabIndex
	 */
	setTabIndex: function(tabIndex) {
		this.tabIndex = tabIndex;
	},

	/**
	 * dialogのtabIndexを取得
	 */
	getTabIndex: function() {
		return parseInt(this.tabIndex);
	},

	/**
	 * Formのシーケンスデータを取得
	 */
	_getFormSerializeData: function() {
		var jform = this.element.find("form");
		if (jform && jform.length > 0) {
			return jform.serialize();
		}
		jform = this.element.find("iframe").contents().find("form");
		if (jform && jform.length > 0) {
			return jform.serialize();
		}
	},

	/**
	 * タイトル を新規作成
	 */
	_createTitlebar: function() {
		$.ui.dialog.prototype._createTitlebar.call(this);
		var uiDialogTitle = $('<table width="100%" border="0" cellspacing="0" cellpadding="0" class="top lcsDialogTitlebar">'
		+'<tbody><tr>'
		+'	<td class="logo"><img src="../image/logo.jpg"></td>'
		+'	<td class="title">&nbsp;'
		+'	</td>'
		+'</tr>'
		+'</tbody></table>');

		// タイトルを表示
		if (this.options.title) {
			$('<div class="tabhostM">'
				+'	<ul>'
				+'		<li class="selected">'+this.options.title+'</li>'
				+'	</ul>'
				+'</div>')
				.appendTo(uiDialogTitle.find(".title").empty());
		}

		// navigateEnabledに値がある場合、そしてnavigateEnabledはtrueで，「前へ」バタンを表示
		if (this.options.navigateEnabled) {
			this.lcsDialogTitlebarPrevious = $('<td class="previous">'
					+'<div>'
					+'&lt;&nbsp;前へ'
					+'</div>'
					+'</td>')
					.appendTo(uiDialogTitle.find("tr"));
			this._on( this.lcsDialogTitlebarPrevious, {
				click: function( event ) {
					event.preventDefault();
					this._doPrevous();
				}
			});
		}

		// navigateEnabledに値がある場合、そしてnavigateEnabledはtrueで，「次へ」バタンを表示
		if (this.options.navigateEnabled) {
			this.lcsDialogTitlebarNext = $('<td class="next">'
					+'<div>'
					+'	次へ&nbsp;&gt;'
					+'</div>'
					+'</td>')
					.appendTo(uiDialogTitle.find("tr"));
			this._on( this.lcsDialogTitlebarNext, {
				click: function( event ) {
					event.preventDefault();
					this._doNext();
				}
			});
		}

		// helpURLに値がある場合、「ヘルプ」バタンを表示
		if (this.options.helpURL && typeof this.options.helpURL == "string") {
			this.lcsDialogTitlebarHelper = $('<td class="help">'
					+'<div class="xs">'
					+'？&nbsp;ヘルプ'
					+'</div>'
					+'</td>')
					.appendTo(uiDialogTitle.find("tr"));
			this._on( this.lcsDialogTitlebarHelper, {
				click: function( event ) {
					event.preventDefault();
					window.open(this.options.helpURL, '_blank');
				}
			});
		}

		// closeEnabledに値がある場合、そしてcloseEnabledはtrueで，「閉じる」バタンを表示
		if (this.options.closeEnabled) {
			this.lcsDialogTitlebarClose = $('<td class="close">'
				+'<div class="xs">'
				+'Ｘ&nbsp;閉じる'
				+'</div>'
				+'</td>')
				.appendTo(uiDialogTitle.find("tr"));
			this._on( this.lcsDialogTitlebarClose, {
				click: function( event ) {
					event.preventDefault();
					var oldData = this.cachedForm;
					var newData = this._getFormSerializeData();
					if (newData != oldData) {
						if (confirm(msgs["COMM-001-W"])) {
							this.close(event);
						}
					} else {
						this.close(event);
					}
				}
			});
		}

		// logoutEnabledに値がある場合，そしてlogoutEnabledはtrueで，「ログアウト」バタンを表示
		if (this.options.logoutEnabled) {
			this.lcsDialogTitlebarLogout = $('<td class="logout">'
					+'<div class="xs">'
					+	'<span>'+this.options.currentUser+'</span><br>'
					+	'<div id="sp01" class="logoutDiv" style="display: none;">'
					+		'ログアウト'
					+	'</div>'
					+'</div>'
					+'</td>')
					.appendTo(uiDialogTitle.find("tr"));
			this._on( this.lcsDialogTitlebarLogout, {
				click: function( event ) {
					event.preventDefault();
					$(event.currentTarget).find(".logoutDiv").show();
				}
			});
			this._on( this.lcsDialogTitlebarLogout.find(".logoutDiv"), {
				click: function( event ) {
					if (this.options.onLogout && typeof this.options.onLogout == "function") {
						this.options.onLogout();
					}
				},
				mouseout: function(event){
					$(event.currentTarget).hide();
				}
			});
		}
		this.uiDialogTitlebar.empty().append(uiDialogTitle);
	},

	/**
	 * dialogの主体エリアを更新
	 */
	_refreshContent: function(options) {
		// デフォルト配置
		var defaults = {
			afterRefresh:		null
		};
		// 定義配置でデフォルト配置をかぶさる
		var opts = $.extend(defaults, options);

		var ajaxOptions = this.ajaxOptions;
		var iframeSrc = this.options.iframeSrc;
		var html = this.options.html;
		if (iframeSrc && typeof iframeSrc == "string") {
			this.element.append('<iframe name="dialogIframe" src="'+iframeSrc+'" width="100%" height="100%" frameborder="0" scrolling="auto" scrolling="no" style="overflow-x : hidden;"></iframe>');
		} else {
			var jdialog = this;
			this._createContentArea();
			this._createFooterbar();
			var contentArea = this.contentArea;
			var footerbar = this.footerbar;
			if (ajaxOptions && typeof ajaxOptions == "object") {
				var success = ajaxOptions.success;
				var _ajaxOptions = $.extend({}, ajaxOptions);
				_ajaxOptions.success = function(responseHtml) {
					contentArea.html(responseHtml);
					if (jdialog.options.navigateEnabled) {
						jdialog._setPrevousObjAndRefreshPrevousBtn();
						jdialog._setNextObjAndRefreshNextBtn();
					}

					jdialog._refreshCachedForm();
					if (opts.afterRefresh && typeof opts.afterRefresh == "function") {
						opts.afterRefresh(jdialog);
					}

					footerbar.show();
					if (ajaxOptions.success && typeof ajaxOptions.success == "function") {
						ajaxOptions.success();
					}
				}
				_ajaxOptions.data = $.extend(ajaxOptions.data, jdialog.rowData);

				$.comAjax(_ajaxOptions);

			} else if (html && typeof html == "string") {
				contentArea.html(html);
				footerbar.show();
			}
		}
	},

	/**
	 * 主体エリアを作成
	 */
	_createContentArea: function() {
		if (this.contentArea) {
			this.contentArea.remove();
		}
		this.contentArea = $('<div class="dialogContent"/>');
		this.contentArea.appendTo(this.element);
	},

	/**
	 * フッター を新規作成
	 */
	_createFooterbar: function() {
		if (this.footerbar) {
			this.footerbar.remove();
		}
		var minHeight = parseInt(this.element.height()) - 20;
		this.contentArea.css({"min-height": minHeight + "px"});
		this.footerbar = $('<div class="footer" style="display:none">'
			+	'<div class="bottomDiv">'
			+		'Copyright© 2014, Hitachi Systems, Ltd. All Rights Reserved.&nbsp;&nbsp;'
			+	'</div>'
			+'</div>');
		this.footerbar.insertAfter(this.contentArea);
	},

	/**
	 * 「前へ」の対象を設定、「前へ」のバタンを更新
	 */
	_setPrevousObjAndRefreshPrevousBtn: function() {
		this._setPrevousObj();
		this.checkPrevousBtn();
		this._refreshPrevousBtn();
	},

	/**
	 * 「次へ」の対象を設定、「次へ」のバタンを更新
	 */
	_setNextObjAndRefreshNextBtn: function() {
		this._setNextObj();
		this._checkNextBtn();
		this._refreshNextBtn();
	},

	/**
	 * 「次へ」の対象を設定
	 */
	_setPrevousObj: function() {
		if (!this.navigateClass || !this.navigateContainer || !this.options.previousActive) {
			return;
		}

		this.prevousIndex = this.currentIndex - 1;
		this.previousObj = $('.'+this.navigateClass+'[index="'+this.prevousIndex+'"]', this.navigateContainer);
		if (!this.previousObj || this.previousObj.length <= 0) {
			this.prevousIndex = 0;
			this.previousObj = null;
		}
	},

	/**
	 * 「次へ」の対象を設定
	 */
	_setNextObj: function() {
		if (!this.navigateClass || !this.navigateContainer || !this.options.nextActive) {
			return;
		}
		this.nextIndex = this.currentIndex + 1;
		this.nextObj = $('.'+this.navigateClass+'[index="'+this.nextIndex+'"]', this.navigateContainer);
		if (!this.nextObj || this.nextObj.length <= 0) {
			this.nextIndex = this.currentIndex;
			this.nextObj = null;
		}
	},

	/**
	 * 「前へ」のボタンをチェック
	 */
	checkPrevousBtn: function() {
		this.previousActive = (this.previousObj != null && this.options.previousActive);
	},

	/**
	 * 「次へ」のボタンをチェック
	 */
	_checkNextBtn: function() {
		this.nextActive = (this.nextObj != null && this.options.nextActive);
	},

	/**
	 * 「前へ」のボタンを更新
	 */
	_refreshPrevousBtn: function() {
		if (!this.previousActive) {
			this.lcsDialogTitlebarPrevious.find("div")
				.removeClass("xs").addClass("disabled")
				.attr("disabled", "disabled");
		} else {
			this.lcsDialogTitlebarPrevious.find("div")
				.addClass("xs").removeClass("disabled")
				.removeAttr("disabled");
		}
	},

	/**
	 * 「次へ」のボタンを更新
	 */
	_refreshNextBtn: function() {
		if (!this.nextActive) {
			this.lcsDialogTitlebarNext.find("div")
				.removeClass("xs").addClass("disabled")
				.attr("disabled", "disabled");
		} else {
			this.lcsDialogTitlebarNext.find("div")
				.addClass("xs").removeClass("disabled")
				.removeAttr("disabled");
		}
	},

	/**
	 * 「前へ」ボタンを実行
	 */
	_doPrevous: function() {
		if (!this.previousActive) {
			return;
		}
		this.currentIndex = this.prevousIndex;
		this.rowData = this._getRowData(this.previousObj);
		this._refresh();
		if (this.options.clickOnPrevious && typeof this.options.clickOnPrevious == "function") {
			this.options.clickOnPrevious();
		}
	},

	/**
	 * 「次へ」ボタンを実行
	 */
	_doNext: function() {
		if (!this.nextActive) {
			return;
		}
		this.currentIndex = this.nextIndex;
		this.rowData = this._getRowData(this.nextObj);
		this._refresh();
		if (this.options.clickOnNext && typeof this.options.clickOnNext == "function") {
			this.options.clickOnNext();
		}
	},

	/**
	 * 行データを取得
	 */
	_getRowData: function(navigateObj) {
		if (!navigateObj) {
			return null;
		}

		if (this.options.getRowData && typeof this.options.getRowData == "function") {
			return this.options.getRowData(navigateObj);
		}

		var cachedDataObj = navigateObj.data("dataObj");
		var rowData = {};
		for (key in this.rowData) {
			var attrVal = navigateObj.attr(key);
			if (typeof attrVal != undefined) {
				rowData[key] = attrVal;
				continue;
			}
			attrVal = cachedDataObj[key];
			if (typeof attrVal != undefined) {
				rowData[key] = attrVal;
				continue;
			}
			rowData[key] = "";
		}
		return rowData;
	}
});

$(document).ajaxComplete(function(){
	if ($(this).scrollTop() > 10) {
		$('#back-top').fadeIn();
	} else {
		$('#back-top').fadeOut();
	}
});

$(document).ready(function() {
	// hide #back-top first
	$("#back-top").hide();
	// fade in #back-top
	$(function () {
		$(window).scroll(function () {
			if ($(this).scrollTop() > 10) {
				$('#back-top').fadeIn();
			} else {
				$('#back-top').fadeOut();
			}
		});

		// scroll body to 0px on click
		$('#back-top a').click(function () {
			$('body,html').animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	});

	// テキストエリアはフォーカスがなくなる時、前後の空欄をクリア
	$('body').on("blur", 'input[type="text"],textarea', function(){
		var text  = $.trim($(this).val().replace(/(^　*)|(　*$)/g, ""));
		var retText = text;
		//全角英数字を対象に置き換え
		if ($(this).hasClass("halfAngle")) {
				retText = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(s){
				return String.fromCharCode(s.charCodeAt(0)-0xFEE0);
			});
		}
		$(this).val(retText);
	});
});

/**
 * 文字列のツール及び方法
 */
var StringUtils = {
	/**
	 * strはnullの場合，空の文字列を出力、そうでないと、strを出力
	 * @param str
	 * @param emptyString
	 * @returns 文字列
	 */
	stripToEmpty: function(str, emptyString) {
		if (str) {
			return str;
		} else {
			if (emptyString) {
				return emptyString;
			} else {
				return "";
			}
		}
	},
	/**
	 * javaのデータ文字列をjavascriptのデータ文字列に変える
	 * @param str
	 * @returns 文字列
	 */
	transferJavaDateStr: function (str) {
		if (!str) {
			return "";
		}
		return str.replace(/-/g,"/").replace("T"," ");
	},
	/**
	 * 文字列を切取る
	 * @param str			切り取られる文字列
	 * @param maxLength		文字列の最大の長さ
	 * @returns 文字列
	 */
	abbreviate: function (str, maxLength) {
		if (!str) {
			return "";
		}
		if (str.length <= 100) {
			return str;
		}
		return str.substring(0, maxLength) + "...";
	},
	/**
	 * 文字列を埋める
	 * @param str			処理される文字列
	 * @param maxLength		文字列の最大の長さ
	 * @param fillStr		埋められる文字列
	 *
	 * @returns 文字列
	 */
	fill: function (str, maxLength, fillStr) {
		if (!maxLength) {
			return "";
		}
		if (!fillStr) {
			fillStr = "";
		}
		if (!str) {
			str = "";
		}
		var retStr = "";
		for (var i = 0; i < maxLength; i++) {
			retStr += fillStr;
		}
		retStr += str;
		var strLen = retStr.length;
		if (strLen <= maxLength) {
			return retStr;
		} else {
			return retStr.substring(strLen - maxLength, strLen);
		}
	},

	convertContent : function(str){
		str = StringUtils.stripToEmpty(str);
		if (str.length > 100){
			return str.substring(0, 100).replace("<","&lt;").replace(/\n/g,"<br>").replace(/\s/g,"&nbsp;") + "...";
		} else{
			return str.replace("<","&lt;").replace(/\n/g,"<br>").replace(/\s/g,"&nbsp;");
		}
	}
};

// Dialogの順番の初期化
window.dialogIndex = 0;

/**
 * dialogの共通方法を表示
 * @param options
 * @returns
 */
function showDialog(options) {
	// デフォルト配置
	var opts = {
		width: 800,
		height: 500,
		maxWidth: 800,
		maxHeight: 500,
		iframeSrc: "",
		ajaxOptions: null,
		title: "",
		dialogId: null,
		html: "",
		cachedData: false
	};

	// 定義配置でデフォルト配置をかぶさる
	$.extend(opts, options);

	opts.close = function(event, ui) {
		if (options.close && typeof options.close == "function") {
			options.close(event, ui);
		}
		if (options.iframeSrc) {
			$(event.target).find("iframe").attr("src", "");
		}
		$(event.target).remove();
	};

	var dialogId = opts.dialogId;
	// dialogの定義idは内の場合、idを新規作成
	if (!dialogId) {
		dialogId = "dialog_"+window.dialogIndex;
		window.dialogIndex++;
	}
	var dialogDiv = $('<div id="'+dialogId+'" style="display:none;"></div>');

	$("body").append(dialogDiv);
	var exDialog =  $("#"+dialogId).exDialog(opts);
	if (opts.cachedData) {
		exDialog.data('cachedData', opts.cachedData);
	}
	return exDialog;
}
}