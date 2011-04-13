/*jshint immed:false, onevar: false */
(function (Backbone, _, $, document, window, undefined) {

  var Task = Backbone.Model.extend({
    constructor: function Task() {
      Backbone.Model.prototype.constructor.apply(this, arguments);
    }
  });

  var TaskCollection = Backbone.Collection.extend({
    url: '/tasks',

    model: Task,

    constructor: function TaskCollection() {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }
  });

  window.Task = Task;
  window.TaskCollection = TaskCollection;
  window.tasks = new TaskCollection(bootstrap());

})(this.Backbone, this._, this.Zepto, this.document, this);
