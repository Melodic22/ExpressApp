let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
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

/* start of outlook code */

/* lifted from microsoft graph tutorial api */

// Select DOM elements to work with
const authenticatedNav = document.getElementById('authenticated-nav');
const accountNav = document.getElementById('account-nav');
const mainContainer = document.getElementById('main-container');

const Views = { error: 1, home: 2, calendar: 3 };

//function to ease the creation of elements
function createElement(type, className, text) {
    var element = document.createElement(type);
    element.className = className;
  
    if (text) {
      var textNode = document.createTextNode(text);
      element.appendChild(textNode);
    }
  
    return element;
  }

function showAuthenticatedNav(user, view) {
    authenticatedNav.innerHTML = '';
  
    if (user) {
      // Add Calendar link
      var calendarNav = createElement('li', 'nav-item');
  
      var calendarLink = createElement('button',
        `btn btn-link nav-link${view === Views.calendar ? ' active' : '' }`,
        'Calendar');

      calendarLink.setAttribute('onclick', 'getEvents();');
      calendarNav.appendChild(calendarLink);
  
      authenticatedNav.appendChild(calendarNav);
    }
  }


  /*
  function showAccountNav(user) {
    accountNav.innerHTML = '';
  
    if (user) {
      // Show the "signed-in" nav
      accountNav.className = 'nav-item dropdown';
  
      var dropdown = createElement('a', 'nav-link dropdown-toggle');
      dropdown.setAttribute('data-bs-toggle', 'dropdown');
      dropdown.setAttribute('role', 'button');
      accountNav.appendChild(dropdown);
  
      let userIcon = createElement('img', 'rounded-circle align-self-center me-2');
      userIcon.style.width = '32px';
      userIcon.src = 'g-raph.png';
      userIcon.alt = 'user';
      dropdown.appendChild(userIcon);
  
      var menu = createElement('div', 'dropdown-menu dropdown-menu-end');
      accountNav.appendChild(menu);
  
      var userName = createElement('h5', 'dropdown-item-text mb-0', user.displayName);
      menu.appendChild(userName);
  
      var userEmail = createElement('p', 'dropdown-item-text text-muted mb-0', user.mail || user.userPrincipalName);
      menu.appendChild(userEmail);
  
      var divider = createElement('hr', 'dropdown-divider');
      menu.appendChild(divider);
  
      var signOutButton = createElement('button', 'dropdown-item', 'Sign out');
      signOutButton.setAttribute('onclick', 'signOut();');
      menu.appendChild(signOutButton);
    } else {
      // Show a "sign in" button
      accountNav.className = 'nav-item';
  
      var signInButton = createElement('button', 'btn btn-link nav-link', 'Sign in');
      signInButton.setAttribute('onclick', 'signIn();');
      accountNav.appendChild(signInButton);
    }
  }
  
  function showWelcomeMessage(user) {
    // Create jumbotron
    let jumbotron = createElement('div', 'p-5 mb-4 bg-light rounded-3');
  
    let container = createElement('div', 'container-fluid py-5');
    jumbotron.appendChild(container);
  
    let heading = createElement('h1', null, 'JavaScript SPA Graph Tutorial');
    container.appendChild(heading);
  
    let lead = createElement('p', 'lead',
      'This sample app shows how to use the Microsoft Graph API to access' +
      ' a user\'s data from JavaScript.');
      container.appendChild(lead);
  
    if (user) {
      // Welcome the user by name
      let welcomeMessage = createElement('h4', null, `Welcome ${user.displayName}!`);
      container.appendChild(welcomeMessage);
  
      let callToAction = createElement('p', null,
        'Use the navigation bar at the top of the page to get started.');
      container.appendChild(callToAction);
    } else {
      // Show a sign in button in the jumbotron
      let signInButton = createElement('button', 'btn btn-primary btn-large',
        'Click here to sign in');
      signInButton.setAttribute('onclick', 'signIn();')
      container.appendChild(signInButton);
    }
  
    mainContainer.innerHTML = '';
    mainContainer.appendChild(jumbotron);
  }
  
  function showError(error) {
    var alert = createElement('div', 'alert alert-danger');
  
    var message = createElement('p', 'mb-3', error.message);
    alert.appendChild(message);
  
    if (error.debug)
    {
      var pre = createElement('pre', 'alert-pre border bg-light p-2');
      alert.appendChild(pre);
  
      var code = createElement('code', 'text-break text-wrap',
        JSON.stringify(error.debug, null, 2));
      pre.appendChild(code);
    }
  
    mainContainer.innerHTML = '';
    mainContainer.appendChild(alert);
  }*/
  
  function updatePage(view, data) {
    if (!view) {
      view = Views.home;
    }
  
    const user = JSON.parse(sessionStorage.getItem('graphUser'));
  
    //getEvents();
    
    //showAccountNav(user);
    //showAuthenticatedNav(user, view);
  
    switch (view) {
      case Views.error:
        showError(data);
        break;
      case Views.home:
        showWelcomeMessage(user);
        break;
      case Views.calendar:
        //showCalendar(data);
        load(data); //my function
        break;
    }
  }
  
  
  updatePage(Views.calendar);
  
  // function showCalendar(events) {
  //   // TEMPORARY
  //   // Render the results as JSON
  //   var alert = createElement('div', 'alert alert-success');
  
  //   var pre = createElement('pre', 'alert-pre border bg-light p-2');
  //   alert.appendChild(pre);
  
  //   var code = createElement('code', 'text-break',
  //     JSON.stringify(events, null, 2));
  //   pre.appendChild(code);
  
  //   mainContainer.innerHTML = '';
  //   mainContainer.appendChild(alert);
  // }
  
 /* function showCalendar(events) {
    let div = document.createElement('div');
  
    div.appendChild(createElement('h1', 'mb-3', 'Calendar'));
  
    let newEventButton = createElement('button', 'btn btn-light btn-sm mb-3', 'New event');
    newEventButton.setAttribute('onclick', 'showNewEventForm();');
    div.appendChild(newEventButton);
  
    let table = createElement('table', 'table');
    div.appendChild(table);
  
    let thead = document.createElement('thead');
    table.appendChild(thead);
  
    let headerrow = document.createElement('tr');
    thead.appendChild(headerrow);
  
    let organizer = createElement('th', null, 'Organizer');
    organizer.setAttribute('scope', 'col');
    headerrow.appendChild(organizer);
  
    let subject = createElement('th', null, 'Subject');
    subject.setAttribute('scope', 'col');
    headerrow.appendChild(subject);
  
    let start = createElement('th', null, 'Start');
    start.setAttribute('scope', 'col');
    headerrow.appendChild(start);
  
    let end = createElement('th', null, 'End');
    end.setAttribute('scope', 'col');
    headerrow.appendChild(end);
  
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);
  
    for (const event of events) {
      let eventrow = document.createElement('tr');
      eventrow.setAttribute('key', event.id);
      tbody.appendChild(eventrow);
  
      let organizercell = createElement('td', null, event.organizer.emailAddress.name);
      eventrow.appendChild(organizercell);
  
      let subjectcell = createElement('td', null, event.subject);
      eventrow.appendChild(subjectcell);
  
      // Use moment.utc() here because times are already in the user's
      // preferred timezone, and we don't want moment to try to change them to the
      // browser's timezone
      let startcell = createElement('td', null,
        moment.utc(event.start.dateTime).format('M/D/YY h:mm A'));
      eventrow.appendChild(startcell);
  
      let endcell = createElement('td', null,
        moment.utc(event.end.dateTime).format('M/D/YY h:mm A'));
      eventrow.appendChild(endcell);
    }
  
    mainContainer.innerHTML = '';
    mainContainer.appendChild(div);
  }
  
  function showNewEventForm() {
    let form = document.createElement('form');
  
    let subjectGroup = createElement('div', 'form-group mb-2');
    form.appendChild(subjectGroup);
  
    subjectGroup.appendChild(createElement('label', '', 'Subject'));
  
    let subjectInput = createElement('input', 'form-control');
    subjectInput.setAttribute('id', 'ev-subject');
    subjectInput.setAttribute('type', 'text');
    subjectGroup.appendChild(subjectInput);
  
    let attendeesGroup = createElement('div', 'form-group mb-2');
    form.appendChild(attendeesGroup);
  
    attendeesGroup.appendChild(createElement('label', '', 'Attendees'));
  
    let attendeesInput = createElement('input', 'form-control');
    attendeesInput.setAttribute('id', 'ev-attendees');
    attendeesInput.setAttribute('type', 'text');
    attendeesGroup.appendChild(attendeesInput);
  
    let timeRow = createElement('div', 'row mb-2');
    form.appendChild(timeRow);
  
    let leftCol = createElement('div', 'col');
    timeRow.appendChild(leftCol);
  
    let startGroup = createElement('div', 'form-group');
    leftCol.appendChild(startGroup);
  
    startGroup.appendChild(createElement('label', '', 'Start'));
  
    let startInput = createElement('input', 'form-control');
    startInput.setAttribute('id', 'ev-start');
    startInput.setAttribute('type', 'datetime-local');
    startGroup.appendChild(startInput);
  
    let rightCol = createElement('div', 'col');
    timeRow.appendChild(rightCol);
  
    let endGroup = createElement('div', 'form-group');
    rightCol.appendChild(endGroup);
  
    endGroup.appendChild(createElement('label', '', 'End'));
  
    let endInput = createElement('input', 'form-control');
    endInput.setAttribute('id', 'ev-end');
    endInput.setAttribute('type', 'datetime-local');
    endGroup.appendChild(endInput);
  
    let bodyGroup = createElement('div', 'form-group mb-2');
    form.appendChild(bodyGroup);
  
    bodyGroup.appendChild(createElement('label', '', 'Body'));
  
    let bodyInput = createElement('textarea', 'form-control');
    bodyInput.setAttribute('id', 'ev-body');
    bodyInput.setAttribute('rows', '3');
    bodyGroup.appendChild(bodyInput);
  
    let createButton = createElement('button', 'btn btn-primary me-2', 'Create');
    createButton.setAttribute('type', 'button');
    createButton.setAttribute('onclick', 'createNewEvent();');
    form.appendChild(createButton);
  
    let cancelButton = createElement('button', 'btn btn-secondary', 'Cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('onclick', 'getEvents();');
    form.appendChild(cancelButton);
  
    mainContainer.innerHTML = '';
    mainContainer.appendChild(form);
  }

 end of outlook code */


