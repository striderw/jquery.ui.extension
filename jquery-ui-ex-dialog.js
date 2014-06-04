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

		html: "",
		iframeSrc: "",
		ajaxOptions: null,
		parentDialog: null,
		onRefreshParent: null
	},
	parentDialog: null,
	cachedForm: null,

	ajaxOptions: null,

	/**
	 * 扩展_create方法
	 */
	_create: function() {
		$.ui.dialog.prototype._create.call(this);
		this.uiDialog.addClass("exDialog");
	},

	/**
	 * 扩展_init
	 */
	_init: function() {
		$.ui.dialog.prototype._init.call(this);
		this._refreshParam(this.options);
		this._refresh(this.options);
	},

	/**
	 * 更新dialog参数
	 * @param
	 */
	_refreshParam: function(opts) {
		this.ajaxOptions = opts.ajaxOptions;
	},


	/**
	 * 刷新dialog（private方法）
	 */
	_refresh: function(options) {
		this._refreshContent(options);
	},

	/**
	 * 隐藏dialog
	 */
	hide: function() {
		this.element.parent().hide();
		this.overlay.hide();
	},

	/**
	 * 刷新dialog（public方法）
	 * @param options
	 * 		{
	 * 			propagate: 传递性
	 * 				（true向上传递、false或者undefined不向上传递）
	 * 			dialogOptions: {}					要更新的dialog参数
	 * 			afterRefresh: 						更新后的处理
	 * 		}
	 */
	refresh: function(options) {
		// 默认参数
		var defaults = {
			propagate:			true,
			dialogOptions: 		null,
			afterRefresh:		null
		};
		var opts = $.extend(defaults, options);

		if (opts.dialogOptions) {
			var _dialogOptions = $.extend(this.options, opts.dialogOptions);
			this._refreshParam(_dialogOptions);
		}
		this._refresh({afterRefresh: opts.afterRefresh});

		if (opts.propagate) {
			var jdialog = this;
			setTimeout(function(){
				if (!isNaN(opts.propagate)) {
					opts.propagate = parseInt(opts.propagate) - 1;
				}
				jdialog.refreshParent(opts);
			}, 500);
		}
	},

	/**
	 * 刷新父窗口
	 * @param options
	 * 		{
	 * 			propagate: 传递性
	 * 				（true向上传递、false或者undefined不向上传递）
	 * 			dialogOptions: {}					要更新的dialog参数
	 * 			afterRefresh: 						更新后的处理
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
	 * 取得父dialog
	 */
	getParentDialog: function() {
		return this.parentDialog;
	},

	/**
	 * 更新cachedForm（private方法）
	 */
	_refreshCachedForm: function() {
		this.cachedForm = this._getFormSerializeData();
	},

	/**
	 * 更新cachedForm（public方法）
	 */
	refreshCachedForm: function() {
		this._refreshCachedForm();
	},

	/**
	 * 取得dialog中的form的序列数化数据
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
	 * 刷新dialog的主体内容部分（private方法）
	 */
	_refreshContent: function(options) {
		// 默认配置
		var defaults = {
			afterRefresh:		null
		};
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

					jdialog._refreshCachedForm();
					if (opts.afterRefresh && typeof opts.afterRefresh == "function") {
						opts.afterRefresh(jdialog);
					}

					if (ajaxOptions.success && typeof ajaxOptions.success == "function") {
						ajaxOptions.success();
					}
				}
				if (opts.beforeRefresh && typeof opts.beforeRefresh == "function") {
					opts.beforeRefresh(jdialog);
				}

				$.ajax(_ajaxOptions);

			} else if (html && typeof html == "string") {
				contentArea.html(html);
			}
		}
	},

	/**
	 * 生成dialog的主体内容部分
	 */
	_createContentArea: function() {
		if (this.contentArea) {
			this.contentArea.remove();
		}
		this.contentArea = $('<div class="dialogContent"/>');
		this.contentArea.appendTo(this.element);
	}
});

// dialog的序号
window.dialogIndex = 0;

/**
 * dialog的共通方法
 * @param options
 * @returns
 */
function showDialog(options) {
	// 默认配置
	var opts = {
		width: 800,
		height: 500,
		maxWidth: 800,
		maxHeight: 500,
		title: "",
		dialogId: null,
		iframeSrc: "",
		ajaxOptions: null,
		html: ""
	};

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
	// 如果dialogId没有值时，生成dialog id
	if (!dialogId) {
		dialogId = "dialog_"+window.dialogIndex;
		window.dialogIndex++;
	}
	var dialogDiv = $('<div id="'+dialogId+'" style="display:none;"></div>');

	$("body").append(dialogDiv);
	var exDialog =  $("#"+dialogId).exDialog(opts);
	return exDialog;
}
}