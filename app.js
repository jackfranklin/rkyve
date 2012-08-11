require(['backbone'], function (Backbone) {

  var Book = Backbone.Model.extend({
    defaults: { borrower: null },
	url: "http://rkyve.herokuapp.com/books"
  });

  var Shelf = Backbone.Collection.extend({ model: Book });

  var test_books = [
    { id: 1, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: null },
    { id: 2, title: "Beginning Ruby", owner: "Jack Franklin", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 3, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 4, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 5, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" }
  ];

  var bookShelf = new Shelf(test_books);

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

  var ShelfView = Backbone.View.extend({
    el: $("#all_books ul"),
    initialize: function() {
      this.collection = bookShelf;
      this.render();
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
      this.shelf.render();
    },
	events:{
		"click #addBookButton" : "showAddBook",
		"click #viewBooksButton" : "showViewBooks",
		"submit #addBookForm" : "addBook"
	},
	showAddBook : function(){
		$(".page").hide();
		$("#add_book").show();
		return false;
	},
	showViewBooks : function() {
		$(".page").hide();
		$("#all_books").show();
		return false;
	},
	addBook : function() {
		var formValues = $("addBookForm").serialize();
		var newBook = new Book();
		newBook.save({
			'title' : formValues.title,
			'owner' : formValues.owner,
			'location' : formValues.location
		});
		
		return false;
	}
	
  });


  $(function() {
    var app = new AppView();
  });




});
