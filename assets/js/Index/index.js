define(["vue"], function (_vue) {
  "use strict";

  _vue = _interopRequireDefault(_vue);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  new _vue["default"]({
    el: '#app',
    mounted: function mounted() {
      console.log('hello world test');
    }
  });
});