require(['backbone'], function (Backbone) {

  var Book = Backbone.Model.extend({
    defaults: { borrower: null },
  });

  var Shelf = Backbone.Collection.extend({
    model: Book,
    url: "http://rkyve.herokuapp.com/books.json"
  });


  var BookView = Backbone.View.extend({
    tagName: "li",
    className: "book-individual",
    template: $("#single_book_template").html(),

    render: function() {
      var templ = _.template(this.template);
      this.$el.html(templ(this.model.toJSON()));
      return this;
    }

  });

  var bookShelf = new Shelf();
  var ShelfView = Backbone.View.extend({
    el: $("#all_books"),
    initialize: function() {
      var self = this;
      bookShelf.fetch({
        success: function() {
          self.collection = bookShelf;
          self.render();
        }
      });
    },
    render: function() {
      this.collection.each(function(item) {
        this.renderItem(item);
      }, this);
    },
    renderItem: function(item) {
      var bookView = new BookView({ model: item });
      this.$el.append(bookView.render().el);
    }

  });

  var AppView = Backbone.View.extend({
    el: "body",
    initialize: function() {
      //by default all we want to do is show a new shelf view with all books
      this.shelf = new ShelfView();
    }
  });


  $(function() {
    var app = new AppView();
  });




});
