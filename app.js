
require(['backbone'], function (Backbone) {
  window.currentBook = null;

  var Book = Backbone.Model.extend({
    defaults: { borrower: null },
    url: "http://rkyve.herokuapp.com/books"
  });

  var Shelf = Backbone.Collection.extend({
    model: Book,
    url: "http://rkyve.herokuapp.com/books.json"
  });


  var BookView = Backbone.View.extend({
    tagName: "tr",
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
    el: $("#all_books table"),
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
      "click .checkOutBookButton": "showCheckOutBook",
      "submit #add_book form": "addBook",
      "click .checkInBookButton": "checkInBook"
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

      $.ajax({
        url: "http://rkyve.herokuapp.com/books/" + window.currentBook + ".json",
        dataType: 'json',
        contentType: 'application/json',
        type: "PUT",
        success: function(d) {
          self.shelf.render();
          $("viewBooksButton").trigger("click");
        },
        data: JSON.stringify({ id: window.currentBook, borrower: formData.split("=")[1] })
      });
      //var book = new Book({
        //id: window.currentBook,
        //borrower: formData.split("=")[1]
      //});
      //book.save({wait: true});
      //for now Backbone.save gives errors so lets just POST manually
    },
    addBook: function(event) {
      var self = this;
      event.preventDefault();
      var formData = {
        title: $("#bookTitle").val(),
        owner: $("#bookOwner").val(),
        location: $("#bookLocation").val()
      };
      $.ajax({
        url: "http://rkyve.herokuapp.com/books.json",
        dataType: 'json',
        contentType: 'application/json',
        type: "POST",
        success: function(d) {
          self.shelf.render();
          $("#viewBooksButton").trigger("click");
        },
        data: JSON.stringify(formData)
      });
    },
    checkInBook: function(event) {
      var self = this;
      event.preventDefault();
      var elem = $(event.target);
      var bookId = elem.attr("href").split("#")[1]
      window.currentBook = bookId;
      $.ajax({
        url: "http://rkyve.herokuapp.com/books/" + window.currentBook + ".json",
        dataType: 'json',
        contentType: 'application/json',
        type: "PUT",
        success: function(d) {
          self.shelf.render();
          $("viewBooksButton").trigger("click");
        },
        data: JSON.stringify({ id: window.currentBook, borrower: null })
      });
    }
  });

  $(function() {
    var app = new AppView();
  });
});
