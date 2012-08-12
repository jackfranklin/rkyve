
require(['backbone'], function (Backbone) {
  window.currentBook = null;
  function showProcess() {
    $(".alert-info").fadeIn();
  }
  function hideProcess() {
    $(".alert-info").fadeOut();
  }

  function showError(text) {
    text = text || "";
    $(".alert-error").text($(".alert-error").text() + ": " + text).fadeIn();
  }
  function hideError() {
    $(".alert-error").fadeOut();
  }

  var Book = Backbone.Model.extend({
    defaults: { borrower: null },
    url: "http://rkyve-api.herokuapp.com/books"
  });

  var Shelf = Backbone.Collection.extend({
    model: Book,
    url: "http://rkyve-api.herokuapp.com/books.json"
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

  var SearchResultBookView = Backbone.View.extend({
    tagName: "tr",
    template: $("#search_result_template").html(),

    render: function() {
      var templ = _.template(this.template);
      this.$el.html(templ(this.model.toJSON()));
      return this;
    }
  });

  var DetailedBookView = Backbone.View.extend({
    el: "#detailed_view",
    template: $("#detailed_single_book_template").html(),
    render: function() {
      this.$el.html("");
      var templ = _.template(this.template);
      this.$el.html(templ(this.model.toJSON()));
    }
  });

  var SearchShelf = Backbone.View.extend({
    el: $("#search_view table tbody"),
    render: function(collection) {
      var self = this;
      self.$el.html("");
      showProcess();
      collection.each(function(item) {
        var book = new SearchResultBookView({ model: item });
        this.$el.append(book.render().el);
      }, self);
    }
  });

  var bookShelf = new Shelf();
  var ShelfView = Backbone.View.extend({
    el: $("#all_books table tbody"),
    initialize: function() {
      this.collection = bookShelf;
      this.render();
    },
    render: function() {
      var self = this;
      self.$el.html("");
      showProcess();
      bookShelf.fetch({
        success: function() {
          self.collection.each(function(item) {
            this.renderItem(item);
          }, self);
          hideProcess();
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
      "click .checkOutBookButton": "checkOutBook",
      "submit #add_book form": "addBook",
      "click .checkInBookButton": "checkInBook",
      "click .viewIndividualButton": "viewDetailedBook",
      "submit #search_view form": "search"
    },
    search: function(event) {
      event.preventDefault();
      var searchFor = $("#search_for").val();
      var searchBy = $("#search_by").val();
      showProcess();
      hideError();
      if(searchBy == "Tag") {
        var urlForSearch = "http://rkyve-api.herokuapp.com/books/tag.json?tag=" + searchFor;
      } else {
        var urlForSearch = "http://rkyve-api.herokuapp.com/books/" + searchBy.toLowerCase() + ".json?partial=" + searchFor;
      }
      console.log("URL ", urlForSearch);
      $.ajax({
        url: urlForSearch,
        method: "GET",
        dataType: "json",
        contentType: "application/json",
        success: function(d) {
          console.log("SUCCESS", d);
          var searchShelf = new SearchShelf();
          searchShelf.render(new Shelf(d));
          hideProcess();
        },
        error: function(d) {
          console.log("ERROR", d);
          hideProcess();
          showError(d.responseText);
        }
      });
    },
    showCheckOutBook: function(d) {
      var elem = $(d.target);
      var bookId = elem.attr("href").split("#")[1]
      window.currentBook = bookId;
      return false;
    },
    checkOutBook: function(event) {
      var self = this;
      var elem = $(event.target);
      var bookId = elem.attr("href").split("#")[1]
      window.currentBook = bookId;
      event.preventDefault();
      var borrower = prompt("Please enter your name: ");

      showProcess();
      hideError();
      $.ajax({
        url: "http://rkyve-api.herokuapp.com/books/" + window.currentBook + ".json",
        dataType: 'json',
        contentType: 'application/json',
        type: "PUT",
        success: function(d) {
          self.shelf.render();
        },
        error: function(d) {
          showError(d.responseText);
        },
        data: JSON.stringify({ id: window.currentBook, borrower: borrower })
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
        location: $("#bookLocation").val(),
        author: $("#bookAuthor").val()
      };
      console.log(formData);
      showProcess();
      hideError();
      $.ajax({
        url: "http://rkyve-api.herokuapp.com/books.json",
        dataType: 'json',
        contentType: 'application/json',
        type: "POST",
        success: function(d) {
          console.log("SUCCESS", d);
          self.shelf.render();
        },
        error: function(d) {
          console.log("ERROR", d);
          showError(d.responseText);
          self.shelf.render();
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
      showProcess();
      hideError();
      $.ajax({
        url: "http://rkyve-api.herokuapp.com/books/" + window.currentBook + ".json",
        dataType: 'json',
        contentType: 'application/json',
        type: "PUT",
        success: function(d) {
          self.shelf.render();
        },
        error: function() { showError(); },
        data: JSON.stringify({ id: window.currentBook, borrower: null })
      });
    },
    viewDetailedBook: function(event) {
      event.preventDefault();
      var elem = $(event.target);
      var bookId = elem.attr("href").split("#")[1]
      window.currentBook = bookId;
      var item = bookShelf.get(window.currentBook);
      console.log(item);
      var detailedBook = new DetailedBookView({ model: item });
      detailedBook.render();
    }
  });

  $(function() {
    var app = new AppView();
  });
});
