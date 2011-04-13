/*jshint immed:false, onevar: false */
(function (Backbone, _, $, document, window, undefined) {

  var Todo = {};

  Todo.Task = Backbone.Model.extend({

    constructor: function Task() {
      Backbone.Model.prototype.constructor.apply(this, arguments);
      this.collection = this.collection || Todo.tasks;
    }

  });

  Todo.TaskCollection = Backbone.Collection.extend({

    url: '/tasks',

    model: Todo.Task,

    constructor: function TaskCollection() {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }

  });

  Todo.TaskView = Backbone.View.extend({

    events: {
      'click .delete': 'ondelete'
    },

    constructor: function TaskView() {
      Backbone.View.prototype.constructor.apply(this, arguments);
    },

    initialize: function () {
      var view = this;
      this.collection.bind('add', function (task, collection) {
        view.add(task);
      });
      this.collection.bind('remove', function (task, collection) {
        view.remove(task);
      });
    },

    add: function (task) {
      var item    = this.make('li', {'data-id': task.cid}),
          comment = this.make('span', {}, task.escape('comment')),
          button  = this.make('button', {'class': 'delete'}, 'Delete');

      item.appendChild(comment);
      item.appendChild(button);
      this.el.appendChild(item);

      return this;
    },

    remove: function (task) {
      $('[data-id="' + task.cid + '"]').remove();
      return this;
    },

    render: function () {
      this.collection.each(function (task) {
        this.add(task);
      }, this);
      return this.el;
    },

    ondelete: function (event) {
      var parent = event.target.parentNode,
          task = this.collection.getByCid(parent.getAttribute('data-id'));

      if (task) {
        task.destroy();
        this.collection.remove(task);
      }
      event.preventDefault();
    }
  });

  Todo.TaskForm = Backbone.View.extend({

    events: {
      'submit': 'onsubmit'
    },

    constructor: function TaskForm() {
      Backbone.View.prototype.constructor.apply(this, arguments);
    },

    onsubmit: function (event) {
      var task = new Todo.Task({}),
          textarea = this.$('textarea');

      task.save({
        comment: textarea.val()
      });
      textarea.val('');

      this.trigger('create', task, this);

      event && event.preventDefault();
    }
  });

  Todo.tasks = new Todo.TaskCollection(window.bootstrap());

  var list = new Todo.TaskView({
    el: document.getElementById('task-list'),
    collection: Todo.tasks
  });

  list.render();
  list.bind('delete', function (task) {
    Todo.tasks.remove(task);
  });

  var form = new Todo.TaskForm({
    el: document.getElementById('task-form')
  });
  form.bind('create', function (task) {
    Todo.tasks.add(task);
  });

  window.Todo = Todo;

})(this.Backbone, this._, this.Zepto, this.document, this);
