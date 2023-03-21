
let teachers = JSON.parse(localStorage.getItem("teachers")) || []
const spinner = element("div", {class: "spinner"})
let subjectsTaught = JSON.parse(localStorage.getItem("subjects")) || []


let settings = JSON.parse(localStorage.getItem("settings")) || {}

//display subjects to given node
function displaySubjectsTaught(parent, subjects) {
    parent.innerHTML = "";
    for(let subject of subjects) {
        let input = element("input", {
            type: "checkbox",
            value: subject,
            class: "subject",
            id: subject
        }, {onchange: (e) => changeChipBackground(e)})
        
        let label = element("label", {
            for: subject
        }, null,  input, subject)

        parent.appendChild(label)
    }
}


function createModal(type, idx) {

    let modalContainer = document.querySelector(".modal-container");
    
    let teacher = teachers.find((teacher, i) => idx == i);


    if(type == "teacher") {
        modalContainer.style.display = "block";
        modalContainer.innerHTML = `
        <button class="button cancel-btn" onclick="removeModal('teacher')">✖</button>
        <div class="modal card">
        <div class="icon">👨‍🏫</div>
        <form class="form-control">
            <label for="teacher-name">
                Teacher Name: <br>
                <input type="text" id="teacher-name" placeholder="Mr.Masinde" value="${teacher ? teacher.name : ""}">
            </label>
        </form>
        <div class="form-control">
            <label >Subjects</label>
        </div>
        <div class="subjects-list form-control"></div>
        <div class="form-control">    
            <button class="btn btn-submit" id="save-teacher" onclick="${teacher ? 'updateTeacher('+idx+', '+teacher.id+')' : "saveTeacher()"}">${teacher ? "Update Teacher": "Save Teacher"}</button>
        </div>
    </div>
        `

        displaySubjectsTaught(document.querySelector(".subjects-list"), subjectsTaught.map(subject => subject.title))

        if(teacher)checkStoredValues(modalContainer.querySelectorAll("input[type=checkbox]"), teacher.subjects)

    } else if(type == "subject") {
        modalContainer.style.display = "block";
        modalContainer.innerHTML = `
        <button class="button cancel-btn" onclick="removeModal('subject')">✖</button>
        <div class="modal card">
        <div class="icon">📖</div>
        <div class="form-control">
            <label for="subject-name">
                Subject Name: <br>
                <input type="text" id="subject-name" placeholder="Mathematics">
            </label>
        </div>
        <div class="form-control">
            <label for="subject-title">
                Short Name: <br>
                <input type="text" id="subject-title" placeholder="Maths">
            </label>
        </div>
        <div class="form-control">    
            <button class="btn btn-submit" id="save-subject" onclick="saveSubject()">Save Subject</button>
        </div>
    </div>

        `
    } else if (type == "settings") {

        let {noOfClasses, noOfDaysPerWeek, noOfLessonsPerDay, streams, level, specials} = settings
        modalContainer.style.display = "block";

        modalContainer.innerHTML = `
        <button class="button cancel-btn" onclick="removeModal('settings')">✖</button>
        <div class="modal card">
        <div class="icon">⚙</div>
        <div class="form-control">
            <label for="no-of-classes">
                *No of Classes: <br>
                <input type="number" id="no-of-classes" min="2" placeholder="e.g 2" 
                value="${noOfClasses ? noOfClasses: ""}">
            </label>
        </div>
        <div class="form-control">
            <label for="streams">
                *Streams: <br>
                <input type="text" id="streams"  placeholder="e.g North, South, West" 
                  value="${streams ? streams.join(" "): ""}">
            </label>
        </div>
        <div class="form-control">
            <label for="no-of-lessons-per-day">
                *No of Lessons Per day: <br>
                <input type="number" id="no-of-lessons-per-day" min="1"placeholder="e.g 3" 
                  value="${noOfLessonsPerDay ? noOfLessonsPerDay : "" }">
            </label>
        </div>
        <div class="form-control">
            <label for="no-of-days-per-week">
                *No of Days Per Week: <br>
                <input type="number" id="no-of-days-per-week" min="2" max="7" placeholder="e.g 5" 
                 value="${noOfDaysPerWeek ? noOfDaysPerWeek: ""}">
            </label>
        </div>
        <div class="form-control">
            <label for="level">
                *Level: <br>
                <input type="text" id="level" placeholder="e.g Grade / Form" value="${level ? level : ""}">
            </label>
        </div>
        <div class="form-control">
          <label>Special Subjects</label>
          <div class="subjects-list form-control"></div>
        </div>
        <div class="form-control">    
            <button class="btn btn-submit" id="save-settings" onclick="saveSettings()">Save Settings</button>
        </div>
    </div>
        `

        //display subjects for special

        displaySubjectsTaught(modalContainer.querySelector(".subjects-list"), subjectsTaught.map(subject =>             
             subject.title))

                

            checkStoredValues(modalContainer.querySelectorAll("input[type=checkbox]"), settings.specials ? settings.specials: [])

    
    }    else if (type == "teachers") {
        viewTeachers(modalContainer);
    }
}


