const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user')

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'albert@gmail.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'jen@example.com',
        password: 'userTwoPass'
    }
]

const myTodos = [
    {
        _id: new ObjectID(),
        text: 'First test todo'
    }, 
    {
        _id: new ObjectID(),
        text: 'Second test todo',
        completed: true,
        completedAt: 333
    }
];

// Run before each test case
const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(myTodos);
    }).then(() => done());
};


const populateUsers = (done) => {
    User.remove({}).then(() => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    myTodos,
    populateTodos,
    users,
    populateUsers
};
