let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const newReservationModal = document.getElementById('newReservationModal');
const editEventModal = document.getElementById('editEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const expandedEventsModal = document.getElementById('expandedEventsModal');
const tabModal = document.getElementById('tabModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('event-title-input');
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function smallScreenSettings() {
    console.log("Screen less than 768px")

    //change labels to shortened form
    this.document.getElementById('monday').innerText = 'Mon';
    this.document.getElementById('tuesday').innerText = 'Tue';
    this.document.getElementById('wednesday').innerText = 'Wed';
    this.document.getElementById('thursday').innerText = 'Thu';
    this.document.getElementById('friday').innerText = 'Fri';
    this.document.getElementById('saturday').innerText = 'Sat';
    this.document.getElementById('sunday').innerText = 'Sun';
}

function standardScreenSettings() {
    console.log("Screen more than 768px")

    //change labels to standard form
    this.document.getElementById('monday').innerText = 'Monday';
    this.document.getElementById('tuesday').innerText = 'Tuesday';
    this.document.getElementById('wednesday').innerText = 'Wednesday';
    this.document.getElementById('thursday').innerText = 'Thursday';
    this.document.getElementById('friday').innerText = 'Friday';
    this.document.getElementById('saturday').innerText = 'Saturday';
    this.document.getElementById('sunday').innerText = 'Sunday';
}

function openModal(date) {
    clicked = date;
    //loop through all events and find any where their date matches the date of the clicked day //replace with database GET requests
    const eventForDay = events.find(e => e.date === clicked);

    if (eventForDay) {  //if there is any events
        document.getElementById('eventText').innerText = eventForDay.title;
        deleteEventModal.style.display = 'block';

    } else {    //if no events for selected day
        newEventModal.style.display = 'block';
        const newEventTitle = document.getElementById('js-new-event-title').innerText = `New event for ${date}`;
    }

    backDrop.style.display = 'block';
}


function load() {

    if (window.matchMedia("(min-width: 768px)").matches) {
        standardScreenSettings();
    } else {
        smallScreenSettings();
    }




    //get current date
    const date = new Date();
    //set month to selected month
    if (nav !== 0) {
        date.setMonth(new Date().getMonth() + nav);
    }
    //current day
    const day = weekdays[date.getDay() % 7 - 1];
    //current month
    const month = months[date.getMonth()];
    
    //current year
    const year = date.getFullYear();



    //set to selected month
    //date.setMonth(date.getMonth() + nav);

    let monthIndex = date.getMonth(); //feb = 1
    monthIndex = monthIndex + nav;

    console.log("Current date " + day, month, year);

    //gets the date before the start of next month (i.e. the last date of the current month)
    const daysInMonth = new Date(year, monthIndex+1, 0).getDate();
    console.log("Days in current month " + daysInMonth);

    const firstDayOfMonth = new Date(year, monthIndex, 1);
    console.log("first day " + firstDayOfMonth);

    
    const paddingDays = firstDayOfMonth.getDay() - 1; //-1 due to view starting on monday
    console.log(paddingDays);

    document.getElementById('monthDisplay').innerText = `${date.toLocaleDateString('en-us', { month: 'long'})} ${year}`;

    //clear current calendar
    calendar.innerHTML = '';

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day'); 


        if (i > paddingDays) {
            //non padding day
            daySquare.innerText = i - paddingDays;

            //creating daystring in the format: mm/dd/yyyy
            const day = `${i - paddingDays}`.padStart(2, '0');
            const month = `${monthIndex + 1}`.padStart(2, '0');

            let dayString = `${day}/${month}/${year}`;
            console.log(`dayString: ${dayString}`);

            //old daystring (deprecated) ----- will have to update how events are stored in local storage
            //dayString = `${i - paddingDays}/${monthIndex + 1}/${year}`;
            //console.log(`daystring ${dayString}`)

            const eventForDay = events.find(e => e.date === dayString);

            if (i - paddingDays === date.getDate() && nav === 0) {
                daySquare.id = 'currentDay';
            }

            //if there is a personal event for the current day in local storage
            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = eventForDay.title;
                daySquare.appendChild(eventDiv);
            }

            //if there is a personal event in the database
            personalEvents.forEach(function(event) {
                console.log(event.date);
                if (event.date === dayString) {
                    //temp display
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.innerText = `${event.title}: ${event.start_time} to ${event.end_time}`;
                    daySquare.appendChild(eventDiv);

                    //eventDiv.addEventListener('click', () => openExpandedEventModal(event));
                }
            })

            //daySquare.addEventListener('click', () => openModal(dayString)); //used for local storage examples //TODO: call view day function 
            daySquare.addEventListener('click', () => openExpandedEventsModal(dayString)); //used for personal events stored in database


        } else {
            //padding day
            daySquare.classList.add('padding');
        }

        
        calendar.appendChild(daySquare);
    }
    

} 

