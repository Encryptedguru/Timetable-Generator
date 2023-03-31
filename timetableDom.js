let  undoList = JSON.parse(sessionStorage.getItem("undoList")) || []

displayTimeTable(undoList)

//from session
function displayTimeTable(undoList, type) {
    if(undoList.length < 1) return;
    settings = JSON.parse(sessionStorage.getItem("settings")) || JSON.parse(localStorage.getItem("settings")) || {}
    teachersGrid = formatTeachersGrid(JSON.parse(sessionStorage.getItem("teachersGrid")));
    creatingTable(undoList[undoList.length-1], settings)
    if(type && undoList.length > 1)  {
        undoList.pop();
        sessionStorage.setItem("undoList", JSON.stringify(undoList));
    }
    indicateCollisions(document.getElementById("timetable"), settings.noOfClasses * settings.streams.length)
}
//creating the draggable subjects to manually tweak the timetable
function displayDraggbleSubjects(subjects, parent) {
    if(subjects.length > 0) {
        parent.innerHTML = ""
    }
    for(let subject of subjects) {
        parent.appendChild(elt("li", {
            ondragstart: (e) => dragStart(e),
            draggable: true,
            id: subject
        }, subject, element("div", {class: "remove-subject", title: `Delete ${subject.toUpperCase()}`}, 
        {   
            onclick: e => deleteSubject(subject)
        }, "❌")))
    }
}

displayDraggbleSubjects(subjectsTaught.map(subject => subject.title), document.querySelector(".list-subjects"))

//Build Dom for timetable
//Build Dom does not support drag functionality
function buildDOM(days, parent) {
    let table = elt("table")
    for(let [day, lessons] of days) {    
        table.appendChild(elt("h4", null, day.toUpperCase()))
         for(let clas in lessons) {        
            let tr = elt("tr", {}, elt("th", null, clas), ...lessons[clas].map(lesson => elt("td", null, lesson.subject, elt("span", null, lesson.id))))            
            duplicate(tr)
            table.appendChild(tr)
         }
         table.appendChild(elt("br"))
    }
    parent.appendChild(table)
}
 
//BuildDomWriter >> 
 async function buildDOMWritter(days, parent) {
    parent.innerHTML = "";
    let htmlCont = document.querySelector("html");

    let table = elt("table", {id: "timetable"});

    function buildLesson(lesson, idx) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
               resolve(elt("td",  {
                draggable: true,
                //we add +1 to the idx to cater for tr heading for clas
                ondragstart: (e) => dragStart(e, idx+1),
                ondragover: (e) => dragOver(e, idx+1),
                ondrop: (e) => drop(e, idx+1),
                ondragenter: (e) => dragEnter(e),
                ondragleave: (e) => dragLeave(e),
                onmouseenter: (e) => showTeacher(e),
                onmouseleave: (e) => hideTeacher(e)
               }, lesson.subject, elt("span", null, lesson.id)))
            }, 70)
        })
    }
    for(let [day, lessons] of Array.from(days)) {
        table.appendChild(elt("h4", null, day.toUpperCase()))
            let lessonKeys = Object.keys(lessons)
         for(let id = 0; id < lessonKeys.length; id++) {
              let tr = elt("tr", {
                id: `${day.substring(0, 3)}-${id}`
              }, elt("th", null, lessonKeys[id]))
                for(let i = 0; i < lessons[lessonKeys[id]].length; i++)  {
                    
                    let td = await buildLesson(lessons[lessonKeys[id]][i], i)
                    tr.appendChild(td)
                    duplicate(tr)
                    table.appendChild(tr)
                    parent.appendChild(table)
                    

                    //auto scroll
                    
                    htmlCont.scrollTop = htmlCont.scrollHeight - window.innerHeight
                } 
         }
         generateBtn.disabled = false
    }

    //save fo undo
    saveTimeTable("timetable", "undo")
}

