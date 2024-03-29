let nav = 0;
const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const newReservationModal = document.getElementById('newReservationModal');
const editEventModal = document.getElementById('editEventModal');
//const deleteEventModal = document.getElementById('deleteEventModal');
const expandedEventsModal = document.getElementById('expandedEventsModal');
const tabModal = document.getElementById('tabModal');
//const backDrop = document.getElementById('modalBackDrop');
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
};

function load() {
    console.log("\n\n\nload called");
    console.log(`nav ${nav}`);



    if (window.matchMedia("(min-width: 768px)").matches) {
        standardScreenSettings();
    } else {
        smallScreenSettings();
    }

    //disable and hide reservation tab button if the user is a student account
    if (accountType === 'student') {
        document.getElementById('reservation-tab').innerText = '';
        document.getElementById('reservation-tab').disabled = true;
        document.getElementById('book-slot-window').href="slots";
    } else if (accountType === 'staff') {   //disable book a slot page if user is a staff account
        document.getElementById('book-slot-window').addEventListener('click', () => {
            console.log('clicked');
            alert('Sorry, slots can only be booked by students.');
        });
    };

    // THESE ARE ALL CORRECT
    const date = new Date();    //get current date
    console.log(`date ${date}`);
    if (nav !== 0) {    //set month to selected month
        date.setMonth(new Date().getMonth() + nav); 
    };  
    const day = weekdays[date.getDay() % 7 - 1];    //current day of the selected dd/mm
    console.log(`day ${day}`);
    const month = months[date.getMonth()];  //current month
    console.log(`month ${month}`);
    const year = date.getFullYear();    //current year
    console.log(`year ${year}`);

    let monthIndex = date.getMonth(); //feb = 1
    console.log(`monthIndex ${monthIndex}`);

    //removed this line as monthIndex is already affected by the value of nav in lines 68-70 in if condition
    //monthIndex = monthIndex + nav;
    //console.log(`monthIndex + nav ${monthIndex}`);

    //gets the date before the start of next month (i.e. the last date of the current month)
    const daysInMonth = new Date(year, monthIndex+1, 0).getDate();
    console.log(`daysInMonth ${daysInMonth}`);
    const firstDayOfMonth = new Date(year, monthIndex, 1);    
    console.log(`firstDayOfMonth ${firstDayOfMonth}`);
    // let paddingDays = firstDayOfMonth.getDay() -1; //DEPRECATED
    const paddingDays = (firstDayOfMonth.getDay() + 6) % 7; //-1 due to view starting on monday
    console.log(`padding days ${paddingDays}`);

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

            if (i - paddingDays === date.getDate() && nav === 0) {
                daySquare.id = 'currentDay';
            }

            var moreButton = document.createElement('div');
            // moreButton.classList += 'btn btn-dark btn-sm'; 
            moreButton.classList += 'more-button'
            moreButton.style.display = 'none';
            console.log(`button display set to none`);


            //loop through every event and display
            allEvents.forEach(function(event) {



                if (event.date === dayString) {
                    
                    let eventCount = daySquare.childElementCount + 1;
                    console.log(`eventCount ${eventCount}`);

                    const eventDiv = document.createElement('div');



                    if (eventCount === 5) {
                        console.log(`eventCount = 5`);                                                    
                        console.log(`button display set to block`);
                        moreButton.innerText = `${eventCount-4} more...`;
                        moreButton.style.display = 'block';
                        const hiddenDiv = document.createElement('div');
                        hiddenDiv.classList += 'hiddenDiv';
                        daySquare.append(hiddenDiv);
                        

                    } else if (eventCount > 5) {
                        const hiddenDiv = document.createElement('div');
                        daySquare.append(hiddenDiv);
                        hiddenDiv.classList += 'hiddenDiv';
                        console.log(`event count is more than 5`);
                        moreButton.innerText = `${eventCount-4} more...`;    
                        console.log(`button display set to block`);
                        moreButton.style.display = 'block';                  
                    } 
                    
                    else if (eventCount < 5) {
                        console.log(`eventCount is less than 5`);
                        if (event.title) {  //if is event (not reservation)

                            if (event.title === 'Advisor Meeting') {
                                eventDiv.classList.add('confirmedSlot');
                            } else {
                                eventDiv.classList.add('event');
                            }                            
                            eventDiv.innerText = `${event.title}: ${event.time_start} to ${event.time_finish}`;
    
                            
                            daySquare.appendChild(eventDiv);
    
                        }
    
                        if (event.slot_id) {    //if is a reservation
    
                            eventDiv.classList.add('slot');
                            eventDiv.innerText = `Reserved Slot: ${event.time_start} to ${event.time_finish}`;
                            daySquare.appendChild(eventDiv);
    
                            if (window.matchMedia("(min-width: 768px)").matches) {
                            
                            } else {
                                console.log(`hi`);
                                eventDiv.className += ' compact';
                            }
                        }
                    }
                }
            });

            daySquare.append(moreButton);

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

            const eventBtnCol = document.createElement('button');
            eventBtnCol.classList.add('col-sm-2');
            eventBtnCol.classList.add('btn');
            eventBtnCol.classList.add('btn-danger');
            eventBtnCol.setAttribute('id', 'event-btn-delete');
            eventBtnCol.innerText = 'Delete';  

            console.log(event);
            if (event.slot_id) {

                eventRow.classList += ' expanded-slot';
                //display reservation details
                var eventSummary = `Reserved Slot: ${event.time_start}-${event.time_finish}`;
                

            } else if (event.event_id) {

                if (event.title === "Advisor Meeting") {
                    eventRow.classList += ' expanded-confirmed-slot';
                } else {
                    eventRow.classList += ' expanded-event';
                }

                
                //display event details
                var eventSummary = `${event.title}: ${event.time_start}-${event.time_finish}`;
                if (event.description) {    eventSummary = eventSummary.concat(`\nDescription: ${event.description}`);     }


            }

            //construct location display message
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

            //add event listener for the delete button
            eventBtnCol.addEventListener('click', () => {

                console.log(event.staff_id);

                if (event.host_id === user_id || event.user_id === user_id) {
                    if (confirm("Are you sure you want to delete this event?")) {
                        console.log('remove event');
                        removeEvent(event);
                    };
                } else {
                    alert("Sorry, you can't delete this event as you're not the host.");
                }



            });  

            eventRow.append(eventBtnCol);

            document.getElementById('js-new-event-title').innerText = `Create event for ${selectedDate}`;
            document.getElementById('event-date-input').value = selectedDate;
            document.getElementById('js-new-reservation-title').innerText = `Create reservation for ${selectedDate}`;
            document.getElementById('slot-date-input').value = selectedDate;

            //display event details
            eventCol.innerText = eventSummary;

            
            
        }
    });

    //if there are events for the current day, show the expanded view modal
    if (events) {
        
        const expandedViewModal = new bootstrap.Modal(document.getElementById('expandedViewModal'), {});
        document.getElementById('expandedViewModalLabel').innerText = `Events for ${selectedDate}`;
        expandedViewModal.show();

    } else {    //if no events for current day then open new event modal

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

function removeEvent(event) {

    //create url depending on if event is an event or a reservation
    let url = '';
    if (event.event_id) {
        url = '/calendar/events/' + event.event_id;
    }
    else if (event.slot_id) {
        url = '/calendar/reservations/' + event.slot_id;
    }

    //send delete request to delete event data
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status === 204) {
            window.location.href = "http://localhost:5000/calendar";
        }
        if (response.status === 500) {
            alert("Oops. There was an error while deleting that event. Please try again.")
        }
    })
    .catch((error) => {
        console.log(`Error deleting at ${url}: `, error);
    });
     
};


function initEventListeners() {
    document.getElementById('js-forward-button').addEventListener('click', () => {
        nav++;
        load();
    });
    document.getElementById('js-back-button').addEventListener('click', () => {
        nav--;
        load();
    });

    //event listener for resizing of screen
    window.addEventListener("resize", function() {
        if (window.matchMedia("(min-width: 768px)").matches) {
        standardScreenSettings();
        } else {
        smallScreenSettings();
        }
    });

    document.getElementById('delete-account-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            //send POST request to backend

            fetch('/delete-account/' + user_id, {
            method: 'DELETE',
            headers: {
                'Accept' : 'application/json',
                'Content-Type': 'application/json'
            },
            }).then(response => {
                if (response.status === 204) {
                    //redirect to calendar 
                    window.location.href = "http://localhost:5000/";
                }
                if (response.status === 500) {
                    alert("Oops. There was an error while deleting your account. Please try again.")
                }
            })
            .catch((error) => {
                console.log(`Error deleting at ${url}: `, error);
            });
        }
    })
}

//toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon
function toggleNav() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

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