function load(events) {

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

            const dayString = `${i - paddingDays}/${monthIndex + 1}/${year}`;
            //console.log(`daystring ${dayString}`)
            const eventForDay = events.find(e => e.date === dayString);

            //if event.start.dateTime === dayString (need to match the formatting) then display
            for (const event of events) {
                
                 if (moment.utc(event.start.dateTime).format('D/M/YYYY') === dayString) {
                     console.log('match');
                     //display in appropriate way

                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                  
                    eventDiv.innerHTML = '<b>' + event.subject + '</b> ' + `${moment.utc(event.start.dateTime).format('h:mm A')} - ${moment.utc(event.end.dateTime).format('h:mm A')} `;
                    daySquare.appendChild(eventDiv);

                    //their code
                    //  let eventrow = document.createElement('tr');
                    //  eventrow.setAttribute('key', event.id);
                    //  tbody.appendChild(eventrow);
                 
                    //  let organizercell = createElement('td', null, event.organizer.emailAddress.name);
                    //  eventrow.appendChild(organizercell);
                 
                    //  let subjectcell = createElement('td', null, event.subject);
                    //  eventrow.appendChild(subjectcell);
                 
                    //  // Use moment.utc() here because times are already in the user's
                    //  // preferred timezone, and we don't want moment to try to change them to the
                    //  // browser's timezone
                    //  let startcell = createElement('td', null,
                    //    moment.utc(event.start.dateTime).format('M/D/YY h:mm A'));
                    //  eventrow.appendChild(startcell);
                 
                    //  let endcell = createElement('td', null,
                    //    moment.utc(event.end.dateTime).format('M/D/YY h:mm A'));
                    //  eventrow.appendChild(endcell);

                 }
            }

            if (i - paddingDays === date.getDate() && nav === 0) {
                daySquare.id = 'currentDay';
            }

            //if there is an event for the iterative day, display it
            if (eventForDay) {
                //display any locally stored events for that day
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = eventForDay.title;
                daySquare.appendChild(eventDiv);


                //new code to display outlook events
                
            }

            daySquare.addEventListener('click', () => openModal(dayString)); //TODO: call view day function


        } else {
            //padding day
            daySquare.classList.add('padding');
        }

        
        calendar.appendChild(daySquare);
    }
    

} 

function closeModal() {
    eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
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
    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton2').addEventListener('click', closeModal);
    document.getElementById('deleteButton').addEventListener('click', deleteEvent);
    document.getElementById('navToggle').addEventListener('click', myFunction);

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


initEventListeners();
//load();

