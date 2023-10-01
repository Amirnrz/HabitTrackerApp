////// QUERY_SELECTORS
const habitContainer = document.querySelector(".habit-container")
const habitBtns = document.querySelectorAll(".habit-btn")
const themeBtn = document.querySelector("#theme")
const newHabitBtn = document.querySelector(".new-habit__btn")
const modalContainer = document.querySelector(".modal-container")
const modal = document.querySelector(".modal")
const icons = document.querySelectorAll(".icon")
const habitTitle = document.querySelector("#title")
const addBtn = document.querySelector(".add-habit")
const cancelBtn = document.querySelector(".cancel-habit")
const deleteBtn = document.querySelector("#delete")
const contextmenu = document.querySelector(".context-menu")

let habitTobeDeleted;



////// FUNCTIONS

// Storage related methods
const storage = {
  saveTheme(value) {
    localStorage.setItem('habitsApp.theme', `${value}`)
  },
  checkTheme() {
    return localStorage.getItem('habitsApp.theme')
  },
  saveHabits(object) {
    const currentHabits = storage.getHabits()
    if(!currentHabits || currentHabits === '') {
      localStorage.setItem('habitsApp.habits',JSON.stringify(object))
    } else {
      currentHabits.push(object)
      localStorage.setItem('habitsApp.habits',JSON.stringify(currentHabits))
    }
  },
  getHabits() {
    let currentHabits;
    if(localStorage.getItem('habitsApp.habits') === null) {
      currentHabits = []
    } else {
      currentHabits = JSON.parse(localStorage.getItem('habitsApp.habits'))
    }
    return currentHabits
  },
  habitStatus(id) {
    const currentHabits = storage.getHabits()
    currentHabits.forEach(habit => {
      if(habit.id !== id) return
      habit.completed = !habit.completed
    })
    localStorage.setItem("habitsApp.habits", JSON.stringify(currentHabits))
  },
  deleteHabit(id) {
    const currentHabits = storage.getHabits()

    currentHabits.forEach((habit,idx) => {
      if(habit.id === id) {
        currentHabits.splice(idx,1)
      }
      localStorage.setItem('habitsApp.habits',JSON.stringify(currentHabits))
    })
  }
}


// UI related methods
const UI = {
  theme(){
    themeBtn.classList.toggle('dark')
    document.documentElement.classList.toggle("dark")
    themeBtn.classList.contains("dark")
      ? storage.saveTheme('dark')
      : storage.saveTheme('light')
  },
  openModal() {
    modalContainer.classList.add("active")
    modalContainer.setAttribute('aria-hidden', 'false')
    habitTitle.focus()
  },
  closeModal() {
    modalContainer.classList.remove("active")
    modalContainer.setAttribute('aria-hidden', 'true')
    habitTitle.value = ""
    UI.removeSelectedIcon()
  },
  removeSelectedIcon() {
    icons.forEach(icon => icon.classList.remove("selected"))
  },
  addNewHabit(habit) {
    const { id, Title, icon, completed } = habit
    const habitDiv = document.createElement("div")
    habitDiv.classList.add("habit")
    habitDiv.innerHTML = `
    <button class="habit-btn ${completed === true ? 'complete' : ''} " data-id="${id}" data-title="${Title}" >
      <svg fill="none" width="24" height="24" viewBox="0 0 24 24">
        ${icon}
      </svg>
    </button>
    `
    habitContainer.appendChild(habitDiv)
  },
  refreshHabits() {
    const uiHabits = document.querySelectorAll('.habit')
    uiHabits.forEach(habit => habit.remove())
    const currentHabits = storage.getHabits()

    currentHabits.forEach(habit => {
      UI.addNewHabit(habit)
    })
  },
  deleteHabit(id) {
    const habitToDelete = document.querySelector(`[data-id="${id}"]`)
    habitToDelete.remove()
    UI.refreshHabits()
  }
}

////// EVENTS

// Event: window load
window.addEventListener("DOMContentLoaded", () => {
  // load theme
  const theme = storage.checkTheme()
  if(theme === "dark") UI.theme()

  // update ui
  UI.refreshHabits()
})

// Evenet: habit Completed
habitContainer.addEventListener("click",(e) => {
  if(e.target.classList.contains("habit-btn")) {
    e.target.classList.toggle("complete")
    const currentHabit = e.target.dataset.id
    storage.habitStatus(currentHabit)
  }
})

// Event: dark mode Toggle
themeBtn.addEventListener("click", UI.theme)


// Event: open modal for new habit
newHabitBtn.addEventListener("click", UI.openModal)

// Event: cancel the opened Modal
cancelBtn.addEventListener("click", UI.closeModal)

// Event: selected icon
icons.forEach(icon => {
  icon.addEventListener("click", () => {
    UI.removeSelectedIcon()
    icon.classList.add("selected")
  })
})

// Event: Escape Key for closing modal
window.addEventListener("keydown",(e) =>{
  if(e.code === "Escape") {
    UI.closeModal()
  }
})

// Event: Close the modal if clicked outside of it
modalContainer.addEventListener("click",(e) => {
  if(e.target.classList.contains('modal-container')) {
    UI.closeModal()
  }
})

// Event:  Add a new Habit
addBtn.addEventListener("click", () => {
  const Title = habitTitle.value;
  const iconsArr = [...icons]
  const filteredicon = iconsArr.filter(icon => icon.classList.contains("selected"))

  const habitInformation = {
    Title: Title,
    icon: filteredicon[0].children[0].innerHTML,
    id: crypto.randomUUID(),
    completed: false
  }


  UI.addNewHabit(habitInformation)
  UI.closeModal();
  
  storage.saveHabits(habitInformation)
})

// Event: context menu
habitContainer.addEventListener("contextmenu", (e) => {
  if(!e.target.classList.contains("habit-btn")) return
  e.preventDefault();
  habitTobeDeleted = e.target.dataset.id;
  const { clientX: mouseX, clientY: mouseY } = e
  contextmenu.style.top = `${mouseY + 10}px`
  contextmenu.style.left = `${mouseX}px`
  const contextTitle = document.querySelector("#habitTitle")
  contextTitle.textContent = e.target.dataset.title;
  contextmenu.classList.add("active")
})


// Event: delete habit 
deleteBtn.addEventListener('click',() => {
  storage.deleteHabit(habitTobeDeleted);
  UI.deleteHabit(habitTobeDeleted)
  contextmenu.classList.remove('active')
})
