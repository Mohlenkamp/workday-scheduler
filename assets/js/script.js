// ---- Globals ---- //
var manualTime

// ---------------- Testing Settings for debug
// Creating a manualTime variable to help debug so we don't wait on the actual time
// var mdate = "2021-05-16";
// var mtime = "07:15";
// manualTime = moment(mdate + ' ' + mtime);

var currentDate = moment().format("dddd, MMM Do")
var currentHour 

//console.log(currentDate)
var tasks = []


// ---- Functions ---- //

function saveTask(taskHour, taskDetail){
   // Add task to local storage array 
   console.log ("Saving to LS:  id: " + taskHour + "  task: " + taskDetail)
    localStorage.setItem(taskHour,taskDetail)
}

function retrieveTask(tasks){
    // Pull tasks back from storage
    console.log("Retrieve task called")
    var taskID
    var detail
    for (i=9; i<18; i++){
        // Loop through all possible stored values
        if (localStorage.getItem(i)){
            // There's a stored value
            detail = localStorage.getItem(i)
            taskID = "#Task" + i.toString()
            $(taskID).html(detail)
        }
    }
}

function taskColors(time){
    // Setting column 2 (task text column) color based on time
    // Time pass should be a string showing only the hours in 24 hour time
    var taskID
    var taskColumn
    var taskLock
    // console.log("bDelay inbound: " + bDelaySet.toString())
    if (!time){
        // if not passing a direct time, we'll use now
        currentHour = moment().format("HH")        
    }
    else{
        currentHour = time
    }
    //console.log("current hour is set to: " + currentHour)
    for (var i=9; i< 18; i++){
        taskID = "#Task" + i.toString()
        taskColumn = taskID + "Col2"
        taskColumn3 = taskID + "Col3"
        taskLock = taskID + "Lock"
        if (i < parseInt(currentHour)){
            // Time is past this task
            $(taskID).addClass("past")
            $(taskID).removeClass("present")
            $(taskID).removeClass("future")
            $(taskColumn).addClass("past")
            $(taskColumn).removeClass("present")
            $(taskColumn).removeClass("future")
            // Change Lock image
            $(taskLock).attr("src", "./assets/images/lock_clock_black_36dp.svg");
            // Change text to non-editable 
            $(taskID).attr("contenteditable", "false")
            // Change column 3 div id to expired
            $(taskColumn3).attr("id","expired")
        }
        else if (i === parseInt(currentHour)){
            // Set this task to critical
            $(taskID).addClass("present")
            $(taskID).removeClass("future")
            $(taskColumn).addClass("present")
            $(taskColumn).removeClass("future")
        }
        else{
            // Set this task to future
            $(taskID).addClass('future')
            $(taskColumn).addClass('future')
        }
    }
}

function lockPressed(target){
    // Update local storage and set content-editable to false on save button change to locked
    // Change content-editable to true if save button status is unlocked
    
    if (!target || target.length < 8){
       // ignore 
    }
    else
    {
        // Anything smaller or undefined can be ignored   
        var imgLockLocation
        var taskID
        var taskImgSrc
        var str = target.substring(target.length-4, target.length)
        var columnID = target.substring(0,6) 
        var taskHourID = target.charAt(4) + target.charAt(5)
        if (isNaN(target.charAt(5))) {
        // Specific case for Task 9 since it's not a 2 digit number
            columnID = "Task9"
            taskHourID = "9"
        }
        
        if (str === "Col3"){
            // User selected a lock/unlock button
            // Determine lock status when pushed -- Looking back, I should've just used the data attribute
            imgLockLocation = "#" + columnID + "Lock"
            taskID = "#" + columnID
            taskImgSrc = $(imgLockLocation).attr("src")
            if (taskImgSrc === ("./assets/images/lock_open_white_36dp.svg")){
                // User toggled from unlock to lock
                // Set to lock image
                $(imgLockLocation).attr("src","./assets/images/lock_black_36dp.svg")
                // Make uneditable
                $(taskID).attr("contenteditable", "false")
                //Save data to localStorage
                saveTask(taskHourID, $(taskID).text())
            }
            else if ($(imgLockLocation).attr("src") === "./assets/images/lock_black_36dp.svg"){
                // User toggled from lock to unlock
                // Set to unlock image
                $(imgLockLocation).attr("src","./assets/images/lock_open_white_36dp.svg")
                // Make editable
                $(taskID).attr("contenteditable", "true")
            }
            else{
                 //This shouldn't happen
                 console.log("lockPressed error check: " + $(imgLockLocation).attr(src).toString())
            }
        }
    }
}


// ---- Main Script Starts Here ---- //

// Add current time to jumbotron
$("#currentDay").html(currentDate)

// Retrieve or Initialize Tasks from Local Storage
retrieveTask()

// Setting timer intervals for waiting
var endOfDay = moment({hour: 18, minute: 1})
if (!manualTime){
    //No manual time set, so use now
    manualTime = moment()
}
var dayInterval = moment.duration(endOfDay.diff(manualTime))
console.log ("Hours: ",dayInterval.hours())
console.log ("Minutes: ",dayInterval.minutes())
// Setting variables to prevent moment object problem
var currentTimeHours = manualTime.hour()
var remainingTimeHours = dayInterval.hours()
var remainingTimeMinutes = 60 - dayInterval.minutes()
var timeoutDelay
timeoutDelay = ((parseInt(remainingTimeMinutes)) * 60 * 1000) - 2000 // Number of minutes for delay minus a couple seconds to be sure
// Initial color check if it's not already past 6pm
if (remainingTimeHours >=0 && remainingTimeMinutes >=0){
    taskColors(currentTimeHours)
}

//remainingTimeMinutes = 2 //----------  testing setting only!

// Interval should run until 6pm
var dayTimer = setInterval(function() {
    if (remainingTimeMinutes > 1){
        remainingTimeMinutes = remainingTimeMinutes - 1
        console.log("Remaining minutes until check: " + remainingTimeMinutes.toString())
    }
    else if (remainingTimeHours >= 0){
        // This means we should check to see if the colors need to be changed
            currentTimeHours ++
            remainingTimeHours --
            remainingTimeMinutes = 60
            // remainingTimeMinutes = 2 //---------------  testing setting only!
            taskColors(currentTimeHours)
            console.log("Checked colors")
    }    
    else{
         // this means the timer has expired and the scheduler is no longer needed
      clearInterval(dayTimer)
      //Flush localStorage for tomorrow
        localStorage.clear()
    }
}, (60*1000));


// Event Listeners

// Listen for any click inside a div because I don't know if the user
// will pick the image or the column
$("div").on( "click", function() {
    console.log( $(this).attr("id"))
    lockPressed($(this).attr("id"))
});