function removeModal(type) {
    document.querySelector(".modal-container").style.display = "none";

    //reload to get the updated data
    if(type == "settings" || type == "teacher" || type == "subject" || type == "teachers") {
         subjectsTaught = JSON.parse(localStorage.getItem("subjects")) || []

       settings = JSON.parse(localStorage.getItem("settings")) || {}

       teachers = JSON.parse(localStorage.getItem("teachers")) || []
    }
}


//save Settings

function saveSettings() {
    const noOfClasses = document.getElementById("no-of-classes").value,
          noOfLessonsPerDay = document.getElementById("no-of-lessons-per-day").value,
          noOfDaysPerWeek = document.getElementById("no-of-days-per-week").value,
          specials = document.querySelector(".subjects-list").querySelectorAll("input[type=checkbox]"),
          level = document.getElementById("level").value,
          streams = document.getElementById("streams").value.toLowerCase()

        let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sartuday", "Sunday"]
             
    
   if(noOfClasses == "" || noOfDaysPerWeek == "" || noOfLessonsPerDay == "" || level == "" || streams == "") {
        sendAlert("danger", "Fill in all fields");
        return;
   }

   
   // cppy the properties to settings object
   Object.assign(settings, {noOfClasses: Number(noOfClasses)}, {noOfLessonsPerDay: Number(noOfLessonsPerDay)}, {noOfDaysPerWeek: Number(noOfDaysPerWeek)}, {specials: isChecked(specials)}, {streams: streams.trim().split(/,|\s/)}, {level: level.toLowerCase()}, {days})


   //save to local storage
   localStorage.setItem("settings", JSON.stringify(settings));
   sessionStorage.setItem("settings", JSON.stringify(settings))

   document.body.appendChild(spinner);
     setTimeout(() => { 
    spinner.remove();
    sendAlert("success", "Settings Saved Success");
   }, 1000)

}

//save Subject

function saveSubject() {
    let subjectName = document.getElementById("subject-name");
    let subjectTitle = document.getElementById("subject-title");

    if(subjectName.value.length < 2 || subjectTitle.value.length < 2) {
        sendAlert("danger", "Fields must be atleast one character")
        subjectName.style.borderColor = "orangered"
        subjectTitle.style.borderColor = "orangered"
        return
    }

    let subject = {
        subject: subjectName.value.trim().toLowerCase(),
        title: subjectTitle.value.trim().toLowerCase()
    }
   
    if(has(subjectsTaught, subject)) {
        sendAlert("danger", `${subjectTitle.value} already exists`)
        return
    }
    subjectsTaught.push(subject)
    
    localStorage.setItem("subjects", JSON.stringify(subjectsTaught))
    

    //add spinner 
    document.body.appendChild(spinner)

    setTimeout(() => {
        spinner.remove();
        sendAlert("success", `${subjectTitle.value} has been saved 😀`)
        subjectName.value = ""
        subjectTitle.value = ""
    }, 500)

    subjectsTaught = JSON.parse(localStorage.getItem("subjects")) || []

    displayDraggbleSubjects(subjectsTaught.map(subject => subject.title), document.querySelector(".list-subjects"))
}

//add teacher into teachers list
function saveTeacher() {
    let teacherName = document.getElementById("teacher-name");
    const subjects = isChecked(document.querySelectorAll("input[type=checkbox]"))

    if(teacherName.value.length <= 3 || !subjects.length > 0) {
        sendAlert("danger", "Name must be atleast 3 chars and Select atleast one subject");
      return
    }
      
    //if subjects and name match return
    if(has(teachers.map(teacher => ({subjects: teacher.subjects, name: teacher.name})), {subjects, name: teacherName.value.toLowerCase()})) {
        sendAlert("danger", `${teacherName.value} is already saved`)
        return
    }

    teachers.push({
        id: teachers.length + 1,
        name: teacherName.value.trim().toLowerCase(),
        subjects,
        available: true
    })

    localStorage.setItem("teachers", JSON.stringify(teachers));

    teachers =  JSON.parse(localStorage.getItem("teachers")) || [];
    //add spinner;
    document.body.appendChild(spinner);


    //reset the form
    setTimeout(() => {
        sendAlert("success", `${teacherName.value} Saved success 😀`)
        spinner.remove();
        displaySubjectsTaught(document.querySelector(".subjects-list"), subjectsTaught.map(subject => subject.title));
        teacherName.value = "";
    }, 500)

}
//Helper Dom Functions;

