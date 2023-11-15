function handleFilterChange(filterName, filterValue) {
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, "", url);
  const todoElementList = getAllTodoElement();
  for (const liElement of todoElementList) {
    const needToShow = isMatch(liElement, url.searchParams);
    liElement.hidden = !needToShow;
  }
}

function isMatch(liElement, params) {
  return (
    isMatchSearch(liElement, params.get("searchTerm")) &&
    isMatchStatus(liElement, params.get("status"))
  );
}

function initFilterInput() {
  //find select
  const filterStatusSelect = document.getElementById("filterStatus");
  if (!filterStatusSelect) return;
  //attach event change
  filterStatusSelect.addEventListener("change", () => {
    handleFilterChange("status", filterStatusSelect.value);
  });
}

function getAllTodoElement() {
  return document.querySelectorAll("#todoList > li");
}

function isMatchStatus(liElement, filterStatus) {
  return filterStatus === "all" || liElement.dataset.status === filterStatus;
}

function isMatchSearch(liElement, searchTerm) {
  if (!liElement) return false;
  if (searchTerm === "") return true;
  const titleElement = liElement.querySelector("p.todo_title");
  if (!titleElement) return false;
  return titleElement.textContent
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
}

function initSearchInput() {
  //find search term input
  const searchInput = document.getElementById("searchTerm");
  if (!searchInput) return;
  //attach change event
  //change and click outside or enter
  searchInput.addEventListener("input", () => {
    handleFilterChange("searchTerm", searchInput.value);
  });
}

function createTodoElement(todo) {
  if (!todo) return null;

  //find template
  const todoTemplate = document.getElementById("todoTemplate");
  if (!todoTemplate) return null;

  //clone li element
  const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  console.log(todoElement);

  //render todo status
  const divElement = todoElement.querySelector("div.todo");

  if (!divElement) {
    return null;
  }
  const alertClass =
    todo.status === "completed" ? "alert-success" : "alert-secondary";
  divElement.classList.add(alertClass);

  //update content where needed
  const titleElement = todoElement.querySelector(".todo_title");
  if (titleElement) titleElement.textContent = todo.title;

  //TDO: attach event for buttons
  //add click event for mark-as-done button
  const markAsDoneButton = todoElement.querySelector("button.mark-as-done");
  if (markAsDoneButton) {
    markAsDoneButton.addEventListener("click", () => {
      const currentStatus = todoElement.dataset.status;
      const newStatus = currentStatus === "pending" ? "completed" : "pending";
      //get current to do list
      //update status of current todo
      // save to local storage
      const todoList = getTodoList();
      const index = todoList.findIndex((x) => x.id === todo.id);
      if (index >= 0) {
        todoList[index].status = newStatus;
        localStorage.setItem("todo_list", JSON.stringify(todoList));
      }
      //update data status on li element
      todoElement.dataset.status = newStatus;

      //update alert class accordingly
      const newAlertClass =
        currentStatus === "pending" ? "alert-success" : "alert-secondary";
      divElement.classList.remove("alert-success", "alert-secondary");
      divElement.classList.add(newAlertClass);
    });
  }

  //add click event for remove button
  const removeButton = todoElement.querySelector("button.remove");
  if (removeButton) {
    removeButton.addEventListener("click", () => {
      //save to local storage
      const todoList = getTodoList();
      const newTodoList = todoList.filter((x) => x.id !== todo.id);
      localStorage.setItem("todo_list", JSON.stringify(newTodoList));

      //remove form dom
      todoElement.remove();
    });
  }

  //add click event for edit button
  const editButton = todoElement.querySelector("button.edit");
  if (editButton) {
    editButton.addEventListener("click", () => {
      //TODO: latest todo data - get from local storage
      const todoList = getTodoList();
      const latestTodo = todoList.find((x) => x.id === todo.id);
      if (!latestTodo) return;

      //populate data to todo form
      populateToDoForm(latestTodo);
    });
  }
  return todoElement;
}

function populateToDoForm(todo) {
  //query todo form
  //dataset-id = todo.id
  const todoForm = document.getElementById("todoFormId");
  if (!todoForm) return;
  todoForm.dataset.id = todo.id;

  //set values for form control
  //set todoText input
  const todoInput = document.getElementById("todoText");
  if (!todoInput) return;
  todoInput.value = todo.title;
}

function renderTodoList(todoList, ulElementId) {
  // Find element
  // loop through todoList
  // each todo -> create li element -> append to ul
  const ulElement = document.getElementById(ulElementId);
  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createTodoElement(todo);
    ulElement.appendChild(liElement);
  }
}

//local storage
function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem("todo_list"));
  } catch (error) {
    return [];
  }
}

//submit form
function handleToDoFormSubmit(event) {
  event.preventDefault(); //avoid reload web
  console.log("Form submit");
  const todoForm = document.getElementById("todoFormId");
  if (!todoForm) return;
  //get form value
  //validate form value
  //save
  //apply DOM changes
  const todoInput = document.getElementById("todoText");
  if (!todoInput) return;

  //determine add or edit mode
  const isEdit = Boolean(todoForm.dataset.id);
  if (isEdit) {
    //find current todo
    const todoList = getTodoList();
    const index = todoList.findIndex(
      (x) => x.id.toString() === todoForm.dataset.id
    );
    if (index < 0) return;

    //update content
    todoList[index].title = todoInput.value;
    //save
    localStorage.setItem("todo_list", JSON.stringify(todoList));
    //apply DOM changes
    //find li element having id
    const liElement = document.querySelector(
      `ul#todoList > li[data-id="${todoForm.dataset.id}"]`
    );
    if (liElement) {
      const titleElement = liElement.querySelector(".todo_title");
      if (titleElement) titleElement.textContent = todoInput.value;
    }
  } else {
    const newTodo = {
      id: Date.now(),
      title: todoInput.value,
      status: "pending",
    };
    console.log(newTodo);

    //save
    const todoList = getTodoList();
    todoList.push(newTodo);
    localStorage.setItem("todo_list", JSON.stringify(todoList));

    //apply DOM changes
    const newLiElement = createTodoElement(newTodo);
    console.log(newLiElement);
    const ulElement = document.getElementById("todoList");
    if (!ulElement) return;
    ulElement.appendChild(newLiElement);
  }

  //reset form
  delete todoForm.dataset.id;
  todoForm.reset();
}

//main
(() => {
  // Convert todoList1 to a JSON string and store it in local storage
  // localStorage.setItem(
  //   "todo_list",
  //   JSON.stringify([
  //     { id: 1, title: "Learn Javascript", status: "pending" },
  //     { id: 2, title: "Learn Java", status: "completed" },
  //     { id: 3, title: "Learn Typescript", status: "pending" },
  //   ])
  // );
  const todoList = getTodoList();
  renderTodoList(todoList, "todoList");
  console.log("Work");
  //register submit event for todo form
  const todoForm = document.getElementById("todoFormId");
  if (todoForm) {
    todoForm.addEventListener("submit", handleToDoFormSubmit);
  }
  initSearchInput();
  initFilterInput();
})();
