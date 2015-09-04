/**
 * @fileoverview ControlPanel for the Toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');
/**
 * 툴바 영역 컨트롤 패널 UI
 * @constructor View.Layout.Toolbar.ControlPanel
 */
var ControlPanel = View.extend(/**@lends View.Layout.Toolbar.ControlPanel.prototype */{
    tagName: 'div',
    className: 'btn_setup',
    template: _.template(
            '<a href="#" class="excel_download_button btn_text excel_all" style="display: inline-block;">' +
            '<span><em class="f_bold p_color5">전체엑셀다운로드</em></span>' +
            '</a>' +
            '<a href="#" class="excel_download_button btn_text excel_grid" style="display: inline-block;">' +
            '<span><em class="excel">엑셀다운로드</em></span>' +
            '</a>' +
            '<a href="#" class="grid_configurator_button btn_text" style="display: none;">' +
            '<span><em class="grid">그리드설정</em></span>' +
            '</a>'),
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
    },

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar.ControlPanel} - this object
     */
    render: function() {
        this.destroyChildren();
        this.$el.html(this.template());
        return this;
    }
});

module.exports = ControlPanel;
