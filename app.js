
require(['backbone'], function (Backbone) {
  window.currentBook = null;

  var Book = Backbone.Model.extend({
    defaults: { borrower: null },
    url: "http://rkyve.herokuapp.com/books"
  });
// yyoyoyoyo

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
      this.collection = bookShelf;
      this.render();
    },
    render: function() {
      var self = this;
      self.$el.html("");
      bookShelf.fetch({
        success: function() {
          self.collection.each(function(item) {
            this.renderItem(item);
          }, self);
        }
      });
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
    },
    events: {
      "click #addBookButton":"showAddBook",
      "click #viewBooksButton":"showViewBooks",
      "submit #checkout_book_form":"checkOutBook",
      "click .checkOutBookButton": "showCheckOutBook"
    },
    showAddBook:function(){
      $(".page").hide();
      $("#add_book").show();
      return false;
    },
    showViewBooks:function() {
      $(".page").hide();
      $("#all_books").show();
      return false;
    },
    showCheckOutBook: function(d) {
      var elem = $(d.target);
      var bookId = elem.attr("href").split("#")[1]
      window.currentBook = bookId;
      $(".page").hide();
      $("#checkout_book").show();
      return false;
    },
    checkOutBook: function(event) {
      var self = this;
      event.preventDefault();
      var formData = $("#checkout_book_form").serialize();
      console.log(formData);

      //for now Backbone.save gives errors so lets just POST manually
      $.ajax({
        url: "http://rkyve.herokuapp.com/books/" + window.currentBook + ".json",
        dataType: 'json',
        contentType: 'application/json',
        type: "PUT",
        data: JSON.stringify({ id: window.currentBook, borrower: formData.split("=")[1] }),
        success: function() {
          self.shelf.render();
          $("#viewBooksButton").trigger("click");
        }
      });
      //TODO: see if we can do the above with native Backbone
      //var book = new Book({
        //id: window.currentBook,
        //borrower: formData.split("=")[1]
      //});
      //book.save({wait: true});
    }
  });

  $(function() {
    var app = new AppView();
  });
});