function viewTeachers(modalContainer) {
    modalContainer.style.display = "block";

    modalContainer.innerHTML = `
    <button class="button cancel-btn" onclick="removeModal('teachers')">✖</button>
    <div class="modal card">
    <div class="icon">🏫👨‍🏫</div>
    <h3>Teachers</h3>
    <ul class="teachers-list"></ul>
</div>
    `
    if(teachers.length < 1) {
        modalContainer.querySelector(".teachers-list").appendChild(element("h4", null, null, "No Saved Teachers"))
    }
    teachers.forEach(({id, subjects, name}) => {
        let li = element("li", null, null, id, element("pre", null, null, name), ...subjects.map(subject => element("span", null, null, subject)), element("button", {class: "view-btn"}, {
            onclick: (e) => editTeacher(id)
        }, `Edit 🖊`), element("button", {class: "delete"}, {
            onclick: () => deleteItem(id)
        }, "❌"));

        modalContainer.querySelector(".teachers-list").appendChild(li)
    })
}


//edit teacher details 
function editTeacher(id) {
    removeModal()
    let teacherIndex = teachers.findIndex(teacher => teacher.id == id)
    
    createModal("teacher", teacherIndex)
    
}



function updateTeacher(idx, id) {

    
    let modalContainer = document.querySelector(".modal-container");
    let teacherName = document.getElementById("teacher-name");

    const subjects = isChecked(modalContainer.querySelectorAll("input[type=checkbox]"))

    
    if(teacherName.value.length <= 3 || !subjects.length > 0) {
        sendAlert("danger", "Name must be atleast 3 chars and Select atleast one subject");
      return
    }
    teachers.splice(idx, 1, {id, subjects, available: true, name: teacherName.value})
    
    localStorage.setItem("teachers", JSON.stringify(teachers))

    teachers = JSON.parse(localStorage.getItem("teachers")) || [];
    document.body.appendChild(spinner)
    setTimeout(() => {
        spinner.remove();
        sendAlert("success", `Teacher Id: ${id} updated Success 😀`);
        removeModal();
        createModal("teachers");
    }, 1500)
}


function deleteItem(id) {
    let teacherIdex = teachers.findIndex(teacher => teacher.id == id);
    teachers.splice(teacherIdex, 1);

    teachers.forEach((teacher, idx) => {
        teacher.id = idx + 1
    })
    
    localStorage.setItem("teachers", JSON.stringify(teachers));
    teachers = JSON.parse(localStorage.getItem("teachers"));
    removeModal()
    createModal("teachers")
    sendAlert("success", "Teacher Deleted Success 😀")
}

function sendAlert(type, message) {
    let alert = element("div", {class: `alert ${type}`}, null, message, element("div", {class: "cancel"}, {
        onclick: e => alert.remove()
    }, "✖"))
    document.body.appendChild(alert)

    setTimeout(() => alert.remove(), 5000)


}

function isChecked(inputs) {
    const subjects = []
    inputs.forEach(input => {
        if(input.checked) {
            subjects.push(input.value)
        }
    })
    return subjects
}
function changeChipBackground(event) {
    if(event.target.checked) {
        event.target.parentElement.style.backgroundColor = "purple"
        event.target.parentElement.style.color = "#fff"
    } else {
        event.target.parentElement.style.backgroundColor = "#e6e3e3"
        event.target.parentElement.style.color = "#333"
    }
}
//utils;

function element(type, attrs, props,  ...children) {
    let dom = document.createElement(type);

    if(props) Object.assign(dom, props)
    for(let attr in attrs) {
        dom.setAttribute(attr, attrs[attr])
    }

    for(let child of children) {
        if(typeof child != "string" && typeof child != "number") dom.appendChild(child);
        else dom.appendChild(document.createTextNode(child))
    }
    return dom;
}

function has(arr, obj) {
    for(let ob of arr) {
        if(JSON.stringify(ob) == JSON.stringify(obj)) return true
    }
    return false
}


function checkStoredValues(inputs, array) {

    inputs.forEach(input => {
        if(array.length > 0 && array.includes(input.value)) input.click();
    })
}
