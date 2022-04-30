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
const bootstrapModal = document.getElementById('bootstrapModal');
const createModal = new bootstrap.Modal(document.getElementById('createModal'), {});
const expandedViewGrid = document.getElementById('expandedViewGrid');
const expandedModalCreateNewButton = document.getElementById('expandedModalCreateNewButton');
//changed from event-title-input temporarily
const eventTitleInput = document.getElementById('event-title-in');
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

// function openModal(date) {
//     clicked = date;
//     //loop through all events and find any where their date matches the date of the clicked day //replace with database GET requests
//     const eventForDay = events.find(e => e.date === clicked);

//     if (eventForDay) {  //if there is any events
//         document.getElementById('eventText').innerText = eventForDay.title;
//         deleteEventModal.style.display = 'block';

//     } else {    //if no events for selected day
//         newEventModal.style.display = 'block';
//         const newEventTitle = document.getElementById('js-new-event-title').innerText = `New event for ${date}`;
//     }

//     backDrop.style.display = 'block';
// }


function load() {

    if (window.matchMedia("(min-width: 768px)").matches) {
        standardScreenSettings();
    } else {
        smallScreenSettings();
    }

    // //show reservation menu on page render if not_staff_member error occured 
    // if (showReservationMenu) {
    //     openForm(event, 'newReservationModal')
    // }




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
        //temp
        //daySquare.type = 'button';
        


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
                    if (event.title === 'Advisor Meeting') {
                        eventDiv.classList.add('confirmedSlot');
                    } else {
                        eventDiv.classList.add('event');
                    }
                    eventDiv.innerText = `${event.title}: ${event.time_start} to ${event.time_finish}`;
                    daySquare.appendChild(eventDiv);

                    //eventDiv.addEventListener('click', () => openExpandedEventModal(event));
                }
            });

            //if there is any reserved slots in the database
            bookedSlots.forEach(function(slot) {
                if (slot.date === dayString) {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('slot');
                    eventDiv.innerText = `Reserved Slot: ${slot.time_start} to ${slot.time_finish}`;
                    daySquare.appendChild(eventDiv);
                }
            })

            //daySquare.addEventListener('click', () => openModal(dayString)); //used for local storage examples //TODO: call view day function 
            //daySquare.addEventListener('click', () => openExpandedEventsModal(dayString)); //used for personal events stored in database
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
    //expandedEventsModal.innerHTML = '';

    //bootstrap
    document.getElementById('expandedViewGrid').innerHTML = '';

    //events for current day boolean
    let events = false;


    //personalEvents.forEach(function(event) {
    allEvents.forEach(function(event) {
        if (event.date === selectedDate) {
            events = true;

            //add display element for event
            // const eventDiv = document.createElement('div');
            // eventDiv.classList.add('event-expanded');
            // console.log(event);
            
            
            // //construct eventDiv text depending on optional values
            // let eventSummary = `${event.title}: ${event.time_start}-${event.time_finish}`;
            // if (event.description) {    eventSummary = eventSummary.concat(`\nDescription: ${event.description}`);     }
            // //TODO: change participants_id to find the name of the participant and display whether they've accepted
            // if (event.participant_id) {   eventSummary = eventSummary.concat(`\nParticipants: ${event.participant_id}`);    }
            // eventDiv.innerText = eventSummary;
            // expandedEventsModal.append(eventDiv);
            
            //to edit/delete an event
            //eventDiv.addEventListener('click', () => openEditEventModal(event)); //TODO: add this
            

            //bootstrap
            const eventRow = document.createElement('div');
            eventRow.classList.add('row');
            eventRow.classList.add('bs-event-expanded');
            expandedViewGrid.append(eventRow);

            const eventCol = document.createElement('div');
            eventCol.classList.add('col-sm-10');
            // eventCol.classList.add('bs-event-expanded');
            eventRow.append(eventCol);

            /* add back in if I need an edit button */
            // const eventBtnEditCol = document.createElement('button');
            // eventBtnEditCol.classList.add('col-2');
            // eventBtnEditCol.classList.add('btn');
            // eventBtnEditCol.classList.add('btn-success');
            // eventBtnEditCol.setAttribute('id', 'event-btn-edit');
            // eventBtnEditCol.innerText = 'Edit';
            // eventRow.append(eventBtnEditCol);
            /* end of edit button code */

            const eventBtnCol = document.createElement('button');
            eventBtnCol.classList.add('col-sm-2');
            eventBtnCol.classList.add('btn');
            eventBtnCol.classList.add('btn-danger');
            eventBtnCol.setAttribute('id', 'event-btn-delete');
            eventBtnCol.innerText = 'Delete';  

            console.log(event);
            if (event.slot_id) {

                //display reservation details
                var eventSummary = `Reserved Slot: ${event.time_start}-${event.time_finish}`;
                if (event.location_id === 1) {
                    eventSummary = eventSummary.concat(`\nLocation: ${event.location_name}`);
                } else if (event.location_name === 'UEA Campus') {
                    eventSummary = eventSummary.concat(`\nLocation: ${event.location_name}, ${event.location_building}, Room ${event.location_room}`);
                } else {
                    //replacing null address values with ''
                    const line2 = event.line_2 === '' ? '' : `${event.line_2},`
                    const line3 = event.line_3 === '' ? '' : `${event.line_3},`
                    const county = event.county === '' ? '' : `${event.county},`
                    const country = event.country === '' ? '' : `${event.country}`
                    eventSummary = eventSummary.concat(`\nLocation: ${event.line_1}, ${line2} ${line3} ${event.city}, ${county} ${event.postcode}, ${country}`);
                }
                
                //TODO: change participants_id to find the name of the participant and display whether they've accepted
                eventBtnCol.addEventListener('click', () => {
                    removeReservation(event);
                });
            } else if (event.event_id) {

                //display event details
                var eventSummary = `${event.title}: ${event.time_start}-${event.time_finish}`;
                if (event.description) {    eventSummary = eventSummary.concat(`\nDescription: ${event.description}`);     }
                //TODO: change participants_id to find the name of the participant and display whether they've accepted
                if (event.participant_id) {   eventSummary = eventSummary.concat(`\nParticipants: ${event.participant_id}`);    }

                eventBtnCol.addEventListener('click', () => {
                    console.log('remove event');
                    //removeEvent(event);
                });  
            }
            eventRow.append(eventBtnCol);

            //document.getElementById('buttonTest').addEventListener('resize', openCreateModal(selectedDate));
            document.getElementById('js-new-event-title').innerText = `Create event for ${selectedDate}`;
            document.getElementById('event-date-input').value = selectedDate;
            document.getElementById('js-new-reservation-title').innerText = `Create reservation for ${selectedDate}`;
            document.getElementById('slot-date-input').value = selectedDate;

            
            

            eventCol.innerText = eventSummary;

            //display reservation details
            
        }
    });

    //if there are events for the current day, show the expanded view modal
    if (events) {
        //const heading = document.createElement('h2').innerText = `Events for ${selectedDate}`;
        // expandedEventsModal.prepend(heading);

        // expandedEventsModal.style.display = 'block';
        // backDrop.style.display = 'block';

        //bootstrap
        
        const expandedViewModal = new bootstrap.Modal(document.getElementById('expandedViewModal'), {});
        document.getElementById('expandedViewModalLabel').innerText = `Events for ${selectedDate}`;
        expandedViewModal.show();

    } else {    //if no events for current day then open new event modal

        //TEMP (this uses local storage)
        //openModal(selectedDate);
        //ACTUAL
        //openNewEventModal(selectedDate);

        //show bootstrap new event and reservation modals and update js elements

        openCreateModal(selectedDate);



    }

}



