require(['backbone'], function (Backbone) {

  var Book = Backbone.Model.extend({
    defaults: { borrower: null }
  });

  var Shelf = Backbone.Collection.extend({ model: Book });

  var test_books = [
    { id: 1, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 2, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 3, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 4, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" },
    { id: 5, title: "Code Complete", owner: "Will Hammill", location: "MC 12.2.2", borrower: "Stuart McKee" }
  ];

  var bookShelf = new Shelf(test_books);

  var BookView = Backbone.View.extend({
    tagName: "ul",
    className: "book-individual",
    template: $("#single_book_template").html(),

    render: function() {
      var templ = _.template(this.template);
      this.$el.html(templ(this.model.toJSON()));
      return this;
    }

  });

  var ShelfView = Backbone.View.extend({
    el: $("#all_books"),
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


  $(function() {
    var books = new ShelfView();
  });




});
