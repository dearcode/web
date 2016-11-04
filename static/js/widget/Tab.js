define('widget/Tab', [], function() {
    var defaults = {
        container: $('.j-tab'),
        tabHds: null,
        tabBds: null,
        tabHdSelectCLS: 'current',
        hideBdCLS: 'ui-hide',
        toggleEvtType: 'click',
        initDefault: true
    };
    var Tab = function(opts) {
        this.options = $.extend(defaults, opts);
        this.container = this.options.container;
        this.tabHds = this.options.tabHds ? this.options.tabHds :
            this.container.find('.j-tab-hd');
        this.tabBds = this.options.tabBds ? this.options.tabBds :
            this.container.find('.j-tab-bd');
        this.init();
    }

    Tab.prototype = {
        init: function() {
            this.options.initDefault && this.__select__(0); //默认选中第一个tab
            this.bindEvt();
        },

        __select__: function(index) {
            var selectCLS = this.options.tabHdSelectCLS,
                hideBdCLS = this.options.hideBdCLS;
            this.tabHds.removeClass(selectCLS).eq(index).addClass(
                selectCLS);
            this.tabBds.addClass(hideBdCLS).eq(index).removeClass(
                hideBdCLS);
            this.tabIndex = index;
            this.options.selectedFunc && this.options.selectedFunc(
                index);
        },

        set: function(index) {
            this.__select__(index);
        },

        getTabIndex: function() {
            return this.tabIndex;
        },

        getTabLength: function() {
            return this.tabHds.length;
        },

        bindEvt: function() {
            var that = this;

            this.tabHds.on(this.options.toggleEvtType, (
                function(that) {
                    return function() {
                        for (var i = 0, l = that.tabHds
                                .length; i < l; i++) {
                            if (this === that.tabHds[
                                    i]) {
                                that.__select__(i);
                                break;
                            }
                        }
                    }
                })(this));
        }
    }

    return Tab;
});