function openExpandedEventsModal(selectedDate) {

    //clear the previous content from the last time modal was opened
    expandedEventsModal.innerHTML = '';

    //events for current day boolean
    let events = false;

    personalEvents.forEach(function(event) {
        if (event.date === selectedDate) {
            events = true;

            //add display element for event
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event-expanded');
            console.log(event);
            
            
            //construct eventDiv text depending on optional values
            let eventSummary = `${event.title}: ${event.start_time}-${event.end_time}`;
            if (event.description) {    eventSummary = eventSummary.concat(`\nDescription: ${event.description}`);     }
            if (event.participants) {   eventSummary = eventSummary.concat(`\nParticipants: ${event.participants}`);    }
            eventDiv.innerText = eventSummary;
            expandedEventsModal.append(eventDiv);
            
            //to edit/delete an event
            eventDiv.addEventListener('click', () => openEditEventModal(event)); //TODO: add this
            
        }
    });

    //if there are events for the current day, show the expanded view modal
    if (events) {
        const heading = document.createElement('h2').innerText = `Events for ${selectedDate}`;
        expandedEventsModal.prepend(heading);

        expandedEventsModal.style.display = 'block';
        backDrop.style.display = 'block';
    } else {    //if no events for current day then open new event modal

        //TEMP (this uses local storage)
        openModal(selectedDate);
        //ACTUAL
        openNewEventModal(selectedDate);
    }

}

function openNewEventModal(date) {

    //newEventModal.style.display = 'block';
    
    tabModal.style.display = 'block';

    backDrop.style.display = 'block';
    document.getElementById("defaultOpen").click();

    document.getElementById('js-new-event-title').innerText = `New event for ${date}`;
    document.getElementById('js-new-reservation-title').innerText = `New reservation for ${date}`;

    document.getElementById('event-date-input').value = date;


    document.getElementById('createButton').addEventListener('click', closeModal);
}

function openEditEventModal(event) {

    expandedEventsModal.style.display = 'none';
    editEventModal.style.display = 'block';
    document.getElementById('js-edit-event-title').innerText = `Edit event for ${event.date}`;

    //hidden value for the database to reference to update record
    document.getElementById('event-id-edit').value = event.event_id;
    //set the new values for updated record
    document.getElementById('event-title-edit').value = event.title;
    event.description ? document.getElementById('event-desc-edit').value = event.description : '';
    document.getElementById('event-loc-edit').value = event.location_id;
    event.participants ? document.getElementById('event-participants-edit').value = event.participants : '';
    document.getElementById('event-start-time-edit').value = event.start_time;
    document.getElementById('event-finish-time-edit').value = event.end_time;

}

function closeModal() {
    //eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    newReservationModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    expandedEventsModal.style.display = 'none';
    tabModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitleInput.value = '';
    clicked = null;
    console.log('close modal called');
    load();
}

function saveEvent() {
    if (eventTitleInput.value) {
        eventTitleInput.classList.remove('error');

        events.push({
            date: clicked,
            title: eventTitleInput.value
        });

        localStorage.setItem('events', JSON.stringify(events));
        closeModal();
    } else {
        eventTitleInput.classList.add('error');
    }
    
    
}

function deleteEvent() {
    //delete current event from storage
    events = events.filter(e => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}

function initEventListeners() {
    document.getElementById('forward_button').addEventListener('click', () => {
        nav++;
        load();
    });
    document.getElementById('back_button').addEventListener('click', () => {
        nav--;
        load();
    });
    document.getElementById('cancelButton').addEventListener('click', closeModal);
    //document.getElementById('saveButton').addEventListener('click', saveEvent);   //deprecated (for local storage only)
    document.getElementById('cancelButton2').addEventListener('click', closeModal);
    document.getElementById('deleteButton').addEventListener('click', deleteEvent);
    document.getElementById('navToggle').addEventListener('click', myFunction);
    backDrop.addEventListener('click', closeModal);

    //event listener for resizing of screen
    window.addEventListener("resize", function() {
        if (window.matchMedia("(min-width: 768px)").matches) {
        standardScreenSettings();
        } else {
        smallScreenSettings();
        }
    });
}

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

/* tab links */
function openForm(evt, formName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(formName).style.display = "block";
    evt.currentTarget.className += " active";


  }

initEventListeners();
load();