function openCreateModal(selectedDate) {
    document.getElementById('js-new-event-title').innerText = `Create event for ${selectedDate}`;
    document.getElementById('event-date-input').value = selectedDate;
    document.getElementById('js-new-reservation-title').innerText = `Create reservation for ${selectedDate}`;
    document.getElementById('slot-date-input').value = selectedDate;
    createModal.show();
}

function removeReservation(event) {
    //send delete request to delete event data
    fetch('/calendar/events/' + event.slot_id, {
        method: 'DELETE',
        headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(response => {
        console.log('received response');
        if (response.status === 201) {
            console.log('response successful');
            fetch('/calendar');
        }

    })
    .catch((error) => {
        console.log('Error:', error);
    });
}

function openNewEventModal(date) {

    newEventModal.style.display = 'block';
    
    tabModal.style.display = 'block';

    backDrop.style.display = 'block';
    document.getElementById("defaultOpen").click();

    document.getElementById('js-new-event-title').innerText = `New event for ${date}`;
    document.getElementById('js-new-reservation-title').innerText = `New reservation for ${date}`;

    document.getElementById('event-date-input').value = date;
    document.getElementById('slot-date-input').value = date;


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
    document.getElementById('event-start-time-edit').value = event.time_start;
    document.getElementById('event-finish-time-edit').value = event.time_finish;

}

function closeModal() {
    //eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    newReservationModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    expandedEventsModal.style.display = 'none';
    tabModal.style.display = 'none';
    backDrop.style.display = 'none';
    //eventTitleInput.value = '';
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

// /* tab links */
// function openForm(evt, formName) {
//     // Declare all variables
//     var i, tabcontent, tablinks;
  
//     // Get all elements with class="tabcontent" and hide them
//     tabcontent = document.getElementsByClassName("tabcontent");
//     for (i = 0; i < tabcontent.length; i++) {
//       tabcontent[i].style.display = "none";
//     }
  
//     // Get all elements with class="tablinks" and remove the class "active"
//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++) {
//       tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }
  
//     // Show the current tab, and add an "active" class to the button that opened the tab
//     document.getElementById(formName).style.display = "block";
//     evt.currentTarget.className += " active";


//   }

//controls optional location dropdowns in create event form and create reservation form
function checkIfCustomLocation(form) {

    const locationSelect = document.getElementById(`js-${form}-location`);
    
    const ueaLocInputs = document.getElementById(`js-${form}-extra-uea-location-input`);
    const otherLocInputs = document.getElementById(`js-${form}-extra-other-location-input`);


    //extra input for "UEA Campus"
    const buildingInput = document.getElementById(`${form}-building-input`);
    const roomInput = document.getElementById(`${form}-room-input`);
    
    //extra inputs for "Other"
    const nameInput = document.getElementById(`${form}-loc-name-in`);

    const line1Input = document.getElementById(`${form}-loc-add-1-in`);
    const line2Input = document.getElementById(`${form}-loc-add-2-in`);
    const line3Input = document.getElementById(`${form}-loc-add-3-in`);
    const cityInput = document.getElementById(`${form}-loc-city-in`);
    const countyInput = document.getElementById(`${form}-loc-county-in`);
    const postcodeInput = document.getElementById(`${form}-loc-postcode-in`);
    const countryInput = document.getElementById(`${form}-loc-country-in`);

    if (locationSelect.value == 'Online') {
        //hide extra inputs
        ueaLocInputs.style.display = 'none';
        otherLocInputs.style.display = 'none';

        //disable extra inputs
        buildingInput.disabled = true;
        roomInput.disabled = true;
        
        nameInput.disabled = true;
        line1Input.disabled = true;
        line2Input.disabled = true;
        line3Input.disabled = true;
        cityInput.disabled = true;
        countyInput.disabled = true;
        postcodeInput.disabled = true;
        countryInput.disabled = true;
    } else if (locationSelect.value == 'UEA Campus') {
        //hide extra inputs
        ueaLocInputs.style.display = 'block';
        otherLocInputs.style.display = 'none';

        //disable extra inputs
        buildingInput.disabled = false;
        roomInput.disabled = false;

        nameInput.disabled = true;
        line1Input.disabled = true;
        line2Input.disabled = true;
        line3Input.disabled = true;
        cityInput.disabled = true;
        countyInput.disabled = true;
        postcodeInput.disabled = true;
        countryInput.disabled = true;
    } else if (locationSelect.value == 'Other (Please specify)') {
        //hide extra inputs
        ueaLocInputs.style.display = 'none';
        otherLocInputs.style.display = 'block';

        //disable extra inputs
        buildingInput.disabled = true;
        roomInput.disabled = true;

        nameInput.disabled = false;
        line1Input.disabled = false;
        line2Input.disabled = false;
        line3Input.disabled = false;
        cityInput.disabled = false;
        countyInput.disabled = false;
        postcodeInput.disabled = false;
        countryInput.disabled = false;
    }
}
                             


initEventListeners();
load();