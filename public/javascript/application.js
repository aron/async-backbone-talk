(function (Backbone, _, $, document, window, undef) {

  // Create our "Todo" namespace
  var Todo = {};

  // "TASK": our core model
  Todo.Task = Backbone.Model.extend({

    // We override the default constructor function with our own. This is used
    // to create each instance of the model.
    constructor: function Task() {
      // We've named the function "Task" purely for debugging: in the WebKit
      // console, model instances will be labelled "Task"
    
      // First apply the logic from the default constructor
      Backbone.Model.prototype.constructor.apply(this, arguments);
      
      // Add a collection of tasks to each model instance
      if (!this.collection){
        this.collection = Todo.tasks;
      }
    }

  });

  // "TASKCOLLECTION": a collection of Task models
  Todo.TaskCollection = Backbone.Collection.extend({

    // We can assign a URL to collections and models. Backbone will synchronise
    // model data with the server via that URL (e.g. GET, POST, PUT, DELETE)
    url: '/tasks',

    // Each collection contains a specific type of model
    model: Todo.Task,

    // Custom constructor - only used to have the name "TaskCollection" in the
    // WebKit console for instances of the collections
    constructor: function TaskCollection() {
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }

  });

  // "TASKVIEW": our first view, used to display a Task model
  Todo.TaskView = Backbone.View.extend({

    // Bind to DOM events originating from this view. Each entry in the `events`
    // object contains the DOM event name ("click"), an optional CSS selector
    // (".delete") and the name of the view method to be triggered ("ondelete")
    events: {
      'click .delete': 'ondelete'
    },

    constructor: function TaskView() {
      Backbone.View.prototype.constructor.apply(this, arguments);
    },

    // Models, collections and views can have an "initialize" method, which is
    // called at the end of instance construction
    initialize: function () {
      var view = this;
      
      // Bind functions to events triggered in the collection, so that the view
      // updates whenever the models/collections are changed.
      this.collection.bind('add', function (task, collection) {
        view.add(task);
      });
      this.collection.bind('remove', function (task, collection) {
        view.remove(task);
      });
    },

    // Add a task DOM node to the view
    add: function (task) {
      var // Each model has a unique `cid` property to identify it.
          // `view.make` is basically document.createElement, followed by an
          // optional hash of element attributes and HTML content
          item    = this.make('li', {'data-id': task.cid}),
          
          // `model.escape` prevents XSS attacks by escaping all HTML content
          comment = this.make('span', {}, task.escape('comment')),
          button  = this.make('button', {'class': 'delete'}, 'Delete');

      item.appendChild(comment);
      item.appendChild(button);
      this.el.appendChild(item); // `view.el` is the view's root DOM node

      return this;
    },

    // Remove a DOM node from the view
    remove: function (task) {
      // `view.$()` is shorthand for `jQuery(view.el).find()` or `Zepto(view.el).find()`
      this.$('[data-id="' + task.cid + '"]').remove();
      return this;
    },

    // `render()` is a standard method to create the view's DOM from its models
    render: function () {
      this.collection.each(function (task) {
        this.add(task);
      }, this);
      return this.el;
    },

    // Our method to delete Task models, triggered by a button click.
    ondelete: function (event) {
      var parent = event.target.parentNode,
          task = this.collection.getByCid(parent.getAttribute('data-id'));

      if (task) {
        // `model.destroy` causes a DELETE request to the server
        task.destroy();
        this.collection.remove(task);
      }
      event.preventDefault();
    }
  });

  // "TASKFORM": another view - used to gather user input
  Todo.TaskForm = Backbone.View.extend({

    // Bind the form's submit event to the view's `onsubmit()` function
    events: {
      'submit': 'onsubmit'
    },

    constructor: function TaskForm() {
      Backbone.View.prototype.constructor.apply(this, arguments);
    },

    onsubmit: function (event) {
      var task = new Todo.Task({}),
          textarea = this.$('textarea');

      // `model.save()` causes a POST request to the server for new models, or a
      // PUT request for existing models. We pass in the data to save as a hash
      // of key-value pairs.
      task.save({
        comment: textarea.val()
      });
      textarea.val('');

      // Broadcast an event on the TaskForm view whenever a task is created
      this.trigger('create', task, this);

      event && event.preventDefault();
    }
  });

  /////


  // APP INITIALISATION / BASIC CONTROLOGIC
  
  // See the index.erb file for `window.bootstrap`. All it does is return JSON
  // to describe previously saved Task models. We use that data to create a new
  // Task collection.
  Todo.tasks = new Todo.TaskCollection(window.bootstrap());

  // Create a new view from the Task collection
  var list = new Todo.TaskView({
    el: document.getElementById('task-list'),
    collection: Todo.tasks
  });

  // Render the view
  list.render();
  
  // Listen for `delete` events on the list view => remove task from the
  // Task collection
  list.bind('delete', function (task) {
    Todo.tasks.remove(task);
  });

  // Create a new Task form view
  var form = new Todo.TaskForm({
    el: document.getElementById('task-form')
  });
  
  // Listen for `create` events on the form => add task to the Task collection
  form.bind('create', function (task) {
    Todo.tasks.add(task);
  });

  // Add our namespace to the global object as an external API to our app
  window.Todo = Todo;

}(this.Backbone, this._, this.Zepto, this.document, this)); // pass in arguments to the main closure

// jsHint settings
/*jshint immed:false, onevar: false */