//Display Dom
// buildDOM(formatTimetableData(timeTable), document.body)


 function getTimetable() {
    document.body.appendChild(spinner)
    generateBtn.disabled = true

    let {noOfClasses, noOfDaysPerWeek, noOfLessonsPerDay, streams, level, days} = settings;
 
    if(!noOfClasses || !noOfDaysPerWeek || !noOfLessonsPerDay || !streams || !level || !days || !subjectsTaught || !teachers) {
        spinner.remove();
        sendAlert("danger", "Finish setting up settings to generate timetable ");
        generateBtn.disabled = false
        return;
    }
    if(teachers.length < settings.noOfClasses * settings.streams.length) {
        setTimeout(() => {
            spinner.remove()
            sendAlert("danger", "Could not generate timetable add more teachers")
        generateBtn.disabled = false
               
        }, 1000)
        return
    }
     sessionStorage.setItem("teachersGrid", JSON.stringify(formatTGridForStorage(assignTeachersToClasses(subjectsTaught.map(subject => subject.title), settings.noOfClasses, settings.streams))))
    

    teachersGrid = formatTeachersGrid(JSON.parse(sessionStorage.getItem("teachersGrid")))
    
    
    const timeTable = generateTimeTable(noOfLessonsPerDay, noOfDaysPerWeek, days)


     if(timeTable.type == "error") {

        setTimeout(() => {
            spinner.remove()
            sendAlert("danger", timeTable.message)
        generateBtn.disabled = false

        }, 3000)
        return
     }

     sendAlert("success", "Getting your timetable ready");

     
    setTimeout(() => {

        spinner.remove()
        buildDOMWritter(formatTimetableData(timeTable.timeTable), document.querySelector(".container"));
        enableCtrs();
            
        
    }, 4000)


    // enable save and download button
    // function attempt(n) {
    //     let result = generateTimeTable(settings.noOfLessonsPerDay, settings.noOfDaysPerWeek, settings.days)

    //     if(result.type == "error" && n < 3) {
    //         attempt(n+1)
    //     } else  if(result.type == "success") {
    //         return result
    //     }
    //     return result;
    // }
}


//Dom Functions
let dragConfig = Object.create(null);
function dragStart(e, idx ) {
    let target = e.target.nodeName.toLowerCase() == "span" ? e.target.parentElement.parentElement : e.target.parentElement
    // draging from the the drag box (tweak tool)
      if(target.nodeName.toLowerCase() != "tr" ) {
        target = e.target
        dragConfig.subject = e.target.id
        
    }
    if(target.nodeName.toLowerCase() == "tr") {
        dragConfig.idx = idx 
        dragConfig.subject = Array.from(target.children)[idx].innerText.split(/\d|\s/)[0].trim().toLowerCase()
        dragConfig.id = target.id
        dragConfig.clas = target.children[0].innerText.toLowerCase();

        // console.dir(target.children[idx])
    }
}

function dragEnter(e) {
    let td = e.target.nodeName.toLowerCase() == "span" ? e.target.parentElement : e.target;
    
    td.classList.add("valid")
}

function dragLeave(e) {
    e.preventDefault();
    let td = e.target.nodeName.toLowerCase() == "span" ? e.target.parentElement : e.target

    if(td.classList.contains("valid")) {
        td.classList.remove("valid");
    }
}

function dragOver(e) {
    e.preventDefault()
    e.dataTransfer.dragEffect = "move"
    
}
function drop(e, idx) {

    e.preventDefault();
    let target;
    try {
        let storedTimetable = JSON.parse(localStorage.getItem("timetable"));

       target =  e.target.nodeName.toLowerCase() == "span" ? e.target.parentElement.parentElement : e.target.parentElement;


     //works if dragged from dragBox
      if(!("id" in dragConfig)) {
        let td = e.target.nodeName.toLowerCase() == "span" ? e.target.parentElement : e.target;
        let clas = Array.from(target.children)[0].innerText.toLowerCase();

    
        //get the id for id subject being dragged for that class
        let teacherId = teachersGrid[clas].get(dragConfig["subject"])

        if(!teacherId) {
            sendAlert("danger", "You don't have a teacher teaching "+dragConfig["subject"].toUpperCase())
            return
        }
        td.innerHTML = `${dragConfig["subject"]}<span>${teacherId}</span>`
            
        //indicate double lessons
        duplicate(td.parentElement)
        //show item was changed
        changedDom(td, "dodgerblue")
        // indicateCollisions(document.querySelector("table"), stored ? storedTimetable.settings.noOfClasses * storedTimetable.settings.streams.length :  settings.noOfClasses * settings.streams.length)
    

        

        //save for undo list
        saveTimeTable("timetable", "undo")
        return
    }

    let currTr =  Array.from(target.children)

    //tr of the dragstart
    let tr = Array.from(document.getElementById(dragConfig.id).children) 

    //swap the  items
    
    
    let subject = currTr[idx].innerText.split(/\d|\s/)[0].trim().toLowerCase();
    let clas = currTr[0].innerText.toLowerCase();



    tr[dragConfig["idx"]].innerHTML = `<td>
    ${subject}
    <span>${getTeacherCode(dragConfig["clas"], subject)}</span>
    </td>`
    
    currTr[idx].innerHTML = `
        <td>
            ${dragConfig["subject"]}
            <span>${getTeacherCode(clas, dragConfig["subject"])}</span>
        </td>
    `
            
    } catch (error) {
        
        console.log(error)
    } finally {
        
        //save for undo list
    saveTimeTable("timetable", "undo")
        //indicate collisions
    indicateCollisions(document.querySelector("table"), settings.noOfClasses * settings.streams.length);

    duplicate(target);
    duplicate(document.getElementById(dragConfig["id"]))
    //reset  drag Config
    dragConfig = Object.create(null); 
    }
    

    
}


