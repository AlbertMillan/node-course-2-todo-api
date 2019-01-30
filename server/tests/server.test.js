const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {myTodos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text';

        request(app)
         .post('/todos')
         .send({text})                          // Query
         .expect(200)                           // 1. Test status
         .expect((res) => {
            expect(res.body.text).toBe(text);
         })
         .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((err) => done(err));
         });
    });

    it('should NOT create todo with invalid body data', (done) => {
        request(app)
         .post('/todos')
         .send({})
         .expect(400)
         .end((err, res) => {
            if (err) {
                return done(err);
            }
            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((err) => done(err));
         });
    });
});


describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
         .get('/todos')
         .expect(200)
         .expect((res) => {
             expect(res.body.todos.length).toBe(2);
         })
         .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
         .get(`/todos/${myTodos[0]._id.toHexString()}`)
         .expect(200)
         .expect((res) => {
             expect(res.body.todo.text).toBe(myTodos[0].text);
         })
         .end(done);
    }); 

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();
        request(app)
         .get(`/todos/${hexId}`)
         .expect(404)
         .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
         .get(`/todos/123`)
         .expect(404)
         .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const hexId = myTodos[1]._id.toHexString();

        request(app)
         .delete(`/todos/${hexId}`)
         .expect(200)
         .expect((res) => {
             expect(res.body.todo._id).toBe(hexId);
         })
         .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById(hexId).then((res) => {
                expect(res).toBeNull();
                done()
            }).catch((err) => done(err));
         });
    });

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();
        
        request(app)
         .get(`/todos/${hexId}`)
         .expect(404)
         .end(done);
        
    });

    it('should return 404 if object ID is invalid', (done) => {
        request(app)
         .delete(`/todos/123`)
         .expect(404)
         .end(done);
    });
});


describe('PATCH /todos/:id', (done) => {
    it('should update the todo', (done) => {
        const hexId = myTodos[0]._id.toHexString();
        const text = 'This sould be the new text';
        
        request(app)
         .patch(`/todos/${hexId}`)
         .send({
             text,
             completed: true
         })
         .expect(200)
         .expect((res) => {
             expect(res.body.todo.text).toBe(text);
             expect(res.body.todo.completed).toBe(true);
            //  expect(typeof(res.body.todo.completedAt)).toBe(Number);
         })
         .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = myTodos[1]._id.toHexString();
        const text = 'This sould be the new text!!';
        
        request(app)
         .patch(`/todos/${hexId}`)
         .send({
             text,
             completed: false
         })
         .expect(200)
         .expect((res) => {
             expect(res.body.todo.text).toBe(text);
             expect(res.body.todo.completed).toBe(false);
             expect(res.body.todo.completedAt).toBeNull();
         })
         .end(done);
    });
});


describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
         .get('/users/me')
         .set('x-auth', users[0].tokens[0].token)                // Set header
         .expect(200)
         .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
         })
         .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
         .get('/users/me')
         .expect(401)
         .expect((res) => {
            expect(res.body).toEqual({});
         })
         .end(done);
    });
});

// describe('POST /users', () => {
//     it('should create a user', (done) => {
//         const myEmail = 'example@example.com';
//         const password = '123mnb!';

//         request(app)
//          .post('/users')
//          .send({email: myEmail, password})
//          .expect(200)
//          .expect((res) => {
//              expect(res.headers['x-auth']).not.toBeNull();
//              expect(res.body._id).not.toBeNull();
//              expect(res.body.email).toBe(email);
//          })
//          .end(done);
//     });

//     it('should return validation errors if request invalid', (done) => {

//     });

//     it('should not create user if email in use', (done) => {

//     });
// });

