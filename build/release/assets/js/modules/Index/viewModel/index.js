"use strict";

define(['jquery', 'class', 'common', 'util'], function ($, Class, Common, Util) {
  var Index = Class.create({
    initialize: function initialize() {
      this.initPage();
      this.bindEvent();
    },
    initPage: function initPage() {
      Common.globalEvent();
    },
    bindEvent: function bindEvent() {
      Common.bindEvent({
        'click': {// '.media-close': $.proxy(this.mediaClose, this), // 关闭视频
        }
      });
    },
    mediaClose: function mediaClose() {}
  });
  return Index;
});