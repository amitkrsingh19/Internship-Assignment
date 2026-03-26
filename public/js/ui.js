import { state, setToken } from "./state.js";
import {
  register,
  login,
  getTodos,
  createTodo,
  markTodoDone,
  removeTodo,
} from "./api.js";

// elements
const nav = document.querySelector('nav')
const header = document.querySelector('header')
const main = document.querySelector('main')
const navElements = document.querySelectorAll('.tab-button')
const authContent = document.getElementById('auth')
const textError = document.getElementById('error')
// Keep a short alias because the original code refers to `error`.
const error = textError
const email = document.getElementById('emailInput')
const password = document.getElementById('passwordInput')
const registerBtn = document.getElementById('registerBtn')
const authBtn = document.getElementById('authBtn')
const addTodoBtn = document.getElementById('addTodoBtn')
// const deleteBtn = document.getElementById('')
// const updateBtn = 

let messageTimer = null

function showMessage(msg, type = 'error') {
    if (!msg) return
    if (messageTimer) clearTimeout(messageTimer)

    error.textContent = msg
    error.style.display = 'block'
    error.style.color = type === 'success' ? '#16a34a' : '#dc2626'

    // Auto-hide success a bit faster; keep errors visible briefly.
    const delay = type === 'success' ? 2500 : 3500
    messageTimer = setTimeout(() => {
        error.style.display = 'none'
    }, delay)
}

function showAuth() {
    nav.style.display = 'none'
    header.style.display = 'none'
    main.style.display = 'none'
    authContent.style.display = 'flex'
}

// PAGE RENDERING LOGIC
function showDashboard() {
    nav.style.display = 'block'
    header.style.display = 'flex'
    main.style.display = 'flex'
    authContent.style.display = 'none'
}

function updateHeaderText() {
    const todosLength = state.todos.length
    const newString = state.todos.length === 1 ?
        `You have 1 open task.` :
        `You have ${todosLength} open tasks.`
    header.querySelector('h1').innerText = newString
}

function updateNavCount() {
    navElements.forEach(ele => {
        const btnText = ele.innerText.split(' ')[0]

        // filter todos in here
        const count = state.todos.filter(val => {
            if (btnText === 'All') {
                return true
            }
            return btnText === 'Complete' ?
                val.completed :
                !val.completed
        }).length

        // target inside space and update value
        ele.querySelector('span').innerText = `(${count})`
    })
}

function changeTab(tab) {
    state.selectedTab = tab
    navElements.forEach(val => {
        if (val.innerText.includes(tab)) {
            val.classList.add('selected-tab')
        } else {
            val.classList.remove('selected-tab')
        }
    })
    renderTodos()
}

function renderTodos() {
    // need to add filtering logic in here

    updateNavCount()
    updateHeaderText()

    let todoList = ``
    state.todos.filter(val => {
        return state.selectedTab === 'All'
            ? true
            : state.selectedTab === 'Complete'
                ? val.completed
                : !val.completed
    }).forEach((todo, todoIndex) => {
        const taskIndex = todo.id
        todoList += `
        <div class="card todo-item">
            <p>${todo.task}</p>
            <div class="todo-buttons">
                <button onclick="updateTodo(${taskIndex})" ${todo.completed ? 'disabled' : ''}>
                    <h6>Done</h6>
                </button>
                <button onclick="deleteTodo(${taskIndex})">
                    <h6>Delete</h6>
                </button>
            </div>
        </div>
        `
    })
    todoList += `
    <div class="input-container">
        <input id="todoInput" placeholder="Add task" />
        <button onclick="addTodo()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    `
    main.innerHTML = todoList
}

// showDashboard()

// AUTH LOGIC

async function toggleIsRegister() {
    state.isRegistration = !state.isRegistration
    registerBtn.innerText = state.isRegistration ? 'Sign in' : 'Sign up'
    document.querySelector('#auth > div h2').innerText = state.isRegistration ? 'Sign Up' : 'Login'
    document.querySelector('.register-content p').innerText = state.isRegistration ? 'Already have an account?' : 'Don\'t have an account?'
    document.querySelector('.register-content button').innerText = state.isRegistration ? 'Sign in' : 'Sign up'
}

async function authenticate() {
    // access email and pass values
    const emailVal = email.value
    const passVal = password.value

    // guard clauses... if authenticating, return
    if (
        state.isLoading ||
        state.isAuthenticating ||
        !emailVal ||
        !passVal ||
        passVal.length < 6 ||
        !emailVal.includes('@')
    ) { return }

    // reset error and set isAuthenticating to true
    error.style.display = 'none'
    state.isAuthenticating = true
    authBtn.innerText = 'Authenticating...'

    try {
        const data = state.isRegistration
            ? await register(emailVal, passVal)
            : await login(emailVal, passVal)

        if (!data.token) throw new Error('Authentication succeeded but no token returned.')

        setToken(data.token)
        authBtn.innerText = 'Loading...'

        await fetchTodos()
        showDashboard()
        showMessage(state.isRegistration ? 'Account created successfully.' : 'Logged in successfully.', 'success')

    } catch (err) {
        console.log(err.message)
        showMessage(err.message || 'Authentication failed.', 'error')
    } finally {
        authBtn.innerText = 'Submit'
        state.isAuthenticating = false
    }


}

function logout() {
    // wipe states and clear cached token
    setToken('')
    state.todos = []
    state.selectedTab = 'All'
    state.isRegistration = false
    password.value = ''
    email.value = ''
    error.style.display = 'none'
    showAuth()
}

// CRUD LOGIC

async function fetchTodos() {
    state.isLoading = true
    try {
        const todosData = await getTodos(state.token)
        state.todos = todosData
        renderTodos()
    } catch (err) {
        // Auth failures: go back to login
        if (/token/i.test(err.message || '')) {
            setToken('')
            showAuth()
        }
        showMessage(err.message || 'Failed to load todos.', 'error')
    } finally {
        state.isLoading = false
    }
}

async function updateTodo(index) {
    const todo = state.todos.find(val => val.id === index)
    if (!todo) return

    try {
        const data = await markTodoDone(state.token, index, todo.task)
        showMessage(data.message || 'Todo updated.', 'success')
        await fetchTodos()
    } catch (err) {
        if (/token/i.test(err.message || '')) {
            setToken('')
            showAuth()
        }
        showMessage(err.message || 'Failed to update todo.', 'error')
    }
}

async function deleteTodo(index) {
    try {
        const data = await removeTodo(state.token, index)
        showMessage(data.message || 'Todo deleted.', 'success')
        await fetchTodos()
    } catch (err) {
        if (/token/i.test(err.message || '')) {
            setToken('')
            showAuth()
        }
        showMessage(err.message || 'Failed to delete todo.', 'error')
    }
}

async function addTodo() {
    const todoInput = document.getElementById('todoInput')
    const task = todoInput.value

    if (!task) { return }

    try {
        const data = await createTodo(state.token, task)
        showMessage(data.message || 'Todo added.', 'success')
        todoInput.value = ''
        await fetchTodos()
    } catch (err) {
        if (/token/i.test(err.message || '')) {
            setToken('')
            showAuth()
        }
        showMessage(err.message || 'Failed to add todo.', 'error')
    }
}

if (state.token) {
    async function run() {
        await fetchTodos()
        showDashboard()
    }
    run()
}

window.toggleIsRegister = toggleIsRegister
window.authenticate = authenticate
window.changeTab = changeTab
window.updateTodo = updateTodo
window.deleteTodo = deleteTodo
window.addTodo = addTodo
window.logout = logout