// keyListeners

window.addEventListener("keyup", (e)  => {
    e.preventDefault();
    
    if(e.keyCode == 83 && e.ctrlKey) {
        saveTimeTable("timetable", "ls")
    }
})



//indicate Changed
function indicateCollisions(table, noOfClasses) {
    const times = table.rows.length / noOfClasses;
    let tracker = 0;
    
    
    function collisionForSession() {
      
      let rows = Array.from(table.rows).slice(noOfClasses * tracker, (noOfClasses * tracker + noOfClasses))    
       if(tracker >= times) return;
       for(let i = 0; i < rows[0]["cells"].length; i++) {  
        let count = 0;  
        for(let j = 0; j < rows.length; j++) {
            let cell = rows[j].cells[i];
            if(cell.localName != "td") continue;
            let currId = Number(cell.querySelector("span").innerText);    
            for(let k = 0; k < rows.length; k++) {
                 let cell = rows[k].cells[i]
                let id = Number(cell.querySelector("span").innerText);    
                if(currId == id) count++
            }
            if(count > 1) {
                cell.querySelector("span").style["backgroundColor"] = "red"
            } else {
                cell.querySelector("span").style["backgroundColor"] = "#ddf"
            }
            count = 0;
        }
    };
    tracker++;
    collisionForSession()
}
    collisionForSession();    
}

let timeout;
function showTeacher(event) {
    timeout = setTimeout(() => {
        let id = Number(event.target.querySelector("span").innerText)
        let teacherName = getTeacher(teachers, id).name;

        event.target.appendChild(elt("samp", null, teacherName))
    }, 2000)
}

function hideTeacher(event) {
    clearTimeout(timeout)
    let samp = event.target.querySelector("samp");
    if(samp) samp.remove();
}

function changedDom(node, color) {
    node.style["borderRight"] = `5px solid ${color}`
}
//creates dom elements;
function elt(type, props, ...children) {
    const dom = document.createElement(type);
    if(props) Object.assign(dom, props)

    for(let child of children) {
        if(typeof child != "string" && typeof child != "number") dom.appendChild(child)
        else dom.appendChild(document.createTextNode(child))
    }
    return dom
}

function saveTimeTable(tableId, where) {
    let table = []
       let tableRows = document.getElementById(tableId);

       if(!tableRows && where == "ls") {
        sendAlert("danger", "Timetable to save does not exist");
        return
       } 
       if(!tableRows) return;

       tableRows = tableRows.rows;
    
       for(let row of tableRows) {
            let rowData = Object.create(null); 
            rowData.id = row.id
            rowData.cells = []
            for(let cell of row.cells) {
               rowData.cells.push(cell.innerHTML)
            }
            table.push(rowData);
            rowData = Object.create(null);
            
        }
        
        
        
        //Map entries cannot be stored in LS evn after Json.stringify ls only store string key-value pairs
        let copy = formatTGridForStorage(teachersGrid)

        
        if(where == "ls") {

            localStorage.setItem("timetable", JSON.stringify({setngs: settings, table,  trsGrid: copy, subjects: subjectsTaught}))
            sendAlert("success", "Timetable saved success");
        } else if(where == "undo"){
            undoList.push(table)
            sessionStorage.setItem("undoList", JSON.stringify(undoList))
            undoList = JSON.parse(sessionStorage.getItem("undoList"))
        }
}

    

    function viewTimeTable() {
        
        
        let {table, setngs, trsGrid, subjects} = JSON.parse(localStorage.getItem("timetable")) || {};
        
        if(!table || !setngs || !trsGrid || !subjects) {
            sendAlert("danger", "There does not exist saved timetable");
            return;
        }
        
        sessionStorage.setItem("settings", JSON.stringify(setngs))
        settings = JSON.parse(sessionStorage.getItem("settings"));
        //format teachersGrid from localStorage
        
        sessionStorage.setItem("teachersGrid", JSON.stringify(trsGrid))

        teachersGrid = formatTeachersGrid(JSON.parse(sessionStorage.getItem("teachersGrid")))
        
            
        //creating table datas;
        
        creatingTable(table, setngs)

        displayDraggbleSubjects(subjects.map(subject => subject.title), document.querySelector(".list-subjects"))
        
        //save for undo
        saveTimeTable("timetable", "undo");

        
    }


    //creating table

    function creatingTable(table, {noOfClasses, streams, days}) {
        let day = 0;
        let container = document.querySelector(".container");
        let  newTable =  elt("table", {id: "timetable"});


        for(let i = 0; i < table.length; i++) {
             let {id, cells} = table[i];
             let tr = elt("tr",{ id}, elt("th", null, cells[0]), ...cells.slice(1).map((cell, idx) => elt("td", {
                 innerHTML: cell,
                 draggable: true,
                 //we add +1 to the idx to cater for tr heading for clas
                 ondragstart: (e) => dragStart(e, idx+1),
                 ondragover: (e) => dragOver(e, idx+1),
                 ondrop: (e) => drop(e, idx+1, true),
                 ondragenter: (e) => dragEnter(e),
                 ondragleave: (e) => dragLeave(e),
                 onmouseenter: (e) => showTeacher(e),
                 onmouseleave: (e) => hideTeacher(e)
             })));
             duplicate(tr)
             if(i % (noOfClasses * streams.length)  == 0) {
                 newTable.appendChild(elt("h4", null, days[day]))
                 day++
             }
           newTable.appendChild(tr)
        }
        container.innerHTML = ""
        container.appendChild(newTable);
        indicateCollisions(newTable, noOfClasses * streams.length)
        enableCtrs();
    }


    function undo() {
        displayTimeTable(undoList, "undo")
        indicateCollisions(document.getElementById("timetable"), settings.noOfClasses * settings.streams.length)
    }



