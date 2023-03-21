
const getTeacher =  (teachers, id) => teachers.find(teacher => teacher.id === id)

const subjects = subjectsTaught.map(subject => subject.title);

// let subjects = ["maths", "eng", "kiswa", "geog", "hist", "cre", "bus", "agri", "chem", "phy"];


let work = Object.create(null)
// const weeklyWork = []

//Randomly assigns teachers to classes and teching subject for that class
function assignTeachersToClasses(subjects, noOfClasses, streams) {
    const classTeachers = Object.create(null);

    for(let i = 0; i < noOfClasses; i++) {
        for(let stream of streams){
            classTeachers[`${settings.level}-${i+1}-${stream}`] = selectTeacher(subjects)
        }
    }
    return classTeachers
}

// let teachersGrid = assignTeachersToClasses(subjects, settings.noOfClasses, settings.streams)
let teachersGrid;


//randomly Optimized generated lessons

function generateSession(teachers) {

    
    function isTaught(pClas, subject) {
        for(let clas in work) {
            if(clas == pClas && settings.specials.includes(subject) && !doubleExist(clas) && !isDouble(subject, clas)) return false
            if(clas == pClas && work[clas].includes(subject)) {
                return true;
            }
        }
        return false;
    }

    const lessons = Object.create(null);
    teachers.forEach(teacher => teacher.available = true)

    for(let clas in teachersGrid) {
        let subject, tcherTSubId, teacher, start = Date.now(), now;
        try {
            do {
                subject = getRandomSubject(subjectsTaught.map(sub => sub.title))
                tcherTSubId = teachersGrid[clas].get(subject)
                teacher = getTeacher(teachers, tcherTSubId)
                now = Date.now();
                if((now - start) >= 3000) {
            
                    throw new Error("Please Consider Employing more teachers 😢")
                    
                }

            } while(!teacher || teacher.available != true || isTaught(clas, subject))

            teacher.available = false
            lessons[clas] = {subject, id: tcherTSubId}
            
            //add lesson to work
            addLessonToWorkSpecial(work, subject, clas, settings.specials)
            
        } catch (error) {
            return {
                type: "error",
                message: error.message
            }
        }
            
    }

    return {
        type: "success",
        lessons
    }

}



 function generateTimeTable(lessonsPerDay, daysPerWeek, days) {
    const timeTable = Object.create(null)
    for(let i = 0; i < daysPerWeek; i++) {
        for(let l =  0; l < lessonsPerDay; l++) {
        
            let session =  generateSession(teachers) 
            if(!(days[i] in timeTable)) {
                //if the loop generate session does not give back a session in 5 secs exit the loop 
                if(session.type == "error") {
                    return {type: "error", message: session.message}
                }
                timeTable[days[i]] = [session.lessons]
            } else {
                if(session.type == "error") {
                    return {type: "error", message: session.message}
                }
                timeTable[days[i]].push(session.lessons)
            }        
        }    
        work = Object.create(null);
    }

    return {type: "success", timeTable}
}



//format timetabla data suitable for dom update
function formatTimetableData (timeTable) {
    let days = new Map()
    for(let day in timeTable) {
        let classes = Object.create(null);
        for(let lesson of timeTable[day]) {
            for(let clas in lesson) {
                
                if(!(clas in classes)) {
                    classes[clas] = [lesson[clas]]
                } else {
                    classes[clas].push(lesson[clas])
                }
            }           
        }
        days.set(day, classes)
        
    }
    return days
}




//Logic util Functions

//selects a techer for a given subject
function selectTeacher(subjects) {
    let subjectTeachers = new Map()
    for(let subject of subjects) {
        if(hasTeacher(subject)) {
            subjectTeachers.set(subject, random(teachers, subject).id)
        }
    }
    return subjectTeachers;
}

//random selection of teacher given Subject
function random(teachers, sub) {
    let choice;
    do {
        choice = Math.floor(Math.random() * teachers.length)
    } while(!teachers[choice].subjects.includes(sub))
    
    return teachers[choice]
}
  //gets a randomSubject
function getRandomSubject(subjects) {
    const choice = Math.floor(Math.random() * subjects.length)
    return subjects[choice]
}

//Adds lesson to work meaning the lesson has already been put in the timetable
function addLessonToWork(work, subject, clas) {
    if(!(clas in work)) {
        work[clas] = [subject]
    } else {
        if(!work[clas].includes(subject)) work[clas].push(subject)
    }
}

function addLessonToWorkSpecial(work, subject, clas, specials) {
    if(!(clas in work)) {
        work[clas] = [subject]
    } else {
        if(specials.includes(subject)){
            let count = 0;
           for(let item of work[clas]) {
                if(item == subject) count++
         }
         if(count >= 2) return;
         work[clas].push(subject)
        } else {
            if(!work[clas].includes(subject)) work[clas].push(subject)
        }

    }
}


//get no of doubles in work 
function isDouble(subject, clas) {
    let count = 0;
    for(let sub of work[clas]) {
        if(sub == subject)count++;
    }
    return count > 2;
}

//mock data for a single session
// let mywork  = {
//     "F-1-A" : ['Kiswa', 'CRE', 'Comp', 'Phy', 'Bio', 'Hist', 'Chem', 'Bus', 'Maths'],
//     "F-2-A": ['Maths', 'Phy', 'Bus', 'Kiswa', 'Agri', 'Chem', 'Phy', 'Bio', 'Chem'],
//     "F-3-A": ['Bio', 'CRE', 'Maths', 'Hist', 'Comp', 'Eng', 'Maths', 'Bus', 'Kiswa'],
//     "F-4-A": ['Bio', 'Phy', 'Bio', 'Geog', 'Hist', 'Maths', 'Eng', 'Agri', 'Kiswa']}

//checks whether that day we had a double special lesson
function doubleExist(clas) {

      if(work[clas] && work[clas].length > 0){
        for(let lesson of work[clas]) {
        let count = 0;
        for(let subject of work[clas]) {
            if(lesson == subject) count++
        }
        if(count >= 2) return true;
    }}
    return false
}
//show to the dom the duplicate lesson per day
function duplicate(parent){
    let count = 0
    let defaultColor = window.getComputedStyle(parent).getPropertyValue("background-color")
    for(let child of parent.children) {
        for(let txt of parent.children) {
            if(child.textContent == txt.textContent) {
                count++;
            }
        }
        
        if(count > 1) {
            child.style.backgroundColor = "purple"
            child.style.color = "#fff"
        } else {
            child.style.backgroundColor = defaultColor
            child.style.color = "#333"
        }
        count = 0
    }
}

//check whether and array is changed
function isChanged(array1, array2) {
    for(let i = 0; i < array1.length; i++) {
        for(let j = 0; j < array2.length; j++) {
            if(i == j && array1[i] != array2[j]) return true
        }
    }
    return false
}

//check whether a subject has a teacher who can teach it
// console.log(teachers)
function hasTeacher(subject) {

   for(let teacher of teachers) {
      if(teacher.subjects.includes(subject.toLowerCase())) return true
   }
   return false
}


