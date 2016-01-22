courses = new Mongo.Collection('courses-client');

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.create.helpers({
    data: function () {
      return Session.get('data');
    }
  });

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    courses: function() {
      return courses.find().fetch();
    }
  });

  Template.create.events({
    'submit form': function (event) {
      event.preventDefault();

      code = event.target.code.value;
      name = event.target.name.value;

      if(course = courses.findOne({ code:  code})) {
        courses.update({ _id: course._id }, {$set: {name: name, updatedAt: new Date()}});
      }else {
        courses.insert({ code: code, name: name, createdAt: new Date(), updatedAt: new Date() });
      }

      event.target.code.value = '';
      event.target.name.value = '';
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    },
    'click .update': function (event) {
      _id = event.target.dataset.id;
      Session.set('data', courses.findOne({ _id: _id}));
    },
    'click .delete': function (event) {
      _id = event.target.dataset.id;
      courses.remove({_id: _id});
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var ddp = DDP.connect('http://localhost:3030');
    var caller = Meteoris.Sync.Caller.instance(ddp);
    var subscriber = Meteoris.Sync.Subscriber.instance('DSvjND3QWsbxdhBbC', ddp);

    caller.register(courses, 'courses', 'code');
    caller.call();

    subscriber.register(courses, 'courses', 'code');
    subscriber.subscribe();
  });
}