// generate report 
// function generateReport(teachers, settings, subjects) {
//     let {streams, noOfClasses, noOfLessonsPerDay, noOfDaysPerWeek} = settings
//     let noOfLessonsPerWeek = noOfLessonsPerDay * (streams.length * noOfClasses) * noOfDaysPerWeek;
//     let teachersAvailble = new Map();
//    for(let subject of subjects) {
//       teachersAvailble.set(subject, getTeacherForSubject(subject, teachers))
//    }
//    // subjects with less teachers;
//    let least;
//    let gT1 = []
//    for(let subject in Object.fromEntries(teachersAvailble)) {
//         if(least && teachersAvailble.get(least).length < teachersAvailble.get(subject).length) {
//             least = subject;
//             // gT1 = []
        
//         } else {
//             least = subject
//         }
        
//         if (least && teachersAvailble.get(least).length == teachersAvailble.get(subject).length && subject != least) {
//             gT1.push(subject)
//         }
//    }

//    return {noOfLessonsPerWeek, least: {subject: least, noOfTeachers: teachersAvailble.get(least).length}, gT1}
// }

// getTeachers of given subject

function getTeacherForSubject(subject, teachers) {
    let teachersAvailble = []
    for(let teacher of teachers) {
        if(teacher.subjects.includes(subject)) teachersAvailble.push({id: teacher.id})
    }   
    return teachersAvailble;
}

// seach using code

function search(code,  table) {
    code = Number(code)
    if(isNaN(code) || teachers.length < code) {
        sendAlert("danger", "Teacher is not within range");
        return;
    }

    if(!table) {
        sendAlert("danger", "No table for Search");
        return;
    }
    let rows = table.rows;

    for(let row of rows) {
        for(let td of Array.from(row.children).slice(1)) {
            let spanCode = Number(td.querySelector("span").innerText);
            if(code == spanCode) {
                td.style.border = "3px solid orange";
            } else {
                td.style.border = "0px solid transparent"
            }
        }
    }
}



let searchTimeout;
searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout)
     searchTimeout = setTimeout(() => {
        search(e.target.value, document.getElementById('timetable'));
    }, 500)
})


//function deleteSubject

function deleteSubject(subject) {
    let subjectIdx = subjectsTaught.findIndex(sub => sub.title == subject);

    subjectsTaught.splice(subjectIdx, 1);

    localStorage.setItem("subjects", JSON.stringify(subjectsTaught));
  

    displayDraggbleSubjects(subjectsTaught.map(subject => subject.title), document.querySelector(".list-subjects"))

    subjectsTaught = JSON.parse(localStorage.getItem("subjects")) || []
}


function formatTGridForStorage(teachersGrid) {
    let copy = {...teachersGrid}

        for(let clas in copy) {
           copy[clas] = Array.from(copy[clas])
        }

        return copy
}


function formatTeachersGrid(grid) {
    let trsGrid = Object.create(null)
    
    for(let clas in grid) {
        let map = new Map();
        grid[clas].forEach(([key, value]) => {
            map.set(key, value)
        })
        trsGrid[clas] = map;
    }
    return trsGrid;    
}



function getTeacherCode(clas, subject) {
    
    return teachersGrid[clas].get(subject)
}