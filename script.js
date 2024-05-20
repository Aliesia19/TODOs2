const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');
const dialogTODO = document.getElementById("TODO_Dialog");

dialogTODO.addEventListener('close', (e) => {
  document.getElementById('txtNewTODO').value = '';
});

const url = "https://todopr9-default-rtdb.firebaseio.com/.json";
let todos = [];

function newTodo() {
  dialogTODO.showModal();
}

function addTodo() {
  const newTodoInput = document.getElementById('txtNewTODO').value.trim();
  if (!newTodoInput) return; 
  const todo = { checked: false, value: newTodoInput };
  dialogTODO.close();
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo)
  };

  fetch(url, requestOptions)
    .then(Response => Response.json())
    .then(data => {
      if (data && data.name)
        todo.id = data.name;
      todos.push(todo);
      render();
      updateCounter();
    });
}

function loadTodos() {
  fetch(url)
    .then(Response => Response.json())
    .then(data => {
      todos = [];
      for (let key in data) {
        todos.push({ id: key, value: data[key].value, checked: data[key].checked });
      }
      render();
      updateCounter();
    })
    .catch(err => {
      let errors = document.getElementById("Errors");
      errors.style.color = "red";
      errors.textContent = err.message;
    });
}

function renderTodo(todo) {
  return `
    <li class="list-group-item">
      <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${todo.checked ? 'checked' : ''} onchange="checkTodo('${todo.id}')">
      <label for="${todo.id}" id="lb${todo.id}">
        <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">${todo.value}</span>
      </label>
      <button class="btn btn-danger btn-sm float-end" onclick="deleteTodo('${todo.id}')">delete</button>
    </li>
  `;
}

function render() {
  const todoItems = todos.map(renderTodo).join('');
  list.innerHTML = todoItems;
}

function updateCounter() {
  itemCountSpan.innerText = todos.length;
  const uncheckedCount = todos.filter(todo => !todo.checked).length;
  uncheckedCountSpan.innerText = uncheckedCount;
}

function checkTodo(id) {
  const index = todos.findIndex(todo => todo.id === id);
  const checkUrl = `https://todopr9-default-rtdb.firebaseio.com/${id}/checked.json`;
  const requestOptions = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checked: !todos[index].checked })
  };
  fetch(checkUrl, requestOptions)
    .then(Response => {
      if (Response.ok) {
        todos[index].checked = !todos[index].checked;
        updateCounter();
      }
    })
    .catch(err => console.error('Error:', err));
}

function deleteTodo(id) {
  const delUrl = `https://todopr9-default-rtdb.firebaseio.com/${id}.json`;
  const requestOptions = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  };
  fetch(delUrl, requestOptions)
    .then(Response => {
      if (Response.ok) {
        const index = todos.findIndex(todo => todo.id === id);
        todos.splice(index, 1);
        render();
        updateCounter();
      }
    })
    .catch(err => console.error('Error:', err));
}

function saveInLocalStorage() {
  localStorage.setItem('TODOS', JSON.stringify(todos));
}

loadTodos();
