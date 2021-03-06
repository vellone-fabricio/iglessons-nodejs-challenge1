const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);
  if (!userExists) {
    return response.status(404).json({ error: "Username not found!" });
  }

  request.user = userExists;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);
  
  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const newUserInformation = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUserInformation);

  return response.status(201).json(newUserInformation);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "To do not found!" });
  }

  todoExists.title = title;
  todoExists.deadline = deadline;

  return response.status(200).json(todoExists);  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "To do not found!" });
  }

  todoExists.done = true;

  return response.json(todoExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "To do not found!" });
  }

  user.todos.pop(todoExists);

  return response.status(204).send();
});

module.exports